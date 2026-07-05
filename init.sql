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
    stock       INTEGER NOT NULL DEFAULT 0,

    data        JSONB NOT NULL,

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_product_sku UNIQUE (user_id, sku)
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
-- SALES
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

    source      VARCHAR(64) NOT NULL,       -- 'csv_import', 'shopify_webhook', etc.
    quantity    INTEGER NOT NULL,
    total       NUMERIC(10,2) NOT NULL,

    sold_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data        JSONB,                      -- payload original de la venta

    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_product_id ON sales (product_id);
CREATE INDEX idx_sales_user_id    ON sales (user_id);
CREATE INDEX idx_sales_sold_at    ON sales (sold_at);
CREATE INDEX idx_sales_data       ON sales USING GIN (data);

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