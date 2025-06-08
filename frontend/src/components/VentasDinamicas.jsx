import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useVentas from "../hooks/useVentas";
import TablaVentasDinamicas from "./TablaVentasDinamicas"

export default function VentasDinamicas(){
    const [mostrarTablaRegistros, setMostrarTablaRegistros] = useState(false);
    const [ seleccionado, setSeleccionado ] = useState("")
    const [ cantidad, setCantidad ] = useState(1)
    const {
        registroVenta,
        fetchRegistroVenta,
        handleVentaDinamica,
        mensaje,
        setMensaje,
    } = useVentas();

    useEffect(() => {
        fetchRegistroVenta()
    }, [])

    const handleVenta = async () => {
        const registro = registroVenta.find(r => r.id === parseInt(seleccionado));
        if (!registro) {
        setMensaje("Debe seleccionar un producto válido.");
        return;
        }

        const stockDisponible = registro.datos.stock ?? registro.datos.cantidad;

        if (cantidad > stockDisponible) {
        setMensaje("Stock insuficiente.");
        return;
        }

        await handleVentaDinamica({ registro_id: registro.id, cantidad });
        setCantidad(1);

        await fetchRegistros()
    };

    return(
        <div className="mt-1">
            <h2 className="text-xl font-semibold text-custom-verde text-700 mb-4"> Ventas de Registros</h2>
            <div className="flex flex-col gap-4">
                <select
                    value={seleccionado}
                    onChange={(e) => setSeleccionado(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 w-full"
                >
                    <option value="">Seleciona un producto</option>
                    {registroVenta.map((r) => {
                        const nombre = r.datos.nombre;
                        const stock = r.datos.stock ?? r.datos.cantidad;
                        return(
                            <option key={r.id} value={r.id}>
                                {nombre} - Stock: {stock}
                            </option>
                        )
                    })}
                </select>

                <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value))}
                    placeholder="Cantidad"
                    className="border border-gray-300 rounded px-4 py-2 w-full"
                />

                <button 
                    onClick={handleVenta}
                    className="bg-custom-verde bg-600 hover:bg-custom-azul bg-700 text-white py-2 px-4 rounded shadow w-fit"
                >
                    Realizar Venta
                </button>

                {mensaje && (
                    <p className={`text-sm ${mensaje.includes("Error") ? "text-red-500" : "text-green-600"}`}>{mensaje}</p>
                )}
            </div>

            {/* Registros Disp */}
            <div className="mt-5">
                <button 
                    className="text-lg font-medium text-gray-700 mb-2"
                    onClick={() => setMostrarTablaRegistros(!mostrarTablaRegistros)}
                >
                    📦 Registros Disponibles {mostrarTablaRegistros ? "▲" : "▼"}
                </button>
                <AnimatePresence initial={false}>
                    {mostrarTablaRegistros && (
                        <motion.div
                            key="tabla-registros"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >    
                            <div className="overflow-x-auto rounded-lg shadow">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide">
                                        <tr>
                                            <th className="px-4 py-2 text-left">ID</th>
                                            <th className="px-4 py-2 text-left">Nombre</th>
                                            <th className="px-4 py-2 text-left">Stock</th>
                                            <th className="px-4 py-2 text-left">Precio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {registroVenta.map((producto) => {
                                            const { id, datos } = producto;
                                            const nombre = datos.nombre ?? datos.Nombre ?? "Sin nombre";
                                            const stock = datos.stock ?? datos.cantidad ?? 0;
                                            const precio = datos.precio ?? datos.Precio ?? "N/A";

                                            return (
                                                <tr key={id}>
                                                    <td className="px-4 py-2">{id}</td>
                                                    <td className="px-4 py-2">{nombre}</td>
                                                    <td className="px-4 py-2">{stock}</td>
                                                    <td className="px-4 py-2">{precio}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tablas Dinamicas */}
                <div className="mt-5">
                    <TablaVentasDinamicas />
                </div>
            </div>
        </div>
    )
}