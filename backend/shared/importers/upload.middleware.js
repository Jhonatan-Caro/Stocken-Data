import multer from "multer";

const XLSX_MIMETYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Multer compartido para los endpoints de importación.
// memoryStorage: el buffer va directo al controller, sin escribir en disco.
export const spreadsheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const name = file.originalname.toLowerCase();

    const isCsv = file.mimetype === "text/csv" || name.endsWith(".csv");
    const isXlsx = file.mimetype === XLSX_MIMETYPE || name.endsWith(".xlsx");

    if (isCsv || isXlsx) {
      cb(null, true);
    } else {
      // .xls (Excel antiguo) queda excluido a propósito
      cb(new Error("Solo se permiten archivos CSV o Excel (.xlsx)"));
    }
  },
});
