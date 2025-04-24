import pool from "../models/db.js";

// REGISTRO
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, password] // ⚠️ Por ahora plano, luego encriptamos con bcrypt
    );

    res.status(201).json({ message: "Usuario registrado exitosamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario." });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0 || user.rows[0].password !== password) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Para producción, aquí generas un JWT
    res.json({ message: "Login exitoso", user: user.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión." });
  }
};