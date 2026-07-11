import ExcelJS from "exceljs";
import { normalizeCellValue, normalizeHeader } from "./normalize.js";

const XLSX_MIMETYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Importador Excel (.xlsx). Cada hoja del workbook se convierte al mismo
// modelo interno que produce el CSV: la fila 1 son las cabeceras y cada
// fila de datos es un objeto { cabecera: string }.
export const ExcelImporter = {
  format: "xlsx",

  canHandle(file) {
    // Algunos navegadores/SO envían octet-stream para xlsx, por eso también
    // se acepta por extensión.
    return (
      file.mimetype === XLSX_MIMETYPE ||
      file.originalname.toLowerCase().endsWith(".xlsx")
    );
  },

  async parse(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheets = [];

    for (const worksheet of workbook.worksheets) {
      const sheet = parseWorksheet(worksheet);
      if (sheet) sheets.push(sheet);
    }

    return {
      format: this.format,
      sheets,
      defaultSheet: sheets[0]?.name ?? null,
    };
  },
};

// Convierte una hoja a { name, columns, rows } o null si no tiene datos.
function parseWorksheet(worksheet) {
  const headerRow = worksheet.getRow(1);

  // headers[colIndex] = nombre de columna, o undefined si la cabecera
  // está vacía (columna descartada)
  const headers = {};
  const seen = new Set();
  const columnCount = worksheet.columnCount;

  for (let col = 1; col <= columnCount; col++) {
    const name = normalizeHeader(headerRow.getCell(col).value, seen);
    if (name) headers[col] = name;
  }

  const columns = Object.values(headers);
  if (columns.length === 0) return null;

  const rows = [];
  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const excelRow = worksheet.getRow(rowNum);
    const row = {};
    let hasValue = false;

    // getCell por índice (y no row.values) para no perder celdas vacías
    // intermedias: toda columna con cabecera existe siempre en la fila.
    for (const [col, name] of Object.entries(headers)) {
      const value = normalizeCellValue(excelRow.getCell(Number(col)).value);
      row[name] = value;
      if (value !== "") hasValue = true;
    }

    // Paridad con skip_empty_lines del CSV
    if (hasValue) rows.push(row);
  }

  if (rows.length === 0) return null;

  return { name: worksheet.name, columns, rows };
}
