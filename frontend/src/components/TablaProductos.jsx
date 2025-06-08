export default function TablaProductos({ productos, prepararEdicion, eliminarProducto }) {
    return (
      <div className="overflow-x-auto mt-6">
        {/* Contenedor Principal */}
        <h2 className="text-xl font-semibold text-custom-azul mb-4">Interactiva</h2>
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden text-sm">
          <thead className="bg-custom-verde text-white">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Características</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p, idx) => (
              <tr key={p.id} className={idx % 2 === 0? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-2">{p.nombre}</td>
                <td className="px-4 py-2">{p.precio}</td>
                <td className="px-4 py-2">{p.stock}</td>
                <td className="px-4 py-2">
                  {Object.entries(p.caracteristicas || {}).map(([k, v]) => (
                    <li key={k}>
                      <span className="font-medium">{k}:</span>{v}
                    </li>
                  ))}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => prepararEdicion(p)}
                    className="px-2 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded"
                  >✏️</button>
                  <button onClick={() => eliminarProducto(p.id)}
                    className="px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded"
                  >🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }