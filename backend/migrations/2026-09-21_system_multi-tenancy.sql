-- =====================================================================
-- Migración: multi-tenancy — cada usuario existente se convierte en un
-- tenant propio (1:1) y todos sus datos se re-etiquetan con tenant_id.
-- =====================================================================
--
-- ESTRATEGIA DE PRESERVACIÓN:
--   1. Se crean las tablas `tenants` y `tenant_members`.
--   2. Por cada fila de `users` se crea UN tenant (slug = 'user-<id>' para
--      poder unir sin columnas temporales) y el usuario queda como 'owner'.
--   3. Se añade `tenant_id` a las 6 tablas de datos y se rellena desde el
--      owner de cada user_id (backfill vía tenant_members).
--   4. Las restricciones de unicidad de negocio pasan de (user_id, ...) a
--      (tenant_id, ...): el "grano" del aislamiento ya es el tenant.
--
-- IMPORTANTE: `user_id` NO se elimina de las tablas de datos. Se conserva
-- como "creado por" y para no romper el código actual durante la transición.
-- El backend debe migrarse a filtrar por tenant_id (ver AUDITORIA_MULTITENANCY.md).
--

-- =========================================
-- 1) TABLAS DE TENANCY
-- =========================================

CREATE TABLE tenants (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    slug       VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_members (
    tenant_id  INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id    INT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    role       VARCHAR(50) NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (tenant_id, user_id)
);

-- La PK es (tenant_id, user_id); este índice cubre el lookup inverso
-- "¿a qué tenants pertenece este usuario?" usado en el backfill y en auth.
CREATE INDEX idx_tenant_members_user ON tenant_members (user_id);

-- =========================================
-- 2) BACKFILL: un tenant por usuario existente
-- =========================================

-- El slug 'user-<id>' es único (id es PK) y sirve de puente determinista
-- entre users y el tenant recién creado, sin columnas temporales.
-- Si el nombre del usuario es NULL o vacío, se rellena con "Tenant <id>".
INSERT INTO tenants (name, slug)
SELECT COALESCE(NULLIF(trim(u.name), ''), 'Tenant ' || u.id),
       'user-' || u.id
FROM users u;

-- Cada usuario es 'owner' de SU tenant.
INSERT INTO tenant_members (tenant_id, user_id, role)
SELECT t.id, u.id, 'owner'
FROM users u
JOIN tenants t ON t.slug = 'user-' || u.id;

-- =========================================
-- 3) tenant_id EN LAS 6 TABLAS DE DATOS
-- =========================================
-- Patrón por tabla: añadir columna nullable -> backfill desde el owner
-- del user_id -> SET NOT NULL (falla si quedara algún NULL: guardia
-- natural de integridad) -> FK a tenants -> índice.

-- Mapeo user_id -> tenant_id: para el backfill usamos el rol 'owner'
-- (relación 1:1 creada en el paso 2), determinista por usuario.

-- ---- dynamic_categories ----
ALTER TABLE dynamic_categories ADD COLUMN tenant_id INT;
UPDATE dynamic_categories d
SET tenant_id = tm.tenant_id
FROM tenant_members tm
WHERE tm.user_id = d.user_id AND tm.role = 'owner';
ALTER TABLE dynamic_categories ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE dynamic_categories
    ADD CONSTRAINT dynamic_categories_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ---- products ----
ALTER TABLE products ADD COLUMN tenant_id INT;
UPDATE products p
SET tenant_id = tm.tenant_id
FROM tenant_members tm
WHERE tm.user_id = p.user_id AND tm.role = 'owner';
ALTER TABLE products ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE products
    ADD CONSTRAINT products_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ---- imports ----
ALTER TABLE imports ADD COLUMN tenant_id INT;
UPDATE imports i
SET tenant_id = tm.tenant_id
FROM tenant_members tm
WHERE tm.user_id = i.user_id AND tm.role = 'owner';
ALTER TABLE imports ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE imports
    ADD CONSTRAINT imports_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_imports_tenant ON imports (tenant_id);

