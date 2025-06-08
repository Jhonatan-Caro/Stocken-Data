// Header.jsx
// Menu general al entrar a la aplicación (Stocken Data).

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import { FiHome, FiTablet, FiShoppingBag, FiDatabase } from "react-icons/fi"; // Íconos
import { useEffect } from "react";

export default function DashboardMenu() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }
  const [menuAbierto, setMenuAbierto] = useState(false);
  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);
  const location = useLocation();
  const {user,fetchUser} = useUsers();
  useEffect(() => {
      fetchUser()
  }, []);

  const links = [
    { ruta: "/dashboard", texto: "Inicio", icono: <FiDatabase size={18} /> },
    { ruta: "/cargar-datos", texto: "Categorías", icono: <FiTablet size={18} /> },
    { ruta: "/ventas", texto: "Ventas", icono: <FiShoppingBag size={18} /> },
    { ruta: "/inicio", texto: "Home", icono: <FiHome size={18} />}
  ];

  return (
    <header className="bg-custom-blanco fixed w-full top-0 z-50 shadow-md transition-all duration-300 ease-in-out">
      {/* Título */}
      <div className="w-full text-custom-verde text-l font-bold text-center py-4 border-b border-gray-200 ">
        {user?.name ? `Bienvenido,  ${user.name}` : ""}
      </div>

      {/* Navegación escritorio */}
      <div className="hidden md:flex justify-between items-center px-10 py-3">
        <nav className="flex space-x-12 text-sm items-center">
          {links.map(({ ruta, texto, icono }) => {
            const activo = location.pathname === ruta;
            return (
              <Link
                key={ruta}
                to={ruta}
                className={`flex items-center gap-2 transition duration-200 transform hover:scale-105 ${
                  activo
                    ? "text-custom-verde font-semibold"
                    : "text-custom-azul hover:text-custom-verde"
                }`}
              >
                {icono}
                {texto}
              </Link>
            );
          })}
        </nav>

        {/* Botón para cerrar sesión */}
        <div>
          <button
            onClick={handleLogout}
            className="text-red-600 text-sm hover:text-red-800 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      
      {/* Hamburguesa móvil */}
      <div className="md:hidden flex justify-between px-5 py-2">
        <button
          className="text-xl text-custom-azul"
          onClick={toggleMenu}
          aria-label="Abrir o cerrar menú"
        >
          {menuAbierto ? "✕" : "☰"}
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuAbierto ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-2 bg-white shadow-md">
          {links.map(({ ruta, texto, icono }) => {
            const activo = location.pathname === ruta;
            return (
              <Link
                key={ruta}
                to={ruta}
                onClick={cerrarMenu}
                className={`py-2 flex items-center gap-2 transition duration-200 ${
                  activo
                    ? "text-custom-verde font-semibold"
                    : "text-custom-azul hover:text-custom-verde"
                }`}
              >
                {icono}
                {texto}
              </Link>
            );
          })}
          <button
            onClick={() => {
              cerrarMenu();
              handleLogout();
            }}
            className="mt-2 py-2 text-left text-red-600 hover:text-red-800"
          >
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}
