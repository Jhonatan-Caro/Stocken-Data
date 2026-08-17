import { CsvImporter } from "./csv.importer.js";
import { ExcelImporter } from "./excel.importer.js";

const IMPORTERS = [CsvImporter, ExcelImporter];

const PREVIEW_ROWS = 12;

export async function parseUploadedFile(file) {
  const importer = IMPORTERS.find((imp) => imp.canHandle(file));
  if (!importer) {
    throw { status: 400, message: "Formato de archivo no soportado" };
  }

  const workbook = await importer.parse(file.buffer, {
    filename: file.originalname,
  });

  if (workbook.sheets.length === 0) {
    throw { status: 400, message: "El archivo está vacío" };
  }

  return workbook;
}

export function buildColumnsResponse(workbook) {
  const defaultSheet = workbook.sheets.find(
    (s) => s.name === workbook.defaultSheet,
  );

  return {
    columns: defaultSheet.columns,
    preview: defaultSheet.rows.slice(0, PREVIEW_ROWS),
    format: workbook.format,
    defaultSheet: workbook.defaultSheet,
    sheets: workbook.sheets.map((s) => ({
      name: s.name,
      columns: s.columns,
      preview: s.rows.slice(0, PREVIEW_ROWS),
      rowCount: s.rows.length,
    })),
  };
}

export function getSheetRows(workbook, sheetName) {
  const name = sheetName || workbook.defaultSheet;
  const sheet = workbook.sheets.find((s) => s.name === name);

  if (!sheet) {
    throw {
      status: 400,
      message: `La hoja "${name}" no existe en el archivo`,
    };
  }

  return sheet.rows;
}
