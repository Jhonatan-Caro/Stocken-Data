import { parse } from "csv-parse/sync";

export const CsvImporter = {
  format: "csv",

  canHandle(file) {
    return (
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv")
    );
  },

  parse(buffer) {
    const rows = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (rows.length === 0) {
      return { format: this.format, sheets: [], defaultSheet: null };
    }

    return {
      format: this.format,
      sheets: [{ name: "default", columns: Object.keys(rows[0]), rows }],
      defaultSheet: "default",
    };
  },
};
