import * as authService from "./auth.service.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register(name, email, password);
    res.status(201).json({ message: "Usuario registrado exitosamente", user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error en el servidor" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.json({ message: "Login exitoso", token });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error en el servidor" });
  }
}

export async function getUser(req, res) {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json({ name: user.name });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error en el servidor" });
  }
}

export function verifyTokenEndpoint(req, res) {
  res.status(200).json({ valid: true, user: req.user });
}

export function dashboard(req, res) {
  res.json({ message: `Bienvenido ${req.user.email}!` });
}
