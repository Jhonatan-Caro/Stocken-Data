import { parse } from "csv-parse/sync";
import * as salesService from "./ventas.service.js";

function parseCSVBuffer(buffer) {
  return parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

// POST /api/sales/columns
// Devuelve columnas + preview para el mapper de la UI
export async function getSalesCSVColumns(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

  try {
    const rows = parseCSVBuffer(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({ message: "El CSV está vacío" });
    }

    return res.json({
      columns: Object.keys(rows[0]),
      preview: rows.slice(0, 3),
    });
  } catch (err) {
    console.error("Error al leer columnas del CSV de ventas:", err);
    return res.status(500).json({ message: "Error al leer el archivo CSV" });
  }
}

// POST /api/sales/upload
// Importa ventas, descuenta stock y registra movimientos
export async function uploadSalesCSV(req, res) {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

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

  // sku, quantity y total son obligatorios; sold_at es opcional
  if (!mapping?.sku || !mapping?.quantity || !mapping?.total) {
    return res.status(400).json({
      message: 'El mapping debe incluir "sku", "quantity" y "total"',
    });
  }

  try {
    const filas = parseCSVBuffer(req.file.buffer);
    const result = await salesService.bulkInsertSalesFromCSV(
      userId,
      filas,
      mapping,
    );

    const status = result.rowsFailed > 0 ? 207 : 201;
    return res.status(status).json({
      message: `${result.rowsOk} ventas importadas, ${result.rowsFailed} fallidas`,
      ...result,
    });
  } catch (err) {
    console.error("Error al procesar CSV de ventas:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al procesar el CSV",
    });
  }
}

// GET /api/sales
export async function getVentas(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const rows = await salesService.getAll(req.user.id, { limit, offset });
    return res.json(rows);
  } catch (err) {
    console.error("Error al obtener ventas:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al obtener las ventas",
    });
  }
}
