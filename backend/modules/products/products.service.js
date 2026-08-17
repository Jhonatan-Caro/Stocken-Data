import pool from "../../config/db.js";
import { getOrCreateByName } from "../categories/categories.service.js";

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
    `SELECT p.id, p.user_id, p.category_id, p.sku, p.warehouse, p.location,
            p.stock, p.data, p.created_at,
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

export async function bulkInsertProducts(
  userId,
  categoryId,
  fileRows,
  mapping,
  filename,
) {

  const hasCategoryCol = Boolean(mapping.category);
  const defaultCategoryId =
    categoryId !== undefined && categoryId !== null && categoryId !== ""
      ? assertCategoryId(categoryId)
      : null;

  if (!hasCategoryCol && defaultCategoryId === null) {
    throw {
      status: 400,
      message:
        "Selecciona una categoría por defecto o mapea la columna de categoría del archivo",
    };
  }

  if (!Array.isArray(fileRows) || fileRows.length === 0) {
    throw { status: 400, message: "El archivo no contiene filas válidas" };
  }

  const fileColumns = Object.keys(fileRows[0]);
  if (!fileColumns.includes(mapping.sku)) {
    throw {
      status: 400,
      message: `La columna SKU "${mapping.sku}" no existe en el archivo`,
    };
  }
  if (hasCategoryCol && !fileColumns.includes(mapping.category)) {
    throw {
      status: 400,
      message: `La columna categoría "${mapping.category}" no existe en el archivo`,
    };
  }
  const hasStock = Boolean(mapping.stock);
  if (hasStock && !fileColumns.includes(mapping.stock)) {
    throw {
      status: 400,
      message: `La columna stock "${mapping.stock}" no existe en el archivo`,
    };
  }

  const hasWarehouse = Boolean(mapping.warehouse);
  if (hasWarehouse && !fileColumns.includes(mapping.warehouse)) {
    throw {
      status: 400,
      message: `La columna almacén "${mapping.warehouse}" no existe en el archivo`,
    };
  }
  const hasLocation = Boolean(mapping.location);
  if (hasLocation && !fileColumns.includes(mapping.location)) {
    throw {
      status: 400,
      message: `La columna ubicación "${mapping.location}" no existe en el archivo`,
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (defaultCategoryId !== null) {
      await assertCategoryBelongsToUser(client, defaultCategoryId, userId);
    }

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

    const byKey = new Map();

    for (let i = 0; i < fileRows.length; i++) {
      const fileRow = fileRows[i];

      try {
        const sku = fileRow[mapping.sku]?.toString().trim();
        if (!sku) throw { message: "SKU vacío" };

        let stock = 0;
        if (hasStock) {
          stock = parseInt(fileRow[mapping.stock], 10);
          if (isNaN(stock) || stock < 0) throw { message: "Stock inválido" };
        }

        const warehouse = hasWarehouse
          ? (fileRow[mapping.warehouse]?.toString().trim() ?? "")
          : "";
        const location = hasLocation
          ? (fileRow[mapping.location]?.toString().trim() ?? "")
          : "";

        const categoryName = hasCategoryCol
          ? (fileRow[mapping.category]?.toString().trim() ?? "")
          : "";

        const data = { ...fileRow };

        delete data[mapping.sku];
        if (hasStock) delete data[mapping.stock];
        if (hasWarehouse) delete data[mapping.warehouse];
        if (hasLocation) delete data[mapping.location];
        if (hasCategoryCol) delete data[mapping.category];

        delete data.sku;
        delete data.stock;

        const key = `${sku}||${warehouse}||${location}`;
        const acc = byKey.get(key);
        if (acc) {
          acc.stock += stock;
          Object.assign(acc.data, data);
          acc.categoryName ||= categoryName;
          acc.rowCount++;
        } else {
          byKey.set(key, {
            sku,
            warehouse,
            location,
            stock,
            data,
            categoryName,
            row: i + 2,
            rowCount: 1,
          });
        }
      } catch (rowErr) {
        rowsFailed++;
        errors.push({ row: i + 2, error: rowErr.message }); // +2 = fila real en el CSV
      }
    }

    // El upsert fusiona data (products.data || EXCLUDED.data) para que un
    // import de stock no borre los atributos del catálogo, y solo toca el
    // stock cuando la columna vino mapeada.
    const stockUpdate = hasStock ? "stock = EXCLUDED.stock," : "";
    const categoryCache = new Map();

    for (const [
      ,
      { sku, warehouse, location, stock, data, categoryName, row, rowCount },
    ] of byKey) {
      try {
        //   Resolver la categoría de este producto:
        //   con nombre  -> buscar o crear (cacheado)
        //   sin nombre  -> la categoría manual (o NULL si no la hay)
        let productCategoryId = defaultCategoryId;
        if (categoryName) {
          const cacheKey = categoryName.toLowerCase();
          if (!categoryCache.has(cacheKey)) {
            categoryCache.set(
              cacheKey,
              await getOrCreateByName(client, userId, categoryName),
            );
          }
          productCategoryId = categoryCache.get(cacheKey);
        }

        const { rows } = await client.query(
          `INSERT INTO products (user_id, category_id, sku, warehouse, location, stock, data)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT ON CONSTRAINT uq_product_identity
           DO UPDATE SET
             ${stockUpdate}
             data        = products.data || EXCLUDED.data,
             -- [MODIFICADO] COALESCE: si este import trae categoría
             -- (EXCLUDED) se actualiza; si la fila venía sin categoría
             -- (NULL), se CONSERVA la que el producto ya tenía en vez
             -- de pisarla con NULL
             category_id = COALESCE(EXCLUDED.category_id, products.category_id)
           RETURNING id, user_id, category_id, sku, warehouse, location, stock, data, created_at`,
          [userId, productCategoryId, sku, warehouse, location, stock, data],
        );

        insertedRows.push(rows[0]);
        rowsOk += rowCount;
      } catch (rowErr) {
        rowsFailed += rowCount;
        errors.push({ row, error: rowErr.message });
      }
    }

    await client.query(
      `UPDATE imports SET rows_ok = $1, rows_failed = $2 WHERE id = $3`,
      [rowsOk, rowsFailed, importId],
    );

    await client.query("COMMIT");

    return { importId, rowsOk, rowsFailed, errors, products: insertedRows };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
