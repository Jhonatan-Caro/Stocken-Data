import FormularioCSV from "../../components/FormularioCSV";
import TablaRegistros from "../../components/TablaRegistros";
import ChatBotWrapper from "../../componentsV/ChatBotWrapper";
import Header from "../../componentsV/Header";
import useAuthUser from "../../hooks/useAuthUser";

export default function PaginaCargaCSV() {
    useAuthUser();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="fixed top-0 left-0 w-full z-50">
                <Header />
            </div>
            
            {/* Contenedor Principal */}
            <div className="pt-32 px-6 md:px-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Apartado Izquierdo */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <TablaRegistros />
                    </div>
                    {/* Apartado Derecho */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h1 className="text-2xl font-semibold mb-4 text-custom-azul">
                            Gestion dinamica de datos
                        </h1>
                        <FormularioCSV />
                    </div>
                </div>
            </div>

            {/* Botón estático para abrir el ChatBot */}
            <div><ChatBotWrapper /></div>
        </div>  
    );
}