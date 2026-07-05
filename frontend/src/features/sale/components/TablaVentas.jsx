function formatFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function TablaVentas({ ventas = [] }) {
  if (ventas.length === 0) {
    return <p className="text-sm text-gray-400">Sin ventas registradas aún.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">ID</th>
            <th className="px-4 py-2 text-left font-semibold">Producto</th>
            <th className="px-4 py-2 text-left font-semibold">Categoría</th>
            <th className="px-4 py-2 text-left font-semibold">Cantidad</th>
            <th className="px-4 py-2 text-left font-semibold">Total</th>
            <th className="px-4 py-2 text-left font-semibold">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {ventas.map((v) => (
            <tr key={v.id}>
              <td className="px-4 py-2">{v.id}</td>
              <td className="px-4 py-2">{v.product ?? "—"}</td>
              <td className="px-4 py-2">{v.category ?? "—"}</td>
              <td className="px-4 py-2">{v.quantity}</td>
              <td className="px-4 py-2">
                ${Number(v.total || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-2">{formatFecha(v.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
