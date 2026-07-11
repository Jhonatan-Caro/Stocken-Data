import {
  parseUploadedFile,
  buildColumnsResponse,
  getSheetRows,
} from "../../shared/importers/index.js";
import { bulkInsertProducts } from "./products.service.js";

// POST /api/productos/columns
// Recibe el archivo (CSV o XLSX) y devuelve columnas + preview de la hoja
// por defecto, más la lista de hojas para el selector de la UI
export async function getCSVColumns(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No se ha subido ningún archivo" });
  }

  try {
    const workbook = await parseUploadedFile(req.file);
    return res.json(buildColumnsResponse(workbook));
  } catch (err) {
    console.error("Error al leer columnas del archivo:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al leer el archivo",
    });
  }
}

// POST /api/productos/upload
// Recibe el archivo + mapping confirmado por el usuario (+ hoja opcional
// para XLSX) e importa los productos
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

  // stock es opcional: un catálogo puede no traer columna de stock (default 0)
  if (!mapping?.sku) {
    return res.status(400).json({
      message: 'El mapping debe incluir al menos "sku"',
    });
  }

  try {
    const workbook = await parseUploadedFile(req.file);
    const filas = getSheetRows(workbook, req.body.sheet);
    const result = await bulkInsertProducts(
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
    console.error("Error al procesar el archivo:", err);
    return res.status(err.status || 500).json({
      message: err.message || "Error al procesar el archivo",
    });
  }
}
