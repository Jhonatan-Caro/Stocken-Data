import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(name, email, password) {
  const emailExist = await pool.query(
    `SELECT 1 FROM users WHERE email = $1`,
    [email],
  );
  if (emailExist.rows.length > 0) {
    throw { status: 400, message: "El correo ingresado ya ha sido registrado." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: userRows } = await client.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword],
    );
    const user = userRows[0];

    // Cada usuario nuevo es dueño de su propio tenant (modelo 1:1, igual que
    // el backfill de la migración multi-tenancy). slug determinista user-<id>.
    const { rows: tenantRows } = await client.query(
      `INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id`,
      [name?.toString().trim() || `Tenant ${user.id}`, `user-${user.id}`],
    );
    const tenantId = tenantRows[0].id;

    await client.query(
      `INSERT INTO tenant_members (tenant_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [tenantId, user.id],
    );

    await client.query("COMMIT");
    return user;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function login(email, password) {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

  if (result.rows.length === 0) {
    throw { status: 401, message: "Usuario no encontrado" };
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw { status: 401, message: "Contraseña incorrecta" };
  }

  const tenantId = await resolveTenantId(user.id);

  const token = jwt.sign(
    { id: user.id, email: user.email, tenant_id: tenantId },
    process.env.SECRET_KEY,
    { expiresIn: "1h" },
  );

  return token;
}

// Devuelve el tenant del usuario para embeberlo en el JWT. Hoy la relación es
// 1:1 (cada usuario es 'owner' de su tenant); si en el futuro pertenece a
// varios se prioriza el que posee (role='owner') y luego el más antiguo.
async function resolveTenantId(userId) {
  const { rows } = await pool.query(
    `SELECT tenant_id FROM tenant_members
     WHERE user_id = $1
     ORDER BY (role = 'owner') DESC, tenant_id ASC
     LIMIT 1`,
    [userId],
  );
  if (rows.length === 0) {
    throw { status: 403, message: "El usuario no pertenece a ningún tenant" };
  }
  return rows[0].tenant_id;
}

export async function getUserById(userId) {
  const result = await pool.query(`SELECT name FROM users WHERE id = $1`, [userId]);

  if (result.rows.length === 0) {
    throw { status: 401, message: "Usuario no encontrado" };
  }

  return result.rows[0];
}
