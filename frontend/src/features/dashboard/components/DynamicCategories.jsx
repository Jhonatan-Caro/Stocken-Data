import { FiMonitor, FiBriefcase, FiPackage, FiPlus, FiGrid } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function CategoryCard({ index, name, items, progress }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">

          <div>
            <div className="font-semibold text-gray-800">{name}</div>
            <div className="text-xs text-gray-500">{items} items</div>
          </div>
        </div>
        <div className="w-7 h-7 rounded-md bg-gray-50 text-gray-400 flex items-center justify-center">
          <FiGrid size={14} />
        </div>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0b3041] rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
        />
      </div>
    </div>
  );
}

export default function DynamicCategories({ categories = [] }) {
  const navigate = useNavigate();

  const data =
    categories.length > 0
      ? categories
      : [
          { name: "Sin categorias", items: 0, progress: 0 },
        ];

  return (
    <aside className="flex flex-col gap-4 h-full">
      <h2 className="text-lg font-semibold text-gray-800">Dynamic Categories</h2>
      <div className="max-h-[650px] overflow-y-auto space-y-4 pr-2">
        {data.map((c, idx) => (
          <CategoryCard
            key={c.name + idx}
            index={idx}
            name={c.name}
            items={c.items}
            progress={c.progress}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => navigate("/upload-data")}
        className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 hover:bg-white p-6 flex flex-col items-center justify-center text-gray-500 hover:text-[#0b3041] transition"
      >
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
          <FiPlus size={20} />
        </div>
        <span className="text-sm font-medium">Nueva Categoría</span>
      </button>
    </aside>
  );
}
