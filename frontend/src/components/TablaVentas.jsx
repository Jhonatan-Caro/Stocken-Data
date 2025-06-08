import { useState, useEffect } from 'react';

export default function TablaVentas(){
    const [ventas, setVentas] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const cargarVentas = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/ventas", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("Error al cargar ventas");
            }

            const data = await res.json();
            setVentas(data);
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar las ventas");
        } finally {
            setLoading(false);
        }
        };

        cargarVentas();
    }, [token]);

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleString("es-ES", {
            dateStyle: "short",
            timeStyle: "short",
        });
    }

    return(
        <div className='mt-2'>
            {loading ? (
                <p className="text-gray-500">Cargando ventas...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : (
                <div className='overflow-x-auto rounded-lg shadow'>
                    <table className='min-w-full divide-y divide-gray-200">'>
                        <thead className='bg-gray-100 text-gray-700 text-sm uppercase tracking-wider'>
                            <tr>
                                <th className='px-4 py-3 text-left'>ID</th>
                                <th className='px-4 py-3 text-left'>Producto</th>
                                <th className='px-4 py-3 text-left'>Cantidad</th>
                                <th className='px-4 py-3 text-left'>Fecha</th>
                            </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-100 text-gray-800'>
                            {ventas.map((venta) => (
                                <tr key={venta.id}>
                                    <td className='px-4 py-2'>{venta.id}</td>
                                    <td className='px-4 py-2'>{venta.producto}</td>
                                    <td className='px-4 py-2'>{venta.cantidad}</td>
                                    <td className='px-4 py-2'>{formatFecha(venta.fecha)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}