import { useState } from "react";
import { INK, fmtCompact, niceTicks } from "./theme";
import { Legend, Tooltip, TooltipRow } from "./ChartBits";
import useMeasure from "./useMeasure";

const PAD = { top: 12, right: 16, bottom: 24, left: 44 };

export default function LineChart({ data, series, height = 240 }) {
  const [containerRef, width] = useMeasure();
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!data?.length) return <EmptyChart height={height} />;

  const plotW = Math.max(width - PAD.left - PAD.right, 0);
  const plotH = height - PAD.top - PAD.bottom;

  const maxValue = Math.max(
    ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)),
    0,
  );
  const ticks = niceTicks(maxValue);
  const yMax = ticks[ticks.length - 1];

  const x = (i) =>
    PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v) => PAD.top + plotH - (v / yMax) * plotH;

  const paths = series.map((s) => ({
    ...s,
    d: data
      .map((d, i) => {
        const v = d[s.key];
        if (v === null || v === undefined) return null;
        return `${i === 0 ? "M" : "L"} ${x(i)} ${y(Number(v))}`;
      })
      .filter(Boolean)
      .join(" "),
  }));

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - PAD.left;
    const idx = Math.round((px / plotW) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }

  return (
    <div>
      <Legend items={series} />
      <div ref={containerRef} className="relative mt-2">
        {width > 0 && (
          <svg
            width={width}
            height={height}
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIdx(null)}
            role="img"
          >
            {ticks.map((t) => (
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
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {fmtCompact(t)}
                </text>
              </g>
            ))}

            {data.map((d, i) => {
              const skip = Math.ceil(data.length / 12);
              if (i % skip !== 0) return null;
              return (
                <text
                  key={d.label}
                  x={x(i)} y={height - 6}
                  textAnchor="middle" fontSize="10" fill={INK.muted}
                >
                  {d.label}
                </text>
              );
            })}

            {hoverIdx !== null && (
              <line
                x1={x(hoverIdx)} x2={x(hoverIdx)}
                y1={PAD.top} y2={PAD.top + plotH}
                stroke={INK.axis} strokeWidth="1"
              />
            )}

            {paths.map((s) => (
              <path
                key={s.key}
                d={s.d}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {hoverIdx !== null &&
              series.map((s) => {
                const v = data[hoverIdx][s.key];
                if (v === null || v === undefined) return null;
                return (
                  <circle
                    key={s.key}
                    cx={x(hoverIdx)} cy={y(Number(v))} r="4"
                    fill={s.color}
                    stroke={INK.surface} strokeWidth="2"
                  />
                );
              })}
          </svg>
        )}

        {hoverIdx !== null && (
          <Tooltip x={x(hoverIdx)} y={height / 2} containerWidth={width}>
            <p className="font-semibold mb-1" style={{ color: INK.primary }}>
              {data[hoverIdx].label}
            </p>
            {series.map((s) => (
              <TooltipRow
                key={s.key}
                color={s.color}
                label={s.label}
                value={s.format(data[hoverIdx][s.key])}
              />
            ))}
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ height }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-gray-400"
      style={{ height }}
    >
      Sin datos para el periodo seleccionado
    </div>
  );
}
