import pool from "../../config/db.js";

export async function getSummary(userId, { from = null, to = null } = {}) {
  const { rows: lineRows } = await pool.query(
    `SELECT
       COUNT(*)::int                                        AS lines,
       COALESCE(SUM(s.quantity), 0)::int                    AS units,
       COALESCE(SUM(s.total), 0)::float                     AS revenue,
       COALESCE(SUM(s.total / (1 + COALESCE(s.tax_rate, 0))), 0)::float
                                                            AS revenue_net,
       COALESCE(SUM(s.cost), 0)::float                      AS cost,
       COALESCE(SUM(s.margin), 0)::float                    AS margin
     FROM sales s
     WHERE s.user_id = $1
       AND ($2::timestamp IS NULL OR s.sold_at >= $2)
       AND ($3::timestamp IS NULL OR s.sold_at <= $3)`,
    [userId, from, to],
  );

  const { rows: orderRows } = await pool.query(
    `SELECT
       COUNT(*)::int                             AS orders,
       COALESCE(SUM(o.total), 0)::float          AS orders_total,
       COALESCE(SUM(o.refunded), 0)::float       AS refunded,
       COALESCE(SUM(o.shipping_total), 0)::float AS shipping,
       COALESCE(AVG(o.total), 0)::float          AS avg_ticket
     FROM sale_orders o
     WHERE o.user_id = $1
       AND ($2::timestamp IS NULL OR o.sold_at >= $2)
       AND ($3::timestamp IS NULL OR o.sold_at <= $3)`,
    [userId, from, to],
  );

  const lines = lineRows[0];
  const orders = orderRows[0];

  return {
    ...lines,
    ...orders,
    margin_pct: lines.revenue_net > 0 ? lines.margin / lines.revenue_net : null,
  };
}

export async function getByProduct(userId, { from = null, to = null } = {}) {
  const { rows } = await pool.query(
    `WITH per_product AS (
       SELECT
         p.id                                   AS product_id,
         p.sku,
         p.warehouse,
         p.location,
         COALESCE(p.data->>'nombre', p.data->>'producto',
                  p.data->>'name', p.data->>'descripcion') AS product_name,
         c.name                                 AS category,
         SUM(s.quantity)::int                   AS units,
         COUNT(DISTINCT s.order_id)::int        AS orders,
         SUM(s.total)::float                    AS revenue,
         SUM(s.total / (1 + COALESCE(s.tax_rate, 0)))::float AS revenue_net,
         SUM(s.cost)::float                     AS cost,
         SUM(s.margin)::float                   AS margin,
         (SUM(s.margin) /
          NULLIF(SUM(s.total / (1 + COALESCE(s.tax_rate, 0))), 0))::float
                                                AS margin_pct
       FROM sales s
       JOIN products p             ON p.id = s.product_id
       LEFT JOIN dynamic_categories c ON c.id = p.category_id
       WHERE s.user_id = $1
         AND ($2::timestamp IS NULL OR s.sold_at >= $2)
         AND ($3::timestamp IS NULL OR s.sold_at <= $3)
       GROUP BY p.id, c.name
     ),
     medians AS (
       SELECT
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY units)      AS med_units,
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY margin_pct) AS med_margin
       FROM per_product
     )
     SELECT
       pp.*,
       CASE
         WHEN pp.margin_pct IS NULL                THEN 'sin_datos'
         WHEN pp.units >= m.med_units
          AND pp.margin_pct >= m.med_margin        THEN 'potencial'
         WHEN pp.units >= m.med_units              THEN 'volumen_sin_margen'
         WHEN pp.margin_pct >= m.med_margin        THEN 'nicho_rentable'
         ELSE                                           'no_potencial'
       END AS classification
     FROM per_product pp
     CROSS JOIN medians m
     ORDER BY pp.revenue DESC`,
    [userId, from, to],
  );
  return rows;
}

export async function getByMonth(userId, { from = null, to = null } = {}) {
  const { rows } = await pool.query(
    `WITH lineas AS (
       SELECT
         to_char(s.sold_at, 'YYYY-MM')  AS mes,
         SUM(s.quantity)::int           AS units,
         SUM(s.total)::float            AS revenue,
         SUM(s.total / (1 + COALESCE(s.tax_rate, 0)))::float AS revenue_net,
         SUM(s.cost)::float             AS cost,
         SUM(s.margin)::float           AS margin
       FROM sales s
       WHERE s.user_id = $1
         AND ($2::timestamp IS NULL OR s.sold_at >= $2)
         AND ($3::timestamp IS NULL OR s.sold_at <= $3)
       GROUP BY 1
     ),
     pedidos AS (
       SELECT
         to_char(o.sold_at, 'YYYY-MM')  AS mes,
         COUNT(*)::int                  AS orders,
         SUM(o.refunded)::float         AS refunded,
         AVG(o.total)::float            AS avg_ticket
       FROM sale_orders o
       WHERE o.user_id = $1
         AND ($2::timestamp IS NULL OR o.sold_at >= $2)
         AND ($3::timestamp IS NULL OR o.sold_at <= $3)
       GROUP BY 1
     )
     SELECT
       mes,
       COALESCE(l.units, 0)      AS units,
       COALESCE(l.revenue, 0)    AS revenue,
       l.revenue_net,
       l.cost,
       l.margin,
       (l.margin / NULLIF(l.revenue_net, 0))::float AS margin_pct,
       COALESCE(p.orders, 0)     AS orders,
       COALESCE(p.refunded, 0)   AS refunded,
       p.avg_ticket
     FROM lineas l
     FULL JOIN pedidos p USING (mes)
     ORDER BY mes`,
    [userId, from, to],
  );
  return rows;
}

export async function getByChannel(userId, { from = null, to = null } = {}) {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(s.channel, 'Sin canal')  AS channel,
       SUM(s.quantity)::int              AS units,
       COUNT(DISTINCT s.order_id)::int   AS orders,
       SUM(s.total)::float               AS revenue,
       SUM(s.margin)::float              AS margin,
       (SUM(s.margin) /
        NULLIF(SUM(s.total / (1 + COALESCE(s.tax_rate, 0))), 0))::float
                                         AS margin_pct
     FROM sales s
     WHERE s.user_id = $1
       AND ($2::timestamp IS NULL OR s.sold_at >= $2)
       AND ($3::timestamp IS NULL OR s.sold_at <= $3)
     GROUP BY s.channel
     ORDER BY revenue DESC`,
    [userId, from, to],
  );
  return rows;
}

export async function getByCategory(userId, { from = null, to = null } = {}) {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(c.name, 'Sin categoría') AS category,
       COUNT(DISTINCT p.id)::int         AS products,
       SUM(s.quantity)::int              AS units,
       SUM(s.total)::float               AS revenue,
       SUM(s.margin)::float              AS margin,
       (SUM(s.margin) /
        NULLIF(SUM(s.total / (1 + COALESCE(s.tax_rate, 0))), 0))::float
                                         AS margin_pct
     FROM sales s
     JOIN products p                ON p.id = s.product_id
     LEFT JOIN dynamic_categories c ON c.id = p.category_id
     WHERE s.user_id = $1
       AND ($2::timestamp IS NULL OR s.sold_at >= $2)
       AND ($3::timestamp IS NULL OR s.sold_at <= $3)
     GROUP BY c.name
     ORDER BY revenue DESC`,
    [userId, from, to],
  );
  return rows;
}
