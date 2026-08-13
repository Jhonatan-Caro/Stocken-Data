import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiGrid,
  FiTrendingUp,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const links = [
  { ruta: "/dashboard", texto: "Dashboard", icono: FiHome },
  { ruta: "/products", texto: "Products", icono: FiBox },
  { ruta: "/categories", texto: "Categories", icono: FiGrid },
  { ruta: "/sales", texto: "Sales", icono: FiTrendingUp },
  { ruta: "/sales/statistics", texto: "Statistics", icono: FiBarChart2 },
  { ruta: "/settings", texto: "Settings", icono: FiSettings },
];

export default function Sidebar({ open = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-40 transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          bg-[#0b3041] text-white flex flex-col`}
      >
        <div className="flex items-center gap-3 px-7 py-7">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg">
            S
          </div>
          <span className="text-xl font-semibold tracking-wide">Stocken</span>
        </div>

        <nav className="flex-1 px-4 mt-3 space-y-1">
          {links.map(({ ruta, texto, icono: Icono }) => {
            const activo = location.pathname === ruta;
            return (
              <Link
                key={ruta}
                to={ruta}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${
                    activo
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icono size={18} />
                <span>{texto}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mx-4 mb-6 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
        >
          <FiLogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </aside>
    </>
  );
}
