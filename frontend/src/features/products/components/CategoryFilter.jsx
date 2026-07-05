export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="ml-auto border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:border-[#03a696] transition"
    >
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.id} value={String(c.id)}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
