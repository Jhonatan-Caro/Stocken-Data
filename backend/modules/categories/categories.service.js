import pool from "../../config/db.js";

export async function create(ctx, name, description) {
  try {
    const result = await pool.query(
      `INSERT INTO dynamic_categories(tenant_id, user_id, name, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ctx.tenantId, ctx.userId, name?.toString().trim(), description],
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw { status: 409, message: `La categoría "${name}" ya existe` };
    }
    throw err;
  }
}

export async function getOrCreateByName(client, ctx, rawName) {
  const name = rawName?.toString().trim();
  if (!name) return null;

  const result = await client.query(
    `INSERT INTO dynamic_categories (tenant_id, user_id, name, description)
     VALUES ($1, $2, $3, 'Creada automáticamente al importar productos')
     ON CONFLICT (tenant_id, lower(name))
     DO UPDATE SET name = dynamic_categories.name
     RETURNING id`,
    [ctx.tenantId, ctx.userId, name],
  );
  return result.rows[0].id;
}

export async function getAll(ctx) {
  const result = await pool.query(
    `SELECT * FROM dynamic_categories WHERE tenant_id = $1`,
    [ctx.tenantId],
  );
  return result.rows;
}

export async function remove(id, ctx) {
  const result = await pool.query(
    `DELETE FROM dynamic_categories WHERE id = $1 AND tenant_id = $2 RETURNING *`,
    [id, ctx.tenantId],
  );

  if (result.rowCount === 0) {
    throw {
      status: 404,
      message: "Categoria no encontrada o no pertenece al tenant",
    };
  }
}
