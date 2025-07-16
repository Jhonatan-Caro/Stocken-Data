// Inicio.jsx

// Página principal de Stocken Data

import Menu from '../../componentsV/Menu';
import Footer from "../../componentsV/Footer";
import { FiPenTool, FiMonitor, FiCpu } from "react-icons/fi";
import { Link } from "react-router-dom";

import { FaReact, FaPython, FaJsSquare } from "react-icons/fa";
import { SiPostgresql, SiTailwindcss, SiFastapi, SiOpenai } from "react-icons/si";

import inicio from "../../assets/inicio/inicio.png";

export default function Inicio() {
  return (
    <div className="bg-gray-50">
      {/* MENU */}
      <div className="fixed top-0 left-0 w-full z-50 "><Menu /></div>

      {/* MAIN */}
      <main className="min-h-screen flex justify-center items-center pt-40 / lg:pt-20">
        
        {/* Contenedor Principal -> / 2 Columnas*/}
        <div className="w-full mx-auto flex flex-col px-10 text-sm gap-10 / lg:px-60 lg:flex-row pt-20">

          {/* Columna izquierda: Título */}
          <div className="text-justify w-full lg:w-1/2">
            <h2 className="text-5xl font-bold text-custom-azul mb-1">STOCKEN DATA</h2>
            <p className="tracking-widest mb-8 / lg:mb-6">TU INVENTARIO SIN COMPLICACIONES</p>

            {/* Descripción */}
            <p className='mb-4'>Crea y organiza tus productos a través de <span className="font-bold">STOCKEN DATA </span>, una herramienta que te proporciona todo lo necesario para gestionar tu <span className="font-bold">INVENTARIO </span>de forma eficiente, ahora con inteligencia artificial incorporada para optimizar tus procesos, haz clic en el botón para saber más...</p>

            {/* Boton -> /sobre-nosotros.jsx */}
            <Link to="/sobre-nosotros"
              className="text-xs block text-center w-full bg-custom-verde text-white font-bold py-2 rounded-lg hover:bg-custom-azul transition duration-200">Más Información&nbsp;&nbsp;<span className="font-bold">⭢</span>
            </Link>

            {/* Características */}
            <section className="w-full">
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-20 text-center / lg:mt-12 lg:gap-0">
                {/* Interfaz Intuitiva */}
                <div className="flex flex-col items-center">
                  <div className="border-4 border-black rounded-full p-4 mb-4">
                    <FiPenTool className="w-8 h-8" />
                  </div>
                  <p className="font-medium">Interfaz Intuitiva</p>
                </div>

                {/* Multiplataforma */}
                <div className="flex flex-col items-center">
                  <div className="border-4 border-black rounded-full p-4 mb-4">
                    <FiMonitor className="w-8 h-8" />
                  </div>
                  <p className="font-medium">Multiplataforma</p>
                </div>

                {/* Incorpora AI */}
                <div className="flex flex-col items-center">
                  <div className="border-4 border-black rounded-full p-4 mb-4">
                    <FiCpu className="w-8 h-8" />
                  </div>
                  <p className="font-medium">Incorpora AI (ChatBot)</p>
                </div>
              </div>
            </section>
          </div>

          {/* Columna derecha: Imagen*/}
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <img src={inicio} alt="home" className="h-auto w-[400px]" />
          </div>
        </div>
      </main>

      {/* Seccion_1 -> Tecnologias <Utilizadas></Utilizadas> */}
      <div className="w-full text-center px-10 pb-20 , lg:px-40 bg-blue-50">
        <h2 className="py-20 text-4xl font-bold text-custom-azul mb-8 pb-10">Tecnologías utilizadas</h2>

        {/* -> Tecnologías */}
        <div className="grid grid-cols-1 gap-20 sm:grid-cols-2 lg:gap-10 lg:grid-cols-7 text-sm text-custom-azul">
          <div className="flex flex-col items-center space-y-4 text-center">
            <FaReact className="text-8xl lg:text-6xl"/>
            <h3 className="font-bold">React</h3>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <FaPython className="text-8xl lg:text-6xl" />
            <h3 className="font-bold">Python</h3>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <SiPostgresql className="text-8xl lg:text-6xl" />
            <h3 className="font-bold">PostgreSQL</h3>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <FaJsSquare className="text-8xl lg:text-6xl" />
            <h3 className="font-bold">JavaScript</h3>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <SiTailwindcss className="text-8xl lg:text-6xl" />
            <h3 className="font-bold">Tailwind CSS</h3>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <SiFastapi className="text-8xl lg:text-6xl" />
            <h3 className="font-bold">FastAPI</h3>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <SiOpenai className="text-8xl lg:text-6xl" />
            <h3 className="font-bold">OpenAI</h3>
          </div>
        </div>

      </div>
      {/* FOOTER */}
      <Footer />
    </div>
  );
}