import { useState, useEffect } from 'react';

export default function TablaVentas(){
  const [ventas, setVentas] = useState([]);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/ventas/csv", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al cargar ventas");
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

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">📜 Historial de ventas</h2>

      {loading
        ? <p className="text-gray-600">Cargando ventas...</p>
        : error
          ? <p className="text-red-500">{error}</p>
          : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-2 text-left">ID Venta</th>
                    <th className="px-4 py-2 text-left">Registro ID</th>
                    <th className="px-4 py-2 text-left">Producto</th>
                    <th className="px-4 py-2 text-left">Cantidad</th>
                    <th className="px-4 py-2 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {ventas.map((venta) => (
                    <tr key={venta.id}>
                      <td className="px-4 py-2">{venta.id}</td>
                      <td className="px-4 py-2">{venta.registro_id}</td>
                      <td className="px-4 py-2">{venta.producto}</td>
                      <td className="px-4 py-2">{venta.cantidad}</td>
                      <td className="px-4 py-2">{formatFecha(venta.fecha)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  );
}