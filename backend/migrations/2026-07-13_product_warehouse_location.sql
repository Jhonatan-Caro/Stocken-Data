
-- Migración: identidad de producto por SKU + almacén + ubicación
-- Permite el mismo SKU en varios almacenes/ubicaciones sin sumar su stock.
-- init.sql solo corre en un volumen nuevo, así que esta migración adapta
-- las bases de datos ya existentes.

BEGIN;

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS warehouse VARCHAR(64) NOT NULL DEFAULT '';

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS location  VARCHAR(64) NOT NULL DEFAULT '';

-- Los productos existentes tienen SKU único, por lo que quedan como
-- (user_id, sku, '', '') sin colisiones al cambiar la restricción.
ALTER TABLE products DROP CONSTRAINT IF EXISTS uq_product_sku;

ALTER TABLE products
    ADD CONSTRAINT uq_product_identity UNIQUE (user_id, sku, warehouse, location);

COMMIT;
