import ExcelJS from "exceljs";
import { normalizeCellValue, normalizeHeader } from "./normalize.js";

const XLSX_MIMETYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const ExcelImporter = {
  format: "xlsx",

  canHandle(file) {
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

function parseWorksheet(worksheet) {
  const headerRow = worksheet.getRow(1);

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

    for (const [col, name] of Object.entries(headers)) {
      const value = normalizeCellValue(excelRow.getCell(Number(col)).value);
      row[name] = value;
      if (value !== "") hasValue = true;
    }

    if (hasValue) rows.push(row);
  }

  if (rows.length === 0) return null;

  return { name: worksheet.name, columns, rows };
}
