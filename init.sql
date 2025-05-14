-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT
);

-- Crear tabla de productos, relacionada con users
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  nombre TEXT,
  precio NUMERIC,
  stock INTEGER,
  caracteristicas JSONB
);