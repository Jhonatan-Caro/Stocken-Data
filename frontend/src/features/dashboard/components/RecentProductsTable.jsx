import {
  getNombre,
  getModelo,
  getCategoria,
  getPrecio,
  getStock,
  formatPrecio,
  stockStatus,
} from "../../products/utils/productData";

function ProductAvatar({ nombre }) {
  const initial = String(nombre || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e8ecf3] to-[#c7d2e0] text-[#0b3041] flex items-center justify-center font-semibold text-sm">
      {initial}
    </div>
  );
}

export default function RecentProductsTable({ productos = [] }) {
  const recientes = productos.slice(0, 5);

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Products
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left font-medium pb-3">Product</th>
              <th className="text-left font-medium pb-3">Category</th>
              <th className="text-left font-medium pb-3">Price</th>
              <th className="text-left font-medium pb-3">Stock</th>
              <th className="text-left font-medium pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recientes.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Aún no hay productos para mostrar.
                </td>
              </tr>
            )}
            {recientes.map((p) => {
              const stock = getStock(p);
              const status = stockStatus(stock);
              return (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <ProductAvatar nombre={getNombre(p)} />
                      <span className="font-medium text-gray-800">
                        {getNombre(p)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">{getModelo(p)}</td>
                  <td className="py-3 text-gray-600">{getCategoria(p)}</td>
                  <td className="py-3 text-gray-700">
                    {formatPrecio(getPrecio(p))}
                  </td>
                  <td className="py-3 text-gray-700">{stock ?? "—"}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.cls}`}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
