export function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function looseParseNumber(value) {
  let s = String(value ?? "").trim();
  if (s === "") return null;
  s = s.replace(/[€$£%\s]/g, "");
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",") && !s.includes(".")) {
    s = s.replace(",", ".");
  }
  if (!/^[+-]?\d*\.?\d+$/.test(s)) return null;
  const num = Number(s);
  return Number.isNaN(num) ? null : num;
}

function looksLikeDate(value) {
  const s = String(value ?? "").trim();
  if (!s) return false;
  if (/^\d{4}-\d{2}-\d{2}([ t]\d{2}:\d{2})?/i.test(s)) return true;
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(s)) return true;
  return false;
}

const TYPE_THRESHOLD = 0.7;

export const TYPE_LABEL = {
  integer: "número entero",
  number: "número",
  date: "fecha",
  text: "texto",
  empty: "vacío",
};

export function inferColumnType(values) {
  const nonEmpty = (values ?? [])
    .map((v) => String(v ?? "").trim())
    .filter((v) => v !== "");

  if (nonEmpty.length === 0) return "empty";

  let dates = 0;
  let numbers = 0;
  let integers = 0;

  for (const v of nonEmpty) {
    if (looksLikeDate(v)) {
      dates++;
      continue;
    }
    const num = looseParseNumber(v);
    if (num !== null) {
      numbers++;
      if (Number.isInteger(num)) integers++;
    }
  }

  const n = nonEmpty.length;
  if (dates / n >= TYPE_THRESHOLD) return "date";
  if (numbers / n >= TYPE_THRESHOLD) {
    return integers === numbers ? "integer" : "number";
  }
  return "text";
}

export function typeMatches(fieldType, columnType) {
  if (!fieldType || columnType === "empty") return null;
  if (fieldType === "number") {
    return columnType === "number" || columnType === "integer";
  }
  if (fieldType === "integer") return columnType === "integer";
  if (fieldType === "date") return columnType === "date";
  if (fieldType === "text") return true;
  return null;
}

function bigrams(str) {
  const s = str.replace(/\s/g, "");
  const out = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out;
}

function diceCoefficient(a, b) {
  if (a === b) return 1;
  const A = bigrams(a);
  const B = bigrams(b);
  if (A.length === 0 || B.length === 0) return 0;
  const counts = new Map();
  for (const g of B) counts.set(g, (counts.get(g) ?? 0) + 1);
  let intersection = 0;
  for (const g of A) {
    const c = counts.get(g) ?? 0;
    if (c > 0) {
      intersection++;
      counts.set(g, c - 1);
    }
  }
  return (2 * intersection) / (A.length + B.length);
}

function scoreField(field, columnNorm, columnType) {
  const targets = [field.key, field.label, ...(field.aliases ?? [])]
    .map(normalize)
    .filter(Boolean);

  let score = 0;
  for (const target of targets) {
    if (target === columnNorm) {
      score = 1;
      break;
    }
    const tokens = columnNorm.split(" ");
    if (tokens.includes(target)) {
      score = Math.max(score, 0.85);
    } else if (columnNorm.startsWith(target) || columnNorm.endsWith(target)) {
      score = Math.max(score, 0.7);
    } else {
      const dice = diceCoefficient(target, columnNorm);
      if (dice >= 0.6) score = Math.max(score, dice * 0.9);
    }
  }

  if (score === 0) return 0;

  const match = typeMatches(field.type, columnType);
  if (match === true) score = Math.min(1, score + 0.1);
  else if (match === false) score = score * 0.6;

  return score;
}

function toConfidence(score) {
  if (score >= 0.9) return "high";
  if (score >= 0.6) return "medium";
  return "low";
}

export function autoMapColumns(columns, fields, previewRows = []) {
  const columnTypes = {};
  const columnNorms = {};
  for (const col of columns) {
    columnNorms[col] = normalize(col);
    columnTypes[col] = inferColumnType(previewRows.map((r) => r?.[col]));
  }

  const candidates = [];
  for (const field of fields) {
    for (const col of columns) {
      const score = scoreField(field, columnNorms[col], columnTypes[col]);
      if (score > 0) candidates.push({ fieldKey: field.key, col, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const mapping = {};
  const meta = {};
  const usedFields = new Set();
  const usedCols = new Set();

  for (const cand of candidates) {
    if (usedFields.has(cand.fieldKey) || usedCols.has(cand.col)) continue;
    mapping[cand.fieldKey] = cand.col;
    meta[cand.fieldKey] = toConfidence(cand.score);
    usedFields.add(cand.fieldKey);
    usedCols.add(cand.col);
  }

  return { mapping, meta, columnTypes };
}

export function analyzeMapping(mapping, fields, columnTypes = {}, columns = []) {
  const warnings = [];

  const columnToFields = {};
  for (const field of fields) {
    const col = mapping[field.key];
    if (col) (columnToFields[col] ??= []).push(field.label);
  }
  for (const [col, labels] of Object.entries(columnToFields)) {
    if (labels.length > 1) {
      warnings.push({
        type: "duplicate",
        blocking: true,
        message: `La columna "${col}" está asignada a varios campos: ${labels.join(", ")}.`,
      });
    }
  }

  const missing = fields
    .filter((f) => f.required && !mapping[f.key])
    .map((f) => f.label);
  if (missing.length) {
    warnings.push({
      type: "required",
      blocking: true,
      message: `Campos obligatorios sin mapear: ${missing.join(", ")}.`,
    });
  }

  for (const field of fields) {
    const col = mapping[field.key];
    if (!col) continue;
    if (typeMatches(field.type, columnTypes[col]) === false) {
      warnings.push({
        type: "type",
        blocking: false,
        message: `"${field.label}" está mapeado a "${col}", que parece contener ${TYPE_LABEL[columnTypes[col]]}. Revisa que sea correcto.`,
      });
    }
  }

  const used = new Set(Object.values(mapping).filter(Boolean));
  for (const col of columns) {
    if (used.has(col)) continue;
    const type = columnTypes[col];
    if (type === "date" || type === "number") {
      warnings.push({
        type: "unused",
        blocking: false,
        message: `La columna "${col}" (parece ${TYPE_LABEL[type]}) no está mapeada a ningún campo.`,
      });
    }
  }

  return warnings;
}
