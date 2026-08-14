-- =====================================================================
-- [NUEVO] Migración: categorías auto-creadas desde la importación
-- =====================================================================
-- Prepara el esquema para que bulkInsertProducts pueda hacer
-- "buscar o crear" categorías por nombre (mapping.category) de forma
-- segura. Dos problemas del esquema actual lo impedían:
--
--   1. dynamic_categories NO tenía unicidad de nombre por usuario:
--      el formulario manual podía crear "Informática" dos veces y un
--      get-or-create concurrente podía duplicar. Sin índice único
--      tampoco se puede usar ON CONFLICT (la forma atómica de hacerlo).
--
--   2. products.category_id era NOT NULL con ON DELETE CASCADE:
--      borrar una categoría BORRABA sus productos y, en cascada, sus
--      ventas y movimientos de inventario. Con categorías creadas
--      automáticamente desde archivos, borrar una "que sobra" sería
--      una pérdida de datos silenciosa. Se cambia a SET NULL: el
--      producto queda "Sin categoría" (las queries ya usan LEFT JOIN
--      + COALESCE, así que toleran el NULL sin cambios).

BEGIN;

-- ---------------------------------------------------------------------
-- 1) Dedupe preventivo: si un usuario tiene dos categorías con el mismo
--    nombre (ignorando mayúsculas y espacios), los productos se
--    re-apuntan a la más antigua (MIN(id)) y las repetidas se borran.
--    Sin esto, el CREATE UNIQUE INDEX del paso 3 fallaría.
-- ---------------------------------------------------------------------
WITH canon AS (
  SELECT user_id, lower(trim(name)) AS norm, MIN(id) AS keep_id
  FROM dynamic_categories
  GROUP BY user_id, lower(trim(name))
)
UPDATE products p
SET category_id = c.keep_id
FROM dynamic_categories d
JOIN canon c
  ON c.user_id = d.user_id
 AND lower(trim(d.name)) = c.norm
WHERE p.category_id = d.id
  AND d.id <> c.keep_id;

WITH canon AS (
  SELECT user_id, lower(trim(name)) AS norm, MIN(id) AS keep_id
  FROM dynamic_categories
  GROUP BY user_id, lower(trim(name))
)
DELETE FROM dynamic_categories d
USING canon c
WHERE d.user_id = c.user_id
  AND lower(trim(d.name)) = c.norm
  AND d.id <> c.keep_id;

-- ---------------------------------------------------------------------
-- 2) Normalizar nombres almacenados: sin espacios en los extremos.
--    El backend guardará siempre trim(nombre); esto alinea lo existente.
-- ---------------------------------------------------------------------
UPDATE dynamic_categories SET name = trim(name) WHERE name <> trim(name);

-- ---------------------------------------------------------------------
-- 3) Unicidad por usuario, insensible a mayúsculas: "Informática" e
--    "informática" son la misma categoría. El índice sobre la EXPRESIÓN
--    lower(name) es lo que permite el ON CONFLICT (user_id, lower(name))
--    del get-or-create.
-- ---------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_dynamic_categories_user_name
  ON dynamic_categories (user_id, lower(name));

-- ---------------------------------------------------------------------
-- 4) category_id pasa a ser opcional y borrar una categoría deja al
--    producto sin categoría en lugar de destruirlo (con sus ventas).
-- ---------------------------------------------------------------------
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;

ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;
ALTER TABLE products
  ADD CONSTRAINT products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES dynamic_categories(id)
  ON DELETE SET NULL;

COMMIT;
