import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import httpClient from "../../../services/httpCliente";

import "../../../styles/menu.css";

import user from "../../../assets/menu/user.png";
import search from "../../../assets/menu/search.png";
import facebook from "../../../assets/menu/facebook.png";
import instagram from "../../../assets/menu/instagram.png";
import github from "../../../assets/menu/github.png";

export default function Menu() {
  const navigate = useNavigate();

  const handleDashboardRedirect = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await httpClient.get("/dashboard");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al válidar token:", error);
      navigate("/login");
    }
  };

  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  const cerrarMenu = () => setMenuAbierto(false);

  const links = [
    { ruta: "/inicio", texto: "Inicio" },
    { ruta: "/planes", texto: "Planes" },
    { ruta: "/sobre-nosotros", texto: "Sobre Nosotros" },
    { ruta: "/soporte", texto: "Soporte" },
  ];

  return (
    <header className="bg-custom-blanco fixed w-full top-0 z-50 shadow-md transition-all duration-300 ease-in-out">
      <div className="w-full text-custom-verde text-l font-bold text-center py-4 border-b border-gray-200">
        STOCKEN DATA
      </div>

      <div className="flex items-center justify-between w-full py-2 px-5 text-sm transition-all duration-300">
        <div className="flex items-center space-x-2 border-r border-gray-200 pr-5">
          <div>
            <button
              onClick={handleDashboardRedirect}
              className="flex md:hidden items-center p-2 rounded-full hover:bg-gray-200 transition duration-200"
            >
              <img src={user} alt="Usuario" className="h-5 w-5" />
            </button>
            <button
              onClick={handleDashboardRedirect}
              className="hidden md:flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 transition duration-200"
            >
              <img src={user} alt="Usuario" className="h-4 w-4" />
              <span className="text-sm font-medium text-custom-azul">
                Mi cuenta
              </span>
            </button>
          </div>
          <button className="flex items-center p-2 rounded-full hover:bg-gray-200 transition duration-200">
            <img src={search} alt="Buscar" className="h-4 w-4" />
          </button>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {links.map(({ ruta, texto }) => {
            const activo = location.pathname === ruta;
            return (
              <Link
                key={ruta}
                to={ruta}
                className={`font-medium transition duration-200 transform hover:scale-105 ${
                  activo
                    ? "text-custom-verde font-semibold"
                    : "text-custom-azul hover:text-custom-verde"
                }`}
              >
                {texto}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3 border-l border-gray-200 pl-5">
          <div className="hidden md:flex items-center space-x-3">
            {[facebook, instagram, github].map((icono, i) => (
              <a
                key={i}
                href="#"
                className="p-1 rounded-full hover:bg-gray-200 transition duration-200"
              >
                <img src={icono} alt="social" className="h-5 w-5" />
              </a>
            ))}
          </div>

          <button
            className="md:hidden text-xl text-custom-azul focus:outline-none transition duration-200"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Abrir o cerrar menú"
          >
            {menuAbierto ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuAbierto ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-2 bg-white shadow-md animate-slide-down">
          {links.map(({ ruta, texto }) => {
            const activo = location.pathname === ruta;
            return (
              <Link
                key={ruta}
                to={ruta}
                onClick={cerrarMenu}
                className={`font-medium py-2 transition duration-200 ${
                  activo
                    ? "text-custom-verde font-semibold"
                    : "text-custom-azul hover:text-custom-verde"
                }`}
              >
                {texto}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
