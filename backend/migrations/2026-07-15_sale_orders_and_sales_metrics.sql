
-- =====================================================================
-- Migración: modelo pedido/línea + métricas de rentabilidad en ventas
-- =====================================================================
--
-- CONTEXTO (importante para entender el porqué):
--
-- Los archivos de ventas reales (ej. Ventas_B2C_test.xlsx) separan la
-- información en dos niveles:
--
--   1. CABECERA del pedido  -> 1 fila por pedido  (fecha, canal, cliente,
--      envío, cupón, total, reembolsos...)
--   2. LÍNEAS del pedido    -> N filas por pedido (1 por producto vendido,
--      con cantidad, precio, coste y margen)
--
-- La tabla `sales` actual solo modela "un producto vendido" y guarda
-- todo lo demás en el JSONB `data`. El problema: los nombres de columna
-- del JSONB cambian con cada archivo importado ("Margen (€)", "margin",
-- "profit"...), así que NO se puede hacer GROUP BY fiable sobre JSONB
-- para las gráficas.
--
-- SOLUCIÓN (filosofía del proyecto): columnas tipadas SOLO para lo que
-- se agrega/filtra en estadísticas; el resto sigue viviendo en `data`.
-- El mapping de la UI traduce "nombre de columna del archivo" ->
-- "campo semántico de la tabla", así el import sigue siendo dinámico.
--
-- init.sql solo corre en un volumen nuevo, así que esta migración
-- adapta las bases de datos ya existentes (mismo patrón que
-- 2026-07-13_product_warehouse_location.sql).

BEGIN;

-- =========================================
-- SALE ORDERS (cabeceras de pedido)
-- =========================================

-- Nueva tabla: 1 fila = 1 pedido. Las líneas (tabla `sales`) apuntan
-- aquí vía order_id. Sin esta tabla no se pueden calcular KPIs de
-- nivel pedido: ticket medio, nº de pedidos, gastos de envío,
-- reembolsos... (son datos que NO existen en las líneas).
CREATE TABLE IF NOT EXISTS sale_orders (
    id              SERIAL PRIMARY KEY,

    user_id         INTEGER NOT NULL
                        REFERENCES users(id)
                        ON DELETE CASCADE,

    import_id       INTEGER
                        REFERENCES imports(id)
                        ON DELETE SET NULL,     -- nullable: null si viene de webhook

    -- Identificador del pedido en el sistema origen (ej. 'PV-2025-0001').
    -- Es la CLAVE DE ENLACE: las líneas del archivo traen este mismo
    -- código y así se conecta cada línea con su cabecera.
    order_ref       VARCHAR(64) NOT NULL,

    sold_at         TIMESTAMP NOT NULL,

    -- Dimensiones para agrupar en gráficas (canal de venta, cliente, estado)
    channel         VARCHAR(64),                -- 'Tienda online', 'Amazon', 'TPV tienda'...
    customer_code   VARCHAR(64),                -- código de cliente (ej. 'CLI003')
    payment_status  VARCHAR(32),                -- 'pagado', 'pendiente', 'reembolso_parcial'...

    -- Métricas monetarias del pedido completo (NUMERIC(12,2) = hasta
    -- 9.999.999.999,99 -> dinero NUNCA se guarda en FLOAT por errores
    -- de redondeo binario)
    shipping_total  NUMERIC(12,2) NOT NULL DEFAULT 0,   -- portes cobrados
    discount_total  NUMERIC(12,2) NOT NULL DEFAULT 0,   -- descuentos (cupones + líneas)
    tax_total       NUMERIC(12,2) NOT NULL DEFAULT 0,   -- cuota de IVA
    total           NUMERIC(12,2) NOT NULL,             -- TOTAL cobrado c/IVA
    refunded        NUMERIC(12,2) NOT NULL DEFAULT 0,   -- importe reembolsado
    cost_total      NUMERIC(12,2),                      -- coste de la mercancía
    margin_total    NUMERIC(12,2),                      -- beneficio bruto del pedido

    -- Fila original completa del archivo importado. Permite auditar y
    -- recuperar cualquier campo no mapeado (ciudad, método de pago...)
    data            JSONB,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Un pedido es único por usuario: si se re-importa el mismo archivo
    -- se hace UPSERT (actualizar) en vez de duplicar pedidos.
    CONSTRAINT uq_sale_order_ref UNIQUE (user_id, order_ref)
);

-- Índices pensados para las consultas de estadísticas:
-- por usuario+fecha (series temporales) y por canal (distribución).
CREATE INDEX IF NOT EXISTS idx_sale_orders_user_sold_at ON sale_orders (user_id, sold_at);
CREATE INDEX IF NOT EXISTS idx_sale_orders_channel      ON sale_orders (user_id, channel);

-- =========================================
-- SALES (líneas de venta): nuevas columnas tipadas
-- =========================================

-- order_id enlaza la línea con su cabecera. Es NULLABLE a propósito:
-- las ventas ya existentes (y las que llegan por webhook sin concepto
-- de pedido) siguen funcionando sin cabecera.
ALTER TABLE sales
    ADD COLUMN IF NOT EXISTS order_id   INTEGER
                                        REFERENCES sale_orders(id)
                                        ON DELETE CASCADE;

-- Métricas de la línea. Todas NULLABLE: solo se rellenan si el usuario
-- las mapea al importar. `total` (ya existente) sigue siendo el neto
-- cobrado por la línea; estas columnas añaden el desglose.
ALTER TABLE sales
    ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2),  -- PVP unitario c/IVA
    ADD COLUMN IF NOT EXISTS discount   NUMERIC(12,2),  -- descuento aplicado (€)
    ADD COLUMN IF NOT EXISTS tax_rate   NUMERIC(6,4),   -- tipo de IVA (0.21 = 21%)
    ADD COLUMN IF NOT EXISTS cost       NUMERIC(12,2),  -- coste total de la línea
    -- margin es LA columna clave para clasificar productos potenciales:
    -- beneficio bruto de la línea (neto sin IVA - coste)
    ADD COLUMN IF NOT EXISTS margin     NUMERIC(12,2);

-- Dimensiones de la línea para agrupar sin depender de la cabecera
-- (el archivo de líneas ya trae canal y almacén en cada fila).
ALTER TABLE sales
    ADD COLUMN IF NOT EXISTS channel    VARCHAR(64),
    ADD COLUMN IF NOT EXISTS warehouse  VARCHAR(64);

-- Índices para los GROUP BY de estadísticas
CREATE INDEX IF NOT EXISTS idx_sales_order_id ON sales (order_id);
CREATE INDEX IF NOT EXISTS idx_sales_channel  ON sales (user_id, channel);

COMMIT;
