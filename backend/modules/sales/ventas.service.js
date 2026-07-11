import pool from "../../config/db.js";

function assertData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw { status: 400, message: "data debe ser un objeto JSON" };
  }
  return data;
}

// Resuelve el product_id a partir del SKU que viene en el CSV
async function resolveProduct(client, userId, sku) {
  const { rows } = await client.query(
    `SELECT id, stock FROM products
     WHERE user_id = $1 AND sku = $2`,
    [userId, sku],
  );

  if (rows.length === 0) {
    throw { message: `SKU "${sku}" no encontrado en tus productos` };
  }

  return rows[0]; // { id, stock }
}

// Importa un archivo de ventas aplicando el mapping del usuario
export async function bulkInsertSales(userId, filas, mapping, filename) {
  if (!Array.isArray(filas) || filas.length === 0) {
    throw { status: 400, message: "El archivo no contiene filas válidas" };
  }

  // Validar que las columnas mapeadas existen en el archivo
  const fileColumns = Object.keys(filas[0]);
  if (!fileColumns.includes(mapping.sku)) {
    throw {
      status: 400,
      message: `La columna SKU "${mapping.sku}" no existe en el archivo`,
    };
  }
  if (!fileColumns.includes(mapping.quantity)) {
    throw {
      status: 400,
      message: `La columna cantidad "${mapping.quantity}" no existe en el archivo`,
    };
  }
  if (!fileColumns.includes(mapping.total)) {
    throw {
      status: 400,
      message: `La columna total "${mapping.total}" no existe en el archivo`,
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Registrar el import
    // source guarda el nombre del archivo subido; la columna es VARCHAR(64)
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

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];

      try {
        const sku = fila[mapping.sku]?.toString().trim();
        const quantity = parseInt(fila[mapping.quantity], 10);
        const total = parseFloat(fila[mapping.total]);
        // sold_at es opcional: si no viene en el CSV usa el momento actual
        const soldAt =
          mapping.sold_at && fila[mapping.sold_at]
            ? new Date(fila[mapping.sold_at])
            : new Date();

        if (!sku) throw { message: "SKU vacío" };
        if (isNaN(quantity) || quantity <= 0)
          throw { message: "Cantidad inválida" };
        if (isNaN(total) || total < 0) throw { message: "Total inválido" };
        if (isNaN(soldAt.getTime())) throw { message: "Fecha inválida" };

        // Resolver producto por SKU
        const product = await resolveProduct(client, userId, sku);

        // Validar stock suficiente
        if (product.stock < quantity) {
          throw {
            message: `Stock insuficiente para "${sku}": disponible ${product.stock}, solicitado ${quantity}`,
          };
        }

        // Payload original completo al JSONB
        const data = { ...fila };

        // 1. Insertar la venta
        const { rows: saleRows } = await client.query(
          `INSERT INTO sales (user_id, product_id, import_id, source, quantity, total, sold_at, data)
           VALUES ($1, $2, $3, 'csv_sales', $4, $5, $6, $7)
           RETURNING id, product_id, quantity, total, sold_at`,
          [userId, product.id, importId, quantity, total, soldAt, data],
        );
        const sale = saleRows[0];

        // 2. Descontar stock del producto
        const stockAfter = product.stock - quantity;
        await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [
          stockAfter,
          product.id,
        ]);

        // 3. Registrar el movimiento de inventario
        await client.query(
          `INSERT INTO inventory_movements (user_id, product_id, sale_id, type, delta, stock_after)
           VALUES ($1, $2, $3, 'sale', $4, $5)`,
          [userId, product.id, sale.id, -quantity, stockAfter],
        );

        insertedSales.push(sale);
        rowsOk++;
      } catch (rowErr) {
        rowsFailed++;
        errors.push({ row: i + 2, error: rowErr.message });
      }
    }

    // Actualizar contadores del import
    await client.query(
      `UPDATE imports SET rows_ok = $1, rows_failed = $2 WHERE id = $3`,
      [rowsOk, rowsFailed, importId],
    );

    await client.query("COMMIT");

    return { importId, rowsOk, rowsFailed, errors, ventas: insertedSales };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Listado de ventas del usuario con info del producto
export async function getAll(userId, { limit = 50, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT s.id, s.quantity, s.total, s.sold_at, s.source, s.data,
            p.sku, p.data->>'nombre' AS product_name
     FROM sales s
     JOIN products p ON p.id = s.product_id
     WHERE s.user_id = $1
     ORDER BY s.sold_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return rows;
}
