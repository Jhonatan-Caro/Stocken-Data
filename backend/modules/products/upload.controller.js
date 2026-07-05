import { parse } from "csv-parse/sync";
import { bulkInsertFromCSV } from "./products.service.js";

// Parsea el buffer del CSV y devuelve array de objetos
function parseCSVBuffer(buffer) {
  return parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

// POST /api/products/columns
// Recibe el CSV y devuelve las columnas detectadas + preview de 3 filas
// El frontend usa esto para mostrar el mapper al usuario
export async function getCSVColumns(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

  console.log("mimetype:", req.file.mimetype);
  console.log("buffer existe:", !!req.file.buffer);
  console.log("buffer length:", req.file.buffer?.length);

  try {
    const rows = parseCSVBuffer(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({ message: "El CSV está vacío" });
    }

    return res.json({
      columns: Object.keys(rows[0]), // cabeceras detectadas
      preview: rows.slice(0, 3), // primeras 3 filas para la UI
    });
  } catch (err) {
    console.error("Error al leer columnas del CSV:", err);
    return res.status(500).json({ message: "Error al leer el archivo CSV" });
  }
}

// POST /api/products/upload
// Recibe el CSV + mapping confirmado por el usuario e importa los productos
export async function uploadCSV(req, res) {
  const usuarioId = req.user.id;
  const categoriaId = req.body.categoriaId ?? req.body.category_id;

  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

  // El mapping llega como string JSON desde multipart/form-data
  let mapping;
  try {
    mapping =
      typeof req.body.mapping === "string"
        ? JSON.parse(req.body.mapping)
        : req.body.mapping;
  } catch {
    return res
      .status(400)
      .json({ message: "El campo mapping no es un JSON válido" });
  }

  if (!mapping?.sku || !mapping?.stock) {
    return res.status(400).json({
      message: 'El mapping debe incluir al menos "sku" y "stock"',
    });
  }

  try {
    const filas = parseCSVBuffer(req.file.buffer);
    const result = await bulkInsertFromCSV(
      usuarioId,
      categoriaId,
      filas,
      mapping,
      req.file.originalname,
    );

    const status = result.rowsFailed > 0 ? 207 : 201;
    return res.status(status).json({
      message: `${result.rowsOk} productos importados, ${result.rowsFailed} fallidos`,
      ...result,
    });
  } catch (err) {
    console.error("Error al procesar el CSV:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al procesar el CSV",
    });
  }
}
