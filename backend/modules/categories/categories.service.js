import pool from "../../config/db.js";

export async function create(userId, name, description) {
  try {
    const result = await pool.query(
      `INSERT INTO dynamic_categories(user_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [userId, name?.toString().trim(), description],
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw { status: 409, message: `La categoría "${name}" ya existe` };
    }
    throw err;
  }
}

export async function getOrCreateByName(client, userId, rawName) {
  const name = rawName?.toString().trim();
  if (!name) return null;

  const result = await client.query(
    `INSERT INTO dynamic_categories (user_id, name, description)
     VALUES ($1, $2, 'Creada automáticamente al importar productos')
     ON CONFLICT (user_id, lower(name))
     DO UPDATE SET name = dynamic_categories.name
     RETURNING id`,
    [userId, name],
  );
  return result.rows[0].id;
}

export async function getAll(userId) {
  const result = await pool.query(
    `SELECT * FROM dynamic_categories WHERE user_id = $1`,
    [userId],
  );
  return result.rows;
}

export async function remove(id, userId) {
  const result = await pool.query(
    `DELETE FROM dynamic_categories WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId],
  );

  if (result.rowCount === 0) {
    throw {
      status: 404,
      message: "Categoria no encontrada o no pertenece al usuario",
    };
  }
}
