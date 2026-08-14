import { INK } from "./theme";

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map(({ label, color }) => (
        <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: INK.secondary }}>
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

export function Tooltip({ x, y, containerWidth, children }) {
  const flip = containerWidth != null && x > containerWidth / 2;
  return (
    <div
      className="absolute z-10 pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs"
      style={{
        left: x,
        top: y,
        transform: flip
          ? "translate(calc(-100% - 12px), -50%)"
          : "translate(12px, -50%)",
        maxWidth: 240,
      }}
    >
      {children}
    </div>
  );
}

export function TooltipRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="flex items-center gap-1.5" style={{ color: INK.secondary }}>
        {color && (
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
      <span className="font-medium" style={{ color: INK.primary }}>
        {value}
      </span>
    </div>
  );
}
