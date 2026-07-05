export default function SaleFilter({ dates, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="ml-auto border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:border-[#03a696] transition"
    >
      <option value="">All dates</option>
      {dates.map((date) => (
        <option key={date} value={date}>
          {new Date(date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </option>
      ))}
    </select>
  );
}
