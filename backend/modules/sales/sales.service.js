import pool from "../../config/db.js";

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === "") return null;

  const normalized =
    str.includes(",") && !str.includes(".") ? str.replace(",", ".") : str;

  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
}

function round2(num) {
  if (num === null) return null;
  return Math.round(num * 100) / 100;
}

function assertData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw { status: 400, message: "data debe ser un objeto JSON" };
  }
  return data;
}

async function resolveProduct(client, userId, sku, warehouse) {
  if (warehouse) {
    const { rows } = await client.query(
      `SELECT id, stock FROM products
       WHERE user_id = $1 AND sku = $2 AND warehouse = $3`,
      [userId, sku, warehouse],
    );
    if (rows.length > 0) return rows[0];
  }

  const { rows } = await client.query(
    `SELECT id, stock FROM products
     WHERE user_id = $1 AND sku = $2`,
    [userId, sku],
  );

  if (rows.length === 0) {
    throw { message: `SKU "${sku}" no encontrado en tus productos` };
  }

  if (rows.length > 1) {
    throw {
      message: `SKU "${sku}" existe en varios almacenes: mapea la columna de almacén para desambiguar`,
    };
  }

  return rows[0];
}

export async function bulkInsertOrders(userId, fileRows, mapping, filename) {
  if (!Array.isArray(fileRows) || fileRows.length === 0) {
    throw { status: 400, message: "El archivo no contiene filas válidas" };
  }

  const fileColumns = Object.keys(fileRows[0]);
  for (const field of ["order_ref", "total"]) {
    if (!fileColumns.includes(mapping[field])) {
      throw {
        status: 400,
        message: `La columna "${mapping[field]}" (${field}) no existe en el archivo`,
      };
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const source = (filename?.trim() || "orders_import").slice(0, 64);
    const { rows: importRows } = await client.query(
      `INSERT INTO imports (user_id, filename, source, rows_ok, rows_failed)
       VALUES ($1, $2, $3, 0, 0)
       RETURNING id`,
      [userId, filename ?? null, source],
    );
    const importId = importRows[0].id;

    let rowsOk = 0;
    let rowsFailed = 0;
    const errors = [];

    for (let i = 0; i < fileRows.length; i++) {
      const fileRow = fileRows[i];

      try {
        await client.query("SAVEPOINT import_row");

        const orderRef = fileRow[mapping.order_ref]?.toString().trim();
        const total = parseNumber(fileRow[mapping.total]);

        if (!orderRef) throw { message: "Referencia de pedido vacía" };
        if (total === null || total < 0) throw { message: "Total inválido" };

        const soldAt =
          mapping.sold_at && fileRow[mapping.sold_at]
            ? new Date(fileRow[mapping.sold_at])
            : new Date();
        if (isNaN(soldAt.getTime())) throw { message: "Fecha inválida" };

        const channel = fileRow[mapping.channel]?.toString().trim() || null;
        const customerCode =
          fileRow[mapping.customer_code]?.toString().trim() || null;
        const paymentStatus =
          fileRow[mapping.payment_status]?.toString().trim() || null;

        const shippingTotal = round2(parseNumber(fileRow[mapping.shipping_total]));
        const discountTotal = round2(parseNumber(fileRow[mapping.discount_total]));
        const taxTotal = round2(parseNumber(fileRow[mapping.tax_total]));
        const refunded = round2(parseNumber(fileRow[mapping.refunded]));
        const costTotal = round2(parseNumber(fileRow[mapping.cost_total]));
        const marginTotal = round2(parseNumber(fileRow[mapping.margin_total]));

        await client.query(
          `INSERT INTO sale_orders (
             user_id, import_id, order_ref, sold_at,
             channel, customer_code, payment_status,
             shipping_total, discount_total, tax_total,
             total, refunded, cost_total, margin_total, data
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7,
                   COALESCE($8::numeric, 0), COALESCE($9::numeric, 0),
                   COALESCE($10::numeric, 0),
                   $11, COALESCE($12::numeric, 0), $13, $14, $15)
           ON CONFLICT (user_id, order_ref) DO UPDATE SET
             import_id      = EXCLUDED.import_id,
             sold_at        = EXCLUDED.sold_at,
             channel        = EXCLUDED.channel,
             customer_code  = EXCLUDED.customer_code,
             payment_status = EXCLUDED.payment_status,
             shipping_total = EXCLUDED.shipping_total,
             discount_total = EXCLUDED.discount_total,
             tax_total      = EXCLUDED.tax_total,
             total          = EXCLUDED.total,
             refunded       = EXCLUDED.refunded,
             cost_total     = EXCLUDED.cost_total,
             margin_total   = EXCLUDED.margin_total,
             data           = EXCLUDED.data`,
          [
            userId,
            importId,
            orderRef,
            soldAt,
            channel,
            customerCode,
            paymentStatus,
            shippingTotal,
            discountTotal,
            taxTotal,
            round2(total),
            refunded,
            costTotal,
            marginTotal,
            { ...fileRow },
          ],
        );

        rowsOk++;
      } catch (rowErr) {
        await client.query("ROLLBACK TO SAVEPOINT import_row");
        rowsFailed++;
        errors.push({ row: i + 2, error: rowErr.message });
      }
    }

    await client.query(
      `UPDATE imports SET rows_ok = $1, rows_failed = $2 WHERE id = $3`,
      [rowsOk, rowsFailed, importId],
    );

    await client.query("COMMIT");

    return { importId, rowsOk, rowsFailed, errors };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function bulkInsertSales(
  userId,
  fileRows,
  mapping,
  filename,
  options = {},
) {
  const adjustStock = options.adjustStock !== false;

  if (!Array.isArray(fileRows) || fileRows.length === 0) {
    throw { status: 400, message: "El archivo no contiene filas válidas" };
  }

  const fileColumns = Object.keys(fileRows[0]);
  for (const field of ["sku", "quantity", "total"]) {
    if (!fileColumns.includes(mapping[field])) {
      throw {
        status: 400,
        message: `La columna "${mapping[field]}" (${field}) no existe en el archivo`,
      };
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const source = (filename?.trim() || "csv_sales").slice(0, 64);
    const { rows: importRows } = await client.query(
      `INSERT INTO imports (user_id, filename, source, rows_ok, rows_failed)
       VALUES ($1, $2, $3, 0, 0)
       RETURNING id`,
      [userId, filename ?? null, source],
    );
    const importId = importRows[0].id;

    let rowsOk = 0;
    let rowsFailed = 0;
    const errors = [];
    const insertedSales = [];

    const orderCache = new Map();

    const productCache = new Map();

    for (let i = 0; i < fileRows.length; i++) {
      const fileRow = fileRows[i];

      try {
        await client.query("SAVEPOINT import_row");

        const sku = fileRow[mapping.sku]?.toString().trim();
        const quantity = parseInt(fileRow[mapping.quantity], 10);
        const total = parseNumber(fileRow[mapping.total]);
        const soldAt =
          mapping.sold_at && fileRow[mapping.sold_at]
            ? new Date(fileRow[mapping.sold_at])
            : new Date();

        if (!sku) throw { message: "SKU vacío" };
        if (isNaN(quantity) || quantity <= 0)
          throw { message: "Cantidad inválida" };
        if (total === null || total < 0) throw { message: "Total inválido" };
        if (isNaN(soldAt.getTime())) throw { message: "Fecha inválida" };

        const channel = fileRow[mapping.channel]?.toString().trim() || null;
        const warehouse = fileRow[mapping.warehouse]?.toString().trim() || null;

        const unitPrice = round2(parseNumber(fileRow[mapping.unit_price]));
        const discount = round2(parseNumber(fileRow[mapping.discount]));
        const taxRate = parseNumber(fileRow[mapping.tax_rate]);
        const cost = round2(parseNumber(fileRow[mapping.cost]));
        let margin = round2(parseNumber(fileRow[mapping.margin]));

        if (margin === null && cost !== null) {
          const base = taxRate !== null ? total / (1 + taxRate) : total;
          margin = round2(base - cost);
        }

        const productKey = `${sku}|${warehouse ?? ""}`;
        let product = productCache.get(productKey);
        if (!product) {
          product = await resolveProduct(client, userId, sku, warehouse);
          productCache.set(productKey, product);
        }

        let orderId = null;
        const orderRef = fileRow[mapping.order_ref]?.toString().trim() || null;
        if (orderRef) {
          if (orderCache.has(orderRef)) {
            orderId = orderCache.get(orderRef);
          } else {
            const { rows: orderRows } = await client.query(
              `SELECT id FROM sale_orders
               WHERE user_id = $1 AND order_ref = $2`,
              [userId, orderRef],
            );
            orderId = orderRows[0]?.id ?? null;
            orderCache.set(orderRef, orderId);
          }
        }

        const data = { ...fileRow };

        const { rows: saleRows } = await client.query(
          `INSERT INTO sales (
             user_id, product_id, import_id, order_id, source,
             quantity, total, unit_price, discount, tax_rate,
             cost, margin, channel, warehouse, sold_at, data
           )
           VALUES ($1, $2, $3, $4, $5,
                   $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           RETURNING id, product_id, order_id, quantity, total, margin, sold_at`,
          [
            userId,
            product.id,
            importId,
            orderId,
            source,
            quantity,
            round2(total),
            unitPrice,
            discount,
            taxRate,
            cost,
            margin,
            channel,
            warehouse,
            soldAt,
            data,
          ],
        );
        const sale = saleRows[0];

        if (adjustStock) {
          // [MODIFICADO — FIX] Descuento ATÓMICO en la BD, en una sola
          // sentencia que hace tres cosas a la vez:
          //
          //   1. stock = stock - $1  -> resta RELATIVA sobre el valor
          //      real en la BD en ese instante. Antes se escribía un
          //      valor absoluto calculado en JS (stock = copia - qty):
          //      si dos claves de caché apuntaban al mismo producto
          //      (mismo SKU visto con almacenes distintos), cada copia
          //      descontaba solo SUS líneas y pisaba las del resto.
          //      Con la resta relativa da igual la forma del archivo:
          //      catálogo SKU×almacén, un almacén por SKU, o mixto.
          //
          //   2. AND stock >= $1     -> la validación de stock
          //      insuficiente viaja DENTRO del UPDATE: o hay stock y
          //      se descuenta, o no afecta filas. Sin hueco entre
          //      "comprobar" y "descontar" (a prueba de carreras).
          //
          //   3. RETURNING stock     -> el stock REAL tras la resta,
          //      calculado por Postgres. Es el stock_after verdadero
          //      para el movimiento de inventario (antes se apuntaba
          //      el de la copia JS, y la cadena de movimientos quedaba
          //      incoherente).
          const { rows: stockRows } = await client.query(
            `UPDATE products SET stock = stock - $1
             WHERE id = $2 AND stock >= $1
             RETURNING stock`,
            [quantity, product.id],
          );

          if (stockRows.length === 0) {
            // 0 filas afectadas = no había stock suficiente. Solo aquí
            // (ruta de error, poco frecuente) se consulta el stock real
            // para dar un mensaje útil.
            const { rows: cur } = await client.query(
              `SELECT stock FROM products WHERE id = $1`,
              [product.id],
            );
            throw {
              message: `Stock insuficiente para "${sku}": disponible ${cur[0]?.stock ?? 0}, solicitado ${quantity}`,
            };
          }

          const stockAfter = stockRows[0].stock;

          await client.query(
            `INSERT INTO inventory_movements (user_id, product_id, sale_id, type, delta, stock_after)
             VALUES ($1, $2, $3, 'sale', $4, $5)`,
            [userId, product.id, sale.id, -quantity, stockAfter],
          );
          // (Ya no existe `product.stock = stockAfter`: la copia en
          // memoria no lleva contadores, la única verdad es la BD.
          // Esto también elimina un bug latente: si una fila fallaba
          // tras mutar la copia, el ROLLBACK TO SAVEPOINT deshacía la
          // BD pero no la copia, que quedaba desfasada para siempre.)
        }

        insertedSales.push(sale);
        rowsOk++;
      } catch (rowErr) {
        await client.query("ROLLBACK TO SAVEPOINT import_row");
        rowsFailed++;
        errors.push({ row: i + 2, error: rowErr.message });
      }
    }

    await client.query(
      `UPDATE imports SET rows_ok = $1, rows_failed = $2 WHERE id = $3`,
      [rowsOk, rowsFailed, importId],
    );

    await client.query("COMMIT");

    return { importId, rowsOk, rowsFailed, errors, sales: insertedSales };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getAll(
  userId,
  { limit = 50, offset = 0, search = "", date = "" } = {},
) {

  const productNameExpr = `COALESCE(p.data->>'nombre', p.data->>'producto',
                     p.data->>'name', p.data->>'descripcion')`;


  const conditions = ["s.user_id = $1"];
  const params = [userId];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(p.sku ILIKE $${params.length} OR ${productNameExpr} ILIKE $${params.length})`,
    );
  }

  if (date) {
    params.push(date);
    conditions.push(`s.sold_at::date = $${params.length}::date`);
  }

  const whereClause = conditions.join(" AND ");

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total
       FROM sales s
       JOIN products p ON p.id = s.product_id
      WHERE ${whereClause}`,
    params,
  );

  const total = countRows[0].total;
  const listParams = [...params, limit, offset];
  const { rows } = await pool.query(
    `SELECT s.id, s.quantity, s.total, s.sold_at, s.source, s.data,
            s.unit_price, s.discount, s.cost, s.margin,
            s.channel, s.warehouse,
            o.order_ref,
            p.sku,
            ${productNameExpr} AS product_name
     FROM sales s
     JOIN products p ON p.id = s.product_id
     LEFT JOIN sale_orders o ON o.id = s.order_id
     WHERE ${whereClause}
     ORDER BY s.sold_at DESC
     LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams,
  );

  return { rows, total };
}

export async function getSaleDates(userId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT to_char(s.sold_at, 'YYYY-MM-DD') AS date
       FROM sales s
      WHERE s.user_id = $1 AND s.sold_at IS NOT NULL
      ORDER BY date DESC`,
    [userId],
  );
  return rows.map((r) => r.date);
}
