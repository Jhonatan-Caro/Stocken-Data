// Normalización de valores de celda al modelo interno.
// Regla de oro: toda celda termina como string plano, igual que lo que
// produce csv-parse, para que services, JSONB y UI se comporten idéntico
// sin importar el formato de origen.

export function normalizeCellValue(value) {
  if (value === null || value === undefined) return "";

  if (value instanceof Date) return value.toISOString();

  if (typeof value === "object") {
    // Fórmula: usar el resultado calculado (puede ser Date, número, etc.)
    if ("formula" in value || "sharedFormula" in value) {
      return normalizeCellValue(value.result);
    }
    if (Array.isArray(value.richText)) {
      return value.richText.map((run) => run.text ?? "").join("");
    }
    // Hyperlink: { text, hyperlink }
    if ("hyperlink" in value) {
      return normalizeCellValue(value.text);
    }
    // Celdas de error (#DIV/0!, #N/A, ...)
    if ("error" in value) return "";
    return String(value);
  }

  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);

  return String(value).trim();
}

// Devuelve el nombre de columna a usar para una cabecera, o null si la
// cabecera está vacía (columna descartada). `seen` acumula los nombres ya
// usados para desambiguar duplicados con sufijos _2, _3, ...
export function normalizeHeader(value, seen) {
  const base = normalizeCellValue(value);
  if (!base) return null;

  let name = base;
  let suffix = 2;
  while (seen.has(name)) {
    name = `${base}_${suffix}`;
    suffix++;
  }
  seen.add(name);
  return name;
}
