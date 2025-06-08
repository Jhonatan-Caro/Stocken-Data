import Ventas from "../../components/Ventas";
import VentasDinamicas from "../../components/VentasDinamicas";
import ChatBotWrapper from "../../componentsV/ChatBotWrapper";
import Header from "../../componentsV/Header";

export default function PaginaVentas() {
  return (
    <div className="min-h-screen bg-gray-50">
    
    {/* Header */}
        <div className="fixed top-0 left-0 w-full z-50"><Header /></div>

        {/* Contenedor Principal */}
        <div className="pt-32 px-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Ventas</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Apartado Izquierda */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <Ventas />
              </div>

              {/* Apartado Derecha */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <VentasDinamicas />
              </div>
            </div>
        </div>

        {/* Botón de ChatBot estático */}
        <div><ChatBotWrapper /></div>
    </div>
  );
}