import { useState, useEffect } from "react";
import {motion, AnimatePresence} from "framer-motion";
import useProductos from "../hooks/useProductos";
import TablaVentas from "./TablaVentas";

export default function Ventas() {
    const [mostrarTablaProductos, setMostrarTablaProductos] = useState(false);
    const { productos, cargarProductos } = useProductos();
    const [ productoSeleccionado, setProductoSeleccionado ] = useState(null);
    const [ cantidad, setCantidad ] = useState(1);
    const [ mensaje , setMensaje ] = useState("");
    const token = localStorage.getItem("token");
 
    useEffect(() => {
        cargarProductos()
    }, []);

    const handleVenta = async () => {
        if (!productoSeleccionado || cantidad <= 0) {
            setMensaje("Por favor, selecciona un producto y una cantidad válida.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/ventas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    producto_id: productoSeleccionado,
                    cantidad,
                }),
            });

            if (!response.ok) {
                throw new Error("Error al realizar la venta");
            }

            setMensaje("✅ Venta realizada con éxito");
            setCantidad(1);

            await cargarProductos(); // Recargar productos para actualizar el stock
        } catch (error) {
            console.error("Error al realizar la venta:", error);
            setMensaje("❌ Error al realizar la venta");
        }
    }

    return(
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-custom-verde text-800">Ventas</h2>
            <div className="space-y-4">
                {/* Selector Producto */}
                <select 
                    value={productoSeleccionado}
                    className="w-full border border-gray-300 rounded-md p-2"
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                >
                    <option value="">Seleccione un producto</option>
                    {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                            {producto.nombre} - Stock: {producto.stock}
                        </option>
                    ))}
                </select>

                <input 
                    type="number" 
                    min="1"
                    value={cantidad} 
                    onChange={(e) => setCantidad(parseInt(e.target.value))}
                    placeholder="Cantidad a vender"
                    className="w-full border border-gray-300 rounded-md p-2"
                />

                {/* Botón de Venta */}
                <button 
                    onClick={handleVenta}
                    className="bg-custom-verde bg-600 hover:bg-custom-azul bg-700 text-white font-medium px-4 py-2 rounded-md"
                >
                    Realizar Venta
                </button>
                {mensaje && (
                    <p className={`text-sm ${mensaje.includes("✅") ? "text-green-600" : "text-red-600"}`}>{mensaje}</p>
                )}
            </div>

            {/* Productos Disponibles */}
            <div className="mt-5">
                <button 
                    className="text-lg font-medium text-gray-700 mb-2"
                    onClick={() => setMostrarTablaProductos(!mostrarTablaProductos)}
                >
                    📦 Productos Disponibles {mostrarTablaProductos ? "▲" : "▼"}
                </button>
                <AnimatePresence initial={false}>
                    {mostrarTablaProductos && (
                        <motion.div
                            key="tabla-ventas"
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
                                            <th className="px-4 py-2 text-left">Precio</th>
                                            <th className="px-4 py-2 text-left">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {productos.map((producto) => (
                                            <tr key={producto.id}>
                                                <td className="px-4 py-2">{producto.id}</td>
                                                <td className="px-4 py-2">{producto.nombre}</td>
                                                <td className="px-4 py-2">${producto.precio}</td>
                                                <td className="px-4 py-2">{producto.stock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Historial V */}
            <div className="mt-5">
                <h3 className="text-xl font-semibold text-gray-700 mb-3"> 📜 Historial de ventas</h3>
                <div className="overflow-auto">
                    <TablaVentas />
                </div>
            </div>
        </div>
    )
}