import pool from "../../config/db.js";

const PRODUCT_COLUMNS = new Set(["category_id", "sku", "stock", "data"]);

function sanitizePayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => PRODUCT_COLUMNS.has(key)),
  );
}

function assertCategoryId(categoryId) {
  const id = Number(categoryId);
  if (!Number.isInteger(id) || id <= 0) {
    throw {
      status: 400,
      message: "category_id es requerido y debe ser un entero positivo",
    };
  }
  return id;
}

function assertData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw { status: 400, message: "data debe ser un objeto JSON" };
  }
  return data;
}

async function assertCategoryBelongsToUser(client, categoryId, userId) {
  const { rowCount } = await client.query(
    "SELECT 1 FROM dynamic_categories WHERE id = $1 AND user_id = $2",
    [categoryId, userId],
  );
  if (rowCount === 0) {
    throw { status: 404, message: "Categoria no encontrada para el usuario" };
  }
}

export async function getAll(userId) {
  const { rows } = await pool.query(
    `SELECT p.id, p.user_id, p.category_id, p.sku, p.stock, p.data, p.created_at,
            c.name AS category_name
     FROM products p
     LEFT JOIN dynamic_categories c ON c.id = p.category_id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function create(userId, body) {
  console.log("body recibido:", JSON.stringify(body));
  const clean = sanitizePayload(body);
  console.log("clean después de sanitize:", JSON.stringify(clean));
  const categoryId = assertCategoryId(clean.category_id);
  const data = assertData(clean.data);
  const sku = clean.sku?.toString().trim();
  const stock = parseInt(clean.stock ?? 0, 10);

  const client = await pool.connect();
  try {
    await assertCategoryBelongsToUser(client, categoryId, userId);

    const { rows } = await client.query(
      `INSERT INTO products (user_id, category_id, sku, stock, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, category_id, sku, stock, data, created_at`,
      [userId, categoryId, sku, stock, data],
    );
    return rows[0];
  } finally {
    client.release();
  }
}

export async function update(productId, userId, body) {
  const clean = sanitizePayload(body);
  if (!("category_id" in clean) && !("data" in clean)) {
    throw {
      status: 400,
      message: "Solo se permite modificar category_id o data",
    };
  }

  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if ("category_id" in clean) {
      const categoryId = assertCategoryId(clean.category_id);
      await assertCategoryBelongsToUser(client, categoryId, userId);
      fields.push(`category_id = $${idx++}`);
      values.push(categoryId);
    }

    if ("data" in clean) {
      const data = assertData(clean.data);
      fields.push(`data = $${idx++}`);
      values.push(data);
    }

    values.push(productId, userId);

    const { rows, rowCount } = await client.query(
      `UPDATE products
       SET ${fields.join(", ")}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING id, user_id, category_id, data, created_at`,
      values,
    );

    if (rowCount === 0) {
      throw {
        status: 404,
        message: "Producto no encontrado o no pertenece al usuario",
      };
    }
    return rows[0];
  } finally {
    client.release();
  }
}

export async function remove(productId, userId) {
  const { rowCount } = await pool.query(
    "DELETE FROM products WHERE id = $1 AND user_id = $2",
    [productId, userId],
  );
  if (rowCount === 0) {
    throw {
      status: 404,
      message: "Producto no encontrado o no pertenece al usuario",
    };
  }
}

export async function bulkInsertFromCSV(
  userId,
  categoryId,
  filas,
  mapping,
  filename,
) {
  const id = assertCategoryId(categoryId);

  if (!Array.isArray(filas) || filas.length === 0) {
    throw { status: 400, message: "El archivo CSV no contiene filas válidas" };
  }

  const csvColumns = Object.keys(filas[0]);
  if (!csvColumns.includes(mapping.sku)) {
    throw {
      status: 400,
      message: `La columna SKU "${mapping.sku}" no existe en el CSV`,
    };
  }
  if (!csvColumns.includes(mapping.stock)) {
    throw {
      status: 400,
      message: `La columna stock "${mapping.stock}" no existe en el CSV`,
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await assertCategoryBelongsToUser(client, id, userId);

    // Registrar el import para trazabilidad
    // source guarda el nombre del CSV subido; la columna es VARCHAR(64)
    const source = (filename?.trim() || "csv_products").slice(0, 64);
    const importResult = await client.query(
      `INSERT INTO imports (user_id, filename, source, rows_ok, rows_failed)
       VALUES ($1, $2, $3, 0, 0)
       RETURNING id`,
      [userId, filename ?? null, source],
    );
    const importId = importResult.rows[0].id;

    let rowsOk = 0;
    let rowsFailed = 0;
    const errors = [];
    const insertedRows = [];

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];

      try {
        const sku = fila[mapping.sku]?.toString().trim();
        const stock = parseInt(fila[mapping.stock], 10);

        if (!sku) throw { message: "SKU vacío" };
        if (isNaN(stock) || stock < 0) throw { message: "Stock inválido" };

        // El data JSONB guarda el row completo (payload original preservado)
        const data = { ...fila };

        // Una vez mapeado los campos importantes se eliminan de data para que solo vivan en db
        delete data[mapping.sku];
        delete data[mapping.stock];

        delete data.sku;
        delete data.stock;

        const { rows } = await client.query(
          `INSERT INTO products (user_id, category_id, sku, stock, data)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT ON CONSTRAINT uq_product_sku
           DO UPDATE SET
             stock       = EXCLUDED.stock,
             data        = EXCLUDED.data,
             category_id = EXCLUDED.category_id
           RETURNING id, user_id, category_id, sku, stock, data, created_at`,
          [userId, id, sku, stock, data],
        );

        insertedRows.push(rows[0]);
        rowsOk++;
      } catch (rowErr) {
        rowsFailed++;
        errors.push({ row: i + 2, error: rowErr.message }); // +2 = fila real en el CSV
      }
    }

    await client.query(
      `UPDATE imports SET rows_ok = $1, rows_failed = $2 WHERE id = $3`,
      [rowsOk, rowsFailed, importId],
    );

    await client.query("COMMIT");

    return { importId, rowsOk, rowsFailed, errors, productos: insertedRows };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
