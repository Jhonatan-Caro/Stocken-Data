import pool from "../../config/db.js";

export async function create(usuarioId, nombre, descripcion) {
  const result = await pool.query(
    `INSERT INTO dynamic_categories(user_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
    [usuarioId, nombre, descripcion],
  );
  return result.rows[0];
}

export async function getAll(usuarioId) {
  const result = await pool.query(
    `SELECT * FROM dynamic_categories WHERE user_id = $1`,
    [usuarioId],
  );
  return result.rows;
}

export async function remove(id, usuarioId) {
  const result = await pool.query(
    `DELETE FROM dynamic_categories WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, usuarioId],
  );

  if (result.rowCount === 0) {
    throw {
      status: 404,
      message: "Categoria no encontrada o no pertenece al usuario",
    };
  }
}
