import { useState } from "react";
import { INK, SERIES, fmtEuro } from "./theme";
import { Tooltip, TooltipRow } from "./ChartBits";
import useMeasure from "./useMeasure";

const BAR_H = 20;
const ROW_H = 34;
const LABEL_W = 120;
const VALUE_W = 70;

export default function HBarChart({ data, tooltipRows }) {
  const [containerRef, width] = useMeasure();
  const [hover, setHover] = useState(null);

  if (!data?.length)
    return (
      <div className="flex items-center justify-center h-24 text-sm text-gray-400">
        Sin datos para el periodo seleccionado
      </div>
    );

  const height = data.length * ROW_H;
  const plotW = Math.max(width - LABEL_W - VALUE_W, 0);
  const maxValue = Math.max(...data.map((d) => d.value), 0) || 1;

  return (
    <div ref={containerRef} className="relative">
      {width > 0 && (
        <svg width={width} height={height} role="img">
          {data.map((d, i) => {
            const barW = Math.max((d.value / maxValue) * plotW, 2);
            const yTop = i * ROW_H + (ROW_H - BAR_H) / 2;
            return (
              <g
                key={d.label}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <rect
                  x="0" y={i * ROW_H} width={width} height={ROW_H}
                  fill="transparent"
                />
                <text
                  x={LABEL_W - 10} y={i * ROW_H + ROW_H / 2}
                  textAnchor="end" dominantBaseline="middle"
                  fontSize="11" fill={INK.secondary}
                >
                  {d.label}
                </text>
                <path
                  d={roundedEndBar(LABEL_W, yTop, barW, BAR_H)}
                  fill={SERIES.ingresos}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
                <text
                  x={LABEL_W + barW + 8} y={i * ROW_H + ROW_H / 2}
                  dominantBaseline="middle"
                  fontSize="11" fontWeight="600" fill={INK.primary}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {fmtEuro(d.value)}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {hover !== null && tooltipRows && (
        <Tooltip x={LABEL_W + 40} y={hover * ROW_H + ROW_H / 2}>
          <p className="font-semibold mb-1" style={{ color: INK.primary }}>
            {data[hover].label}
          </p>
          {tooltipRows(data[hover]).map((r) => (
            <TooltipRow key={r.label} label={r.label} value={r.value} />
          ))}
        </Tooltip>
      )}
    </div>
  );
}

function roundedEndBar(x, y, w, h, r = 4) {
  const radius = Math.min(r, w);
  return [
    `M ${x} ${y}`,
    `H ${x + w - radius}`,
    `A ${radius} ${radius} 0 0 1 ${x + w} ${y + radius}`,
    `V ${y + h - radius}`,
    `A ${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}`,
    `H ${x}`,
    "Z",
  ].join(" ");
}
