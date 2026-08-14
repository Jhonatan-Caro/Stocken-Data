import {
  parseUploadedFile,
  buildColumnsResponse,
  getSheetRows,
} from "../../shared/importers/index.js";
import * as salesService from "./sales.service.js";

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

function parseMapping(body) {
  return typeof body.mapping === "string"
    ? JSON.parse(body.mapping)
    : body.mapping;
}

export async function uploadSalesCSV(req, res) {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

  let mapping;
  try {
    mapping = parseMapping(req.body);
  } catch {
    return res
      .status(400)
      .json({ message: "El campo mapping no es un JSON válido" });
  }

  if (!mapping?.sku || !mapping?.quantity || !mapping?.total) {
    return res.status(400).json({
      message: 'El mapping debe incluir "sku", "quantity" y "total"',
    });
  }

  const adjustStock = req.body.adjustStock !== "false";

  try {
    const workbook = await parseUploadedFile(req.file);
    const rows = getSheetRows(workbook, req.body.sheet);
    const result = await salesService.bulkInsertSales(
      userId,
      rows,
      mapping,
      req.file.originalname,
      { adjustStock },
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

export async function uploadSalesOrders(req, res) {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

  let mapping;
  try {
    mapping = parseMapping(req.body);
  } catch {
    return res
      .status(400)
      .json({ message: "El campo mapping no es un JSON válido" });
  }

  if (!mapping?.order_ref || !mapping?.total) {
    return res.status(400).json({
      message: 'El mapping debe incluir "order_ref" y "total"',
    });
  }

  try {
    const workbook = await parseUploadedFile(req.file);
    const rows = getSheetRows(workbook, req.body.sheet);
    const result = await salesService.bulkInsertOrders(
      userId,
      rows,
      mapping,
      req.file.originalname,
    );

    const status = result.rowsFailed > 0 ? 207 : 201;
    return res.status(status).json({
      message: `${result.rowsOk} pedidos importados, ${result.rowsFailed} fallidos`,
      ...result,
    });
  } catch (err) {
    console.error("Error al procesar el archivo de pedidos:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al procesar el archivo",
    });
  }
}

export async function getSales(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    // [NUEVO] Filtros server-side: texto de búsqueda y día concreto. Se
    // normalizan a string y se recortan; vacíos = sin filtrar.
    const search = (req.query.search || "").toString().trim();
    const date = (req.query.date || "").toString().trim();

    const { rows, total } = await salesService.getAll(req.user.id, {
      limit,
      offset,
      search,
      date,
    });

    const dates = await salesService.getSaleDates(req.user.id);

    return res.json({ rows, total, limit, offset, dates });
  } catch (err) {
    console.error("Error al obtener ventas:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al obtener las ventas",
    });
  }
}
