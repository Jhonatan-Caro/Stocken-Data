import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import pool from "./models/db.js";
import bcrypt from "bcrypt";
import jwt from  "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 4000;
const secretKey = process.env.SECRET_KEY

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`, [name, email, hashedPassword]);
    const newUser = result.rows[0];

    res.status(201).json({ message: "Usuario registrado exitosamente", user: newUser });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

app.post("/api/login", async (req, res) => {
  try{
    const { email, password } = req.body;

    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Usuario o encontrado" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: "1h" });
    
    res.json({ message: "Login exitoso", token });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.email}!` });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });	
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });	
    }
    req.user = user;
    next();
  });
}

app.get("/api/data", verifyToken, (req, res) => {
  res.json({
    message: `Hola ${req.user.email}, aquí tienes tus datos protegidos`,	
    data: [
      { id: 1, name: "Producto A", valor: 100 },
      { id: 2, name: "Producto B", valor: 200 },
    ],
  });
});

app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});