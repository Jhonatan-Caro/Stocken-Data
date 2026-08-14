export const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  surface: "#ffffff",
};

export const SERIES = {
  ingresos: "#2a78d6",
  beneficio: "#1baf7a",
};

export const CLASSIFICATION = {
  potencial: { color: "#008300", label: "Potencial" },
  volumen_sin_margen: { color: "#eda100", label: "Volumen sin margen" },
  nicho_rentable: { color: "#2a78d6", label: "Nicho rentable" },
  no_potencial: { color: "#e34948", label: "No potencial" },
  sin_datos: { color: "#898781", label: "Sin datos" },
};

export function fmtEuro(n, decimals = 0) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("es-ES");
}

export function fmtPct(n, decimals = 1) {
  if (n === null || n === undefined) return "—";
  return `${(Number(n) * 100).toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`;
}

export function warehouseLabel(p) {
  return [p.warehouse, p.location].filter(Boolean).join(" · ") || "—";
}

export function fmtCompact(n) {
  if (n === null || n === undefined) return "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 1 })}M`;
  if (abs >= 1_000) return `${(n / 1_000).toLocaleString("es-ES", { maximumFractionDigits: 1 })}k`;
  return fmtNum(n);
}

export function niceTicks(maxValue, targetCount = 4) {
  if (!maxValue || maxValue <= 0) return [0, 1];
  const rawStep = maxValue / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const step =
    residual <= 1 ? magnitude
    : residual <= 2 ? 2 * magnitude
    : residual <= 5 ? 5 * magnitude
    : 10 * magnitude;

  const ticks = [];
  for (let v = 0; v <= maxValue + step * 0.001; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < maxValue) ticks.push(ticks.length * step);
  return ticks;
}
