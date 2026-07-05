import { FiMonitor, FiBriefcase, FiPackage, FiPlus, FiGrid } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PALETTE = [
  { icon: FiMonitor, accent: "from-[#03a696] to-[#0b3041]" },
  { icon: FiBriefcase, accent: "from-[#3b82f6] to-[#0b3041]" },
  { icon: FiPackage, accent: "from-[#f59e0b] to-[#0b3041]" },
  { icon: FiGrid, accent: "from-[#a855f7] to-[#0b3041]" },
];

function CategoryCard({ index, nombre, items, progreso }) {
  const { icon: Icon } = PALETTE[index % PALETTE.length];
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
            <Icon size={18} />
          </div>
          <div>
            <div className="font-semibold text-gray-800">{nombre}</div>
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
          style={{ width: `${Math.min(100, Math.max(5, progreso))}%` }}
        />
      </div>
    </div>
  );
}

export default function DynamicCategories({ categorias = [] }) {
  const navigate = useNavigate();

  const datos =
    categorias.length > 0
      ? categorias
      : [
          { nombre: "Electronics", items: 1240, progreso: 75 },
          { nombre: "Office Supplies", items: 685, progreso: 55 },
          { nombre: "Furniture", items: 412, progreso: 38 },
        ];

  return (
    <aside className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">Dynamic Categories</h2>
      {datos.map((c, idx) => (
        <CategoryCard
          key={c.nombre + idx}
          index={idx}
          nombre={c.nombre}
          items={c.items}
          progreso={c.progreso}
        />
      ))}

      <button
        type="button"
        onClick={() => navigate("/cargar-datos")}
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