-- ---- sale_orders ----
ALTER TABLE sale_orders ADD COLUMN tenant_id INT;
UPDATE sale_orders o
SET tenant_id = tm.tenant_id
FROM tenant_members tm
WHERE tm.user_id = o.user_id AND tm.role = 'owner';
ALTER TABLE sale_orders ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE sale_orders
    ADD CONSTRAINT sale_orders_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ---- sales ----
ALTER TABLE sales ADD COLUMN tenant_id INT;
UPDATE sales s
SET tenant_id = tm.tenant_id
FROM tenant_members tm
WHERE tm.user_id = s.user_id AND tm.role = 'owner';
ALTER TABLE sales ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE sales
    ADD CONSTRAINT sales_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ---- inventory_movements ----
ALTER TABLE inventory_movements ADD COLUMN tenant_id INT;
UPDATE inventory_movements m
SET tenant_id = tm.tenant_id
FROM tenant_members tm
WHERE tm.user_id = m.user_id AND tm.role = 'owner';
ALTER TABLE inventory_movements ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE inventory_movements
    ADD CONSTRAINT inventory_movements_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_movements_tenant ON inventory_movements (tenant_id);

-- =========================================
-- 4) UNICIDAD DE NEGOCIO: de (user_id, ...) a (tenant_id, ...)
-- =========================================
-- El backfill es 1:1 (un tenant por usuario), así que reasignar el grano
-- no puede provocar colisiones sobre los datos existentes.
--
-- CÓDIGO A ACTUALIZAR (el ON CONFLICT del backend debe pasar a tenant_id):
--   - categories.service.js  -> ON CONFLICT (tenant_id, lower(name))
--   - sales.service.js        -> ON CONFLICT (tenant_id, order_ref)
--                             -> ON CONFLICT (tenant_id, line_ref)
--   - products.service.js     -> ON CONFLICT ON CONSTRAINT uq_product_identity
--                                (nombre conservado; solo añade tenant_id al INSERT)

-- ---- dynamic_categories: (user_id, lower(name)) -> (tenant_id, lower(name))
DROP INDEX uq_dynamic_categories_user_name;
CREATE UNIQUE INDEX uq_dynamic_categories_tenant_name
    ON dynamic_categories (tenant_id, lower(name));

-- ---- products: identidad por (tenant_id, sku, warehouse, location)
-- Se conserva el NOMBRE uq_product_identity porque el código lo referencia
-- por nombre (ON CONFLICT ON CONSTRAINT), así solo cambian las columnas.
ALTER TABLE products DROP CONSTRAINT uq_product_identity;
ALTER TABLE products
    ADD CONSTRAINT uq_product_identity
    UNIQUE (tenant_id, sku, warehouse, location);

-- ---- sale_orders: (user_id, order_ref) -> (tenant_id, order_ref)
ALTER TABLE sale_orders DROP CONSTRAINT uq_sale_order_ref;
ALTER TABLE sale_orders
    ADD CONSTRAINT uq_sale_order_ref
    UNIQUE (tenant_id, order_ref);

-- ---- sales: índice parcial (user_id, line_ref) -> (tenant_id, line_ref)
DROP INDEX uq_sales_user_line_ref;
CREATE UNIQUE INDEX uq_sales_tenant_line_ref
    ON sales (tenant_id, line_ref)
    WHERE line_ref IS NOT NULL;

-- =========================================
-- 5) ÍNDICES DE CONSULTA con prefijo tenant_id
-- =========================================
-- Reemplazan a los que iban prefijados por user_id (las stats pasarán a
-- filtrar por tenant_id). Se conservan también los de user_id existentes
-- hasta que el código termine de migrar; aquí solo se AÑADEN los nuevos.
CREATE INDEX idx_products_tenant_sku       ON products (tenant_id, sku);
CREATE INDEX idx_sales_tenant              ON sales (tenant_id);
CREATE INDEX idx_sales_tenant_channel      ON sales (tenant_id, channel);
CREATE INDEX idx_sale_orders_tenant_sold   ON sale_orders (tenant_id, sold_at);
CREATE INDEX idx_sale_orders_tenant_chan   ON sale_orders (tenant_id, channel);
