import { Link } from "react-router-dom";
import instagram from "../../../assets/menu/instagram.png";
import github from "../../../assets/menu/github.png";
import facebook from "../../../assets/menu/facebook.png";

const links = [
  { ruta: "/inicio", texto: "Inicio" },
  { ruta: "/planes", texto: "Planes" },
  { ruta: "/sobre-nosotros", texto: "Sobre Nosotros" },
  { ruta: "/soporte", texto: "Soporte" },
];

export default function Footer() {
  return (
    <footer className="bg-custom-blanco text-center text-xs text-custom-azul">
      <div className="space-y-5">
        <div className="text-sm text-custom-verde font-bold text-center py-4 border-t border-gray-400 border-b border-gray-400">
          stockendata.com
        </div>
        <p>PROYECTO 2º DAW</p>
        <p>Davante | MEDAC (Instituto de Formación Profesional)</p>
        <p>Almería, España</p>
      </div>

      <div className="flex justify-center items-center space-x-3 mt-4">
        {links.map((link, index) => (
          <span key={link.ruta} className="flex items-center space-x-1">
            <Link
              to={link.ruta}
              className="font-medium hover:text-custom-verde transition duration-200 ease-in-out"
            >
              {link.texto}
            </Link>
            {index !== links.length - 1 && <span>|</span>}
          </span>
        ))}
      </div>

      <div className="flex justify-center items-center space-x-4 mt-4">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={facebook} alt="Facebook" className="h-6" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={instagram} alt="Instagram" className="h-6" />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <img src={github} alt="GitHub" className="h-6" />
        </a>
      </div>

      <div className="py-4"></div>
    </footer>
  );
}
