import {
  parseUploadedFile,
  buildColumnsResponse,
  getSheetRows,
} from "../../shared/importers/index.js";
import * as salesService from "./ventas.service.js";

// POST /api/ventas/columns
// Devuelve columnas + preview (y hojas disponibles) para el mapper de la UI
export async function getSalesCSVColumns(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

  try {
    const workbook = await parseUploadedFile(req.file);
    return res.json(buildColumnsResponse(workbook));
  } catch (err) {
    console.error("Error al leer columnas del archivo de ventas:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al leer el archivo",
    });
  }
}

// POST /api/ventas/upload
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
    const workbook = await parseUploadedFile(req.file);
    const filas = getSheetRows(workbook, req.body.sheet);
    const result = await salesService.bulkInsertSales(
      userId,
      filas,
      mapping,
      req.file.originalname,
    );

    const status = result.rowsFailed > 0 ? 207 : 201;
    return res.status(status).json({
      message: `${result.rowsOk} ventas importadas, ${result.rowsFailed} fallidas`,
      ...result,
    });
  } catch (err) {
    console.error("Error al procesar el archivo de ventas:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al procesar el archivo",
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
