// SobreNosotros.jsx

// Página donde se describe, que es ?, y como funciona? (Stocken Data).

import Menu from "../../componentsV/Menu";
import Footer from "../../componentsV/Footer";

import { FaBoxOpen, FaRobot, FaBell, FaFileExcel, FaMobileAlt } from "react-icons/fa";

export default function SobreNosotros() {
  return (
    // --> TODO EL CONTENIDO DE LA PÁGINA.
    <div className="bg-gray-50">
      {/* -> MENU <- */}
      <div className="fixed top-0 left-0 w-full z-50"><Menu /></div>

      {/* BANNER */}
      <main className="min-h-screen flex justify-center items-center pt-10">

        {/* Contenedor Principal -> / 2 Columnas*/}
        <div className="w-full mx-auto flex flex-col px-10 text-sm gap-20 / lg:px-60 lg:flex-row lg:gap-10">

          {/* Columna izquierda: Sobre Nosotros */}
          <div className="w-full lg:w-1/2 space-y-4">
            <h2 className="text-4xl font-bold text-custom-verde">Sobre nosotros</h2>
            <p>/ About us</p>
          </div>

          {/* Columna derecha: Descripción */}
          <div className="w-full lg:w-1/2 space-y-4 text-justify">
            {/* <h2 className="text-4xl font-bold text-custom-azul">Stocken Data</h2> */}
            <h2 className="text-4xl font-bold text-custom-azul text-center lg:text-left">Stocken Data</h2>
            <p>Stocken Data es una plataforma web desarrollada bajo un modelo SaaS (Software as a Service) que permite a pequeños negocios y usuarios individuales gestionar su inventario de manera eficiente, simple y accesible. El sistema combina una interfaz intuitiva con funcionalidades avanzadas basadas en inteligencia artificial, proporcionando una solución integral para el control y organización de productos, insumos y recursos en tiempo real.</p>
            <p>La plataforma está diseñada con una arquitectura de microservicios desacoplados, lo que permite una alta escalabilidad, facilidad de mantenimiento y flexibilidad en el desarrollo. Cada componente del sistema (frontend, backend, base de datos y servicios de IA) opera de manera independiente, comunicándose entre sí mediante APIs RESTful seguras.</p>
          </div>
        </div>
      </main>

      {/* --> Sección_1 - Características Principales --> */}
      <div className="w-full text-center px-10 pb-20 , lg:px-40">
        <h2 className="text-4xl font-bold text-custom-azul mb-8 pb-10">Características Principales</h2>
        
        {/* -->  5 Columnas*/}
        <div className="grid grid-cols-1 gap-20 sm:grid-cols-2 lg:gap-10 lg:grid-cols-5 text-sm text-custom-azul">

          {/* Item 1 */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <FaBoxOpen className="text-4xl"/>
            <h3 className="font-bold">Gestión de inventario en tiempo real</h3>
            <p className="text-xs">
              Registro, edición, eliminación y visualización de productos mediante un panel interactivo.
            </p>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <FaRobot className="text-4xl"/>
            <h3 className="font-bold">Consultas inteligentes con AI</h3>
            <p className="text-xs">
              Asistente virtual que responde preguntas como: “¿Qué productos tienen bajo stock?” o “¿Cuál fue el más vendido este mes?”.
            </p>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <FaBell className="text-4xl"/>
            <h3 className="font-bold">Alertas automatizadas</h3>
            <p className="text-xs">
              Notificaciones inteligentes sobre niveles críticos de stock o fechas próximas de vencimiento.
            </p>
          </div>

          {/* Item 4 */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <FaFileExcel className="text-4xl"/>
            <h3 className="font-bold">Integración con Excel</h3>
            <p className="text-xs">
              Automatización de la facturación y exportación de datos en formatos compatibles.
            </p>
          </div>

          {/* Item 5 */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <FaMobileAlt className="text-4xl" />
            <h3 className="font-bold">Diseño Responsive</h3>
            <p className="text-xs">
              Acceso desde cualquier dispositivo, con diseño optimizado para escritorio y móviles.
            </p>
          </div>
        </div>
      </div>
      {/* -> FOOTER <- */}
      <Footer />
    </div>
  );
}