import { useMemo, useState } from "react";
import {
  INK,
  CLASSIFICATION,
  fmtEuro,
  fmtNum,
  fmtPct,
  niceTicks,
  warehouseLabel,
} from "./theme";
import { Legend, Tooltip, TooltipRow } from "./ChartBits";
import useMeasure from "./useMeasure";

const PAD = { top: 16, right: 20, bottom: 34, left: 52 };

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default function QuadrantScatter({ data, height = 300 }) {
  const [containerRef, width] = useMeasure();
  const [hover, setHover] = useState(null);

  const points = useMemo(
    () => (data ?? []).filter((p) => p.margin_pct !== null),
    [data],
  );

  if (!points.length)
    return (
      <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
        Sin datos para el periodo seleccionado
      </div>
    );

  const plotW = Math.max(width - PAD.left - PAD.right, 0);
  const plotH = height - PAD.top - PAD.bottom;

  const xTicks = niceTicks(Math.max(...points.map((p) => p.units)));
  const xMax = xTicks[xTicks.length - 1];
  const yMin = Math.min(0, ...points.map((p) => p.margin_pct));
  const yMax = Math.max(...points.map((p) => p.margin_pct), 0.01) * 1.1;

  const x = (units) => PAD.left + (units / xMax) * plotW;
  const y = (pct) => PAD.top + plotH - ((pct - yMin) / (yMax - yMin)) * plotH;

  const medUnits = median(points.map((p) => p.units));
  const medMargin = median(points.map((p) => p.margin_pct));

  const legendItems = Object.entries(CLASSIFICATION)
    .filter(([key]) => points.some((p) => p.classification === key))
    .map(([, v]) => ({ label: v.label, color: v.color }));

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = null;
    let bestDist = 24;
    for (const p of points) {
      const dist = Math.hypot(x(p.units) - mx, y(p.margin_pct) - my);
      if (dist < bestDist) {
        bestDist = dist;
        best = p;
      }
    }
    setHover(best);
  }

  return (
    <div>
      <Legend items={legendItems} />
      <div ref={containerRef} className="relative mt-2">
        {width > 0 && (
          <svg
            width={width}
            height={height}
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
            role="img"
          >
            {[0, 0.25, 0.5].filter((t) => t <= yMax).map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left} x2={width - PAD.right}
                  y1={y(t)} y2={y(t)}
                  stroke={INK.grid} strokeWidth="1"
                />
                <text
                  x={PAD.left - 8} y={y(t)}
                  textAnchor="end" dominantBaseline="middle"
                  fontSize="10" fill={INK.muted}
                >
                  {fmtPct(t, 0)}
                </text>
              </g>
            ))}

            {xTicks.map((t) => (
              <text
                key={t}
                x={x(t)} y={height - 16}
                textAnchor="middle" fontSize="10" fill={INK.muted}
              >
                {fmtNum(t)}
              </text>
            ))}
            <text
              x={PAD.left + plotW / 2} y={height - 2}
              textAnchor="middle" fontSize="10" fill={INK.muted}
            >
              unidades vendidas
            </text>

            <line
              x1={x(medUnits)} x2={x(medUnits)}
              y1={PAD.top} y2={PAD.top + plotH}
              stroke={INK.axis} strokeWidth="1"
            />
            <line
              x1={PAD.left} x2={width - PAD.right}
              y1={y(medMargin)} y2={y(medMargin)}
              stroke={INK.axis} strokeWidth="1"
            />
            <text
              x={x(medUnits) + 4} y={PAD.top + 10}
              fontSize="9" fill={INK.muted}
            >
              mediana uds.
            </text>
            <text
              x={width - PAD.right} y={y(medMargin) - 4}
              textAnchor="end" fontSize="9" fill={INK.muted}
            >
              mediana margen
            </text>

            {points.map((p) => {
              const cls = CLASSIFICATION[p.classification] ?? CLASSIFICATION.sin_datos;
              const isHover = hover?.product_id === p.product_id;
              return (
                <circle
                  key={p.product_id}
                  cx={x(p.units)} cy={y(p.margin_pct)}
                  r={isHover ? 7 : 5}
                  fill={cls.color}
                  stroke={INK.surface} strokeWidth="2"
                  opacity={hover === null || isHover ? 1 : 0.45}
                />
              );
            })}
          </svg>
        )}

        {hover && (
          <Tooltip
            x={x(hover.units)}
            y={y(hover.margin_pct)}
            containerWidth={width}
          >
            <p className="font-semibold mb-1" style={{ color: INK.primary }}>
              {hover.product_name || hover.sku}
            </p>
            <TooltipRow label="SKU" value={hover.sku} />
            <TooltipRow label="Almacén" value={warehouseLabel(hover)} />
            <TooltipRow label="Unidades" value={fmtNum(hover.units)} />
            <TooltipRow label="Ingresos" value={fmtEuro(hover.revenue)} />
            <TooltipRow label="Beneficio" value={fmtEuro(hover.margin)} />
            <TooltipRow label="Margen" value={fmtPct(hover.margin_pct)} />
            <TooltipRow
              color={CLASSIFICATION[hover.classification]?.color}
              label="Clase"
              value={CLASSIFICATION[hover.classification]?.label}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
}
