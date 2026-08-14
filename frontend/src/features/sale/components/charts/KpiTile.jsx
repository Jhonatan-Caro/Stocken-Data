import { INK } from "./theme";

export default function KpiTile({ label, value, hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xs" style={{ color: INK.secondary }}>
        {label}
      </p>
      <p
        className="text-xl font-semibold mt-1 truncate"
        style={{ color: INK.primary }}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </p>
      {hint && (
        <p className="text-[11px] mt-0.5" style={{ color: INK.muted }}>
          {hint}
        </p>
      )}
    </div>
  );
}
