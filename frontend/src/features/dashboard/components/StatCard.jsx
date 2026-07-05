function MiniLine({ color = "#03a696" }) {
  return (
    <svg
      viewBox="0 0 120 40"
      className="w-full h-10 mt-2"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,30 L15,22 L30,26 L45,14 L60,20 L75,8 L90,16 L105,6 L120,12 L120,40 L0,40 Z"
        fill={`url(#grad-${color})`}
      />
      <path
        d="M0,30 L15,22 L30,26 L45,14 L60,20 L75,8 L90,16 L105,6 L120,12"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniBars({ color = "#0b3041" }) {
  const heights = [10, 18, 12, 22, 16, 28, 20, 14, 30, 18, 24, 16, 26, 20, 32, 22];
  return (
    <svg
      viewBox="0 0 160 40"
      className="w-full h-10 mt-2"
      preserveAspectRatio="none"
    >
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 10 + 1}
          y={40 - h}
          width={6}
          height={h}
          rx={1.5}
          fill={color}
          opacity={i === 8 ? 1 : 0.6}
        />
      ))}
    </svg>
  );
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaTone = "positive",
  hint,
  chart = "line",
  color = "#03a696",
}) {
  const deltaColor =
    deltaTone === "positive"
      ? "text-emerald-500"
      : deltaTone === "negative"
        ? "text-red-500"
        : "text-gray-400";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-1 min-h-[160px]">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        {Icon && <Icon size={16} className="text-gray-500" />}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      {delta && (
        <div className={`text-xs font-medium ${deltaColor}`}>{delta}</div>
      )}
      {hint && !delta && (
        <div className="text-xs text-gray-400">{hint}</div>
      )}
      <div className="mt-auto">
        {chart === "bars" ? <MiniBars color={color} /> : <MiniLine color={color} />}
      </div>
    </div>
  );
}
