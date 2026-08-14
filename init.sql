DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- =========================================
-- USERS
-- =========================================

CREATE TABLE users (
    id       SERIAL PRIMARY KEY,
    name     TEXT NOT NULL,
    email    TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- =========================================
-- DYNAMIC CATEGORIES
-- =========================================

CREATE TABLE dynamic_categories (
    id          SERIAL PRIMARY KEY,

    user_id     INTEGER NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

    name        TEXT NOT NULL,
    description TEXT,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- PRODUCTS
-- =========================================

CREATE TABLE products (
    id          SERIAL PRIMARY KEY,

    user_id     INTEGER NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

    category_id INTEGER NOT NULL
                    REFERENCES dynamic_categories(id)
                    ON DELETE CASCADE,

    sku         VARCHAR(64) NOT NULL,
    warehouse   VARCHAR(64) NOT NULL DEFAULT '',
    location    VARCHAR(64) NOT NULL DEFAULT '',
    stock       INTEGER NOT NULL DEFAULT 0,

    data        JSONB NOT NULL,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Un producto se identifica por SKU + almacén + ubicación: el mismo SKU
    -- puede existir en varios almacenes/ubicaciones con su propio stock.
    -- warehouse/location usan '' (no NULL) para que, cuando no se mapean,
    -- la unicidad recaiga de forma limpia solo sobre el SKU.
    CONSTRAINT uq_product_identity UNIQUE (user_id, sku, warehouse, location)
);

CREATE INDEX idx_products_sku   ON products (user_id, sku);
CREATE INDEX idx_products_data  ON products USING GIN (data);

-- =========================================
-- IMPORTS
-- =========================================

CREATE TABLE imports (
    id              SERIAL PRIMARY KEY,

    user_id         INTEGER NOT NULL
                        REFERENCES users(id)
                        ON DELETE CASCADE,

    filename        TEXT,
    source          VARCHAR(64) NOT NULL,   -- 'csv_products', 'csv_sales', 'shopify', etc.
    rows_ok         INTEGER NOT NULL DEFAULT 0,
    rows_failed     INTEGER NOT NULL DEFAULT 0,

    imported_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- SALE ORDERS (cabeceras de pedido)
-- =========================================

-- 1 fila = 1 pedido. Los archivos de ventas reales separan CABECERA
-- (fecha, canal, cliente, envío, total, reembolsos) de LÍNEAS (1 por
-- producto). Esta tabla guarda la cabecera; las líneas viven en `sales`
-- y apuntan aquí vía order_id. Sin ella no hay KPIs de nivel pedido:
-- ticket medio, nº de pedidos, portes, reembolsos...
CREATE TABLE sale_orders (
    id              SERIAL PRIMARY KEY,

    user_id         INTEGER NOT NULL
                        REFERENCES users(id)
                        ON DELETE CASCADE,

    import_id       INTEGER
                        REFERENCES imports(id)
                        ON DELETE SET NULL, -- nullable: null si viene de webhook

    -- Identificador del pedido en el sistema origen (ej. 'PV-2025-0001').
    -- Clave de enlace: las líneas traen este código y así se conectan
    -- con su cabecera.
    order_ref       VARCHAR(64) NOT NULL,

    sold_at         TIMESTAMP NOT NULL,

    -- Dimensiones para agrupar en gráficas
    channel         VARCHAR(64),            -- 'Tienda online', 'Amazon'...
    customer_code   VARCHAR(64),            -- código de cliente ('CLI003')
    payment_status  VARCHAR(32),            -- 'pagado', 'reembolso_parcial'...

    -- Métricas monetarias del pedido (NUMERIC, nunca FLOAT, para
    -- evitar errores de redondeo con dinero)
    shipping_total  NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_total  NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_total       NUMERIC(12,2) NOT NULL DEFAULT 0,
    total           NUMERIC(12,2) NOT NULL, -- TOTAL cobrado c/IVA
    refunded        NUMERIC(12,2) NOT NULL DEFAULT 0,
    cost_total      NUMERIC(12,2),          -- coste de la mercancía
    margin_total    NUMERIC(12,2),          -- beneficio bruto del pedido

    data            JSONB,                  -- fila original del archivo

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Un pedido es único por usuario: re-importar el mismo archivo
    -- hace UPSERT en vez de duplicar.
    CONSTRAINT uq_sale_order_ref UNIQUE (user_id, order_ref)
);

CREATE INDEX idx_sale_orders_user_sold_at ON sale_orders (user_id, sold_at);
CREATE INDEX idx_sale_orders_channel      ON sale_orders (user_id, channel);

-- =========================================
-- SALES (líneas de venta)
-- =========================================

CREATE TABLE sales (
    id          SERIAL PRIMARY KEY,

    user_id     INTEGER NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

    product_id  INTEGER NOT NULL
                    REFERENCES products(id)
                    ON DELETE CASCADE,

    import_id   INTEGER
                    REFERENCES imports(id)
                    ON DELETE SET NULL,     -- nullable: null si viene de webhook

    -- Enlace con la cabecera del pedido. NULLABLE a propósito: ventas
    -- por webhook o imports simples pueden no tener concepto de pedido.
    order_id    INTEGER
                    REFERENCES sale_orders(id)
                    ON DELETE CASCADE,

    source      VARCHAR(64) NOT NULL,       -- 'csv_import', 'shopify_webhook', etc.
    quantity    INTEGER NOT NULL,
    total       NUMERIC(10,2) NOT NULL,     -- neto cobrado por la línea (c/IVA)

    -- Desglose monetario de la línea. Columnas tipadas SOLO para lo que
    -- se agrega/filtra en estadísticas (GROUP BY sobre JSONB no es
    -- fiable: los nombres de columna cambian con cada archivo).
    -- Todas NULLABLE: se rellenan solo si el usuario las mapea.
    unit_price  NUMERIC(12,2),              -- PVP unitario c/IVA
    discount    NUMERIC(12,2),              -- descuento aplicado (€)
    tax_rate    NUMERIC(6,4),               -- tipo de IVA (0.21 = 21%)
    cost        NUMERIC(12,2),              -- coste total de la línea
    margin      NUMERIC(12,2),              -- beneficio bruto: clave para
                                            -- clasificar productos potenciales

    -- Dimensiones de la línea para agrupar sin depender de la cabecera
    channel     VARCHAR(64),
    warehouse   VARCHAR(64),

    sold_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data        JSONB,                      -- payload original de la venta

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_product_id ON sales (product_id);
CREATE INDEX idx_sales_user_id    ON sales (user_id);
CREATE INDEX idx_sales_sold_at    ON sales (sold_at);
CREATE INDEX idx_sales_data       ON sales USING GIN (data);
CREATE INDEX idx_sales_order_id   ON sales (order_id);
CREATE INDEX idx_sales_channel    ON sales (user_id, channel);

-- =========================================
-- INVENTORY MOVEMENTS
-- =========================================

CREATE TABLE inventory_movements (
    id          SERIAL PRIMARY KEY,

    user_id     INTEGER NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

    product_id  INTEGER NOT NULL
                    REFERENCES products(id)
                    ON DELETE CASCADE,

    sale_id     INTEGER
                    REFERENCES sales(id)
                    ON DELETE SET NULL,     -- nullable: puede ser ajuste manual

    type        VARCHAR(32) NOT NULL        -- 'sale', 'restock', 'adjustment', 'return'
                    CHECK (type IN ('sale', 'restock', 'adjustment', 'return')),

    delta       INTEGER NOT NULL,           -- negativo en ventas, positivo en restock
    stock_after INTEGER NOT NULL,           -- stock resultante tras el movimiento

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movements_product_id ON inventory_movements (product_id);
CREATE INDEX idx_movements_sale_id    ON inventory_movements (sale_id);