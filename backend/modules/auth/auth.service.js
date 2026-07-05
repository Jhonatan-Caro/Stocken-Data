import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(name, email, password) {
  const emailExist = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );
  if (emailExist.rows.length > 0) {
    throw { status: 400, message: "El correo ingresado ya ha sido registrado." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, hashedPassword],
  );

  return result.rows[0];
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

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: "1h" },
  );

  return token;
}

export async function getUserById(userId) {
  const result = await pool.query(`SELECT name FROM users WHERE id = $1`, [userId]);

  if (result.rows.length === 0) {
    throw { status: 401, message: "Usuario no encontrado" };
  }

  return result.rows[0];
}
