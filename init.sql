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

-- Crear tabla que guardara las tablas personalizadas del usuario
CREATE TABLE IF NOT EXISTS categorias_dinamicas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES users(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla que guardar los datos personalizados en formato JSON
CREATE TABLE IF NOT EXISTS registros_dinamicos (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER REFERENCES categorias_dinamicas(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  datos JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
