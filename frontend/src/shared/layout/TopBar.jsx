import { useState } from "react";
import { FiSearch, FiBell, FiMenu, FiChevronDown } from "react-icons/fi";

export default function TopBar({ user, onSearch, onToggleSidebar }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    console.log("TopBar:", value);

    setQuery(value);
    if (onSearch) onSearch(value);
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        aria-label="Abrir menú"
      >
        <FiMenu size={20} />
      </button>

      <div className="flex-1 relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search inventory, products..."
          className="w-full bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition"
        />
      </div>

      <button
        type="button"
        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600"
        aria-label="Notificaciones"
      >
        <FiBell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#03a696] to-[#0b3041] text-white flex items-center justify-center font-semibold text-sm">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="text-sm font-semibold text-gray-800">
            {user?.name || "Invitado"}
          </span>
          <span className="text-xs text-gray-400">{user?.role || "Role"}</span>
        </div>
        <FiChevronDown className="hidden sm:block text-gray-400" size={16} />
      </div>
    </div>
  );
}
