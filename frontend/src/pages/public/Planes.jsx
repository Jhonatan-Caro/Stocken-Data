// Planes.jsx

// Página donde se muestran los planes disponibles de Stocken Data.

import Menu from "../../componentsV/Menu";
import Footer from "../../componentsV/Footer";

export default function Planes() {
  return (
    <div className="bg-gray-80">
      {/* MENU */}
      <div className="fixed top-0 left-0 w-full z-50"><Menu /></div>

      {/* MAIN */}
      <main className="min-h-screen flex justify-center items-center pt-40">
        <div className="w-full text-center px-10 pb-20 / lg:px-60 bg-green-00">

          {/* Título */}
          <h2 className="text-4xl font-bold text-custom-verde pb-4">Planes disponibles</h2>
          <p className="pb-4">/ Plans available</p>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto border-4 border-custom-azul">
              <thead className="bg-custom-verde text-white border-b-2 border-custom-azul">
                <tr>
                  <th className="border-r-2 border-custom-azul px-6 py-4 font-bold">Plan</th>
                  <th className="border-r-2 border-custom-azul px-4 py-4 font-bold">Precio / Año</th>
                  <th className="border-r-2 border-custom-azul px-4 py-4 font-bold">Beneficios</th>
                  <th className="font-bold">Cliente</th>
                </tr>
              </thead>
              <tbody className="text-xs text-center">
                <tr className="bg-custom-blanco border-b-2 border-custom-azul">
                  <td className="border-r-2 border-custom-azul px-4 py-6">Básico</td>
                  <td className="border-r-2 border-custom-azul px-4 py-6">60€</td>
                  <td className="border-r-2 border-custom-azul px-4 py-6">Soporte estándar, Almacenamiento Limitado.</td>
                  <td className="px-4 py-6">Uso Personal</td>
                </tr>
                <tr className="bg-custom-blanco border-b-2 border-custom-azul">
                  <td className="border-r-2 border-custom-azul px-6 py-6">Profesional</td>
                  <td className="border-r-2 border-custom-azul px-4 py-6">600€</td>
                  <td className="border-r-2 border-custom-azul px-4 py-6">Almacenamiento ilimitado, Actualizaciones Completas y Soporte prioritario.</td>
                  <td className="px-4 py-6">Pequeños negocios y Autónomos.</td>
                </tr>
                <tr className="bg-custom-blanco">
                  <td className="border-r-2 border-custom-azul px-6 py-6">Personalizado</td>
                  <td className="border-r-2 border-custom-azul px-4 py-6">Según convenio</td>
                  <td className="border-r-2 border-custom-azul px-4 py-6">Desarrollo a medida, Soporte premium, Asistencia 24/7.</td>
                  <td className="px-4 py-6">Grandes empresas con necesidades específicas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}