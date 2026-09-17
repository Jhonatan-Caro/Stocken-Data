-- =====================================================================
-- Migración: identidad de línea de venta + UPSERT idempotente en sales
-- =====================================================================
-- La tabla `sales` insertaba siempre filas nuevas (sin ON CONFLICT), así
-- que reimportar el mismo archivo DUPLICABA las líneas: unidades/facturación
-- al doble en las estadísticas y stock descontado dos veces. `sale_orders`
-- ya era idempotente (UPSERT sobre user_id+order_ref); esto lleva la misma
-- garantía a las líneas.
--
-- Los archivos de ventas traen un identificador de línea ("ID línea"). Se
-- materializa en una columna tipada `line_ref` (clave de negocio) que NO
-- sustituye a `sales.id` (clave surrogada de la BD): conviven, igual que
-- `sale_orders.id` y `sale_orders.order_ref`.
--
-- init.sql solo corre en un volumen nuevo, así que esta migración adapta
-- las bases de datos ya existentes (mismo patrón que las anteriores).

BEGIN;

-- ---------------------------------------------------------------------
-- 1) Columna para la clave de negocio de la línea. NULLABLE: ventas por
--    webhook u otras fuentes pueden no traer identificador de línea.
-- ---------------------------------------------------------------------
ALTER TABLE sales
    ADD COLUMN IF NOT EXISTS line_ref VARCHAR(64);

-- ---------------------------------------------------------------------
-- 2) Backfill de las líneas existentes desde el JSONB `data->>'ID línea'`.
--    Solo se rellena la PRIMERA fila de cada (user_id, ID línea): si ya
--    hubiera duplicados de un usuario, las repetidas quedan en NULL para
--    no romper el índice único del paso 3 (conservan el comportamiento
--    append hasta que se limpien a mano).
-- ---------------------------------------------------------------------
WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, data->>'ID línea'
               ORDER BY id
           ) AS rn
    FROM sales
    WHERE line_ref IS NULL
      AND data ? 'ID línea'
      AND NULLIF(trim(data->>'ID línea'), '') IS NOT NULL
)
UPDATE sales s
SET line_ref = trim(s.data->>'ID línea')
FROM ranked r
WHERE s.id = r.id
  AND r.rn = 1;

-- ---------------------------------------------------------------------
-- 3) Unicidad por usuario, PARCIAL (solo cuando hay line_ref): es la clave
--    que habilita el ON CONFLICT (user_id, line_ref) del importador. Las
--    líneas sin line_ref quedan fuera del índice y se siguen insertando.
-- ---------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_sales_user_line_ref
    ON sales (user_id, line_ref)
    WHERE line_ref IS NOT NULL;

COMMIT;
