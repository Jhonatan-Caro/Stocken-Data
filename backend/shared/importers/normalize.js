export function normalizeCellValue(value) {
  if (value === null || value === undefined) return "";

  if (value instanceof Date) return value.toISOString();

  if (typeof value === "object") {
    if ("formula" in value || "sharedFormula" in value) {
      return normalizeCellValue(value.result);
    }
    if (Array.isArray(value.richText)) {
      return value.richText.map((run) => run.text ?? "").join("");
    }
    if ("hyperlink" in value) {
      return normalizeCellValue(value.text);
    }
    if ("error" in value) return "";
    return String(value);
  }

  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);

  return String(value).trim();
}

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
