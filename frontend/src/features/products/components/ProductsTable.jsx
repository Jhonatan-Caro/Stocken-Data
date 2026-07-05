import {
  getNombre,
  getCategoria,
  getStock,
  formatPrecio,
  stockStatus,
} from "../utils/productData";

const NAME_KEYS = new Set(["nombre", "Nombre", "name", "Name", "NAME"]);
const CATEGORY_KEYS = new Set([
  "categoria",
  "Categoria",
  "category",
  "Category",
  "CATEGORY",
]);
const STOCK_KEYS = new Set(["stock", "Stock", "STOCK", "cantidad", "Cantidad"]);
const PRICE_KEYS = new Set(["precio", "Precio", "price", "Price", "PRICE"]);
const SKU_KEYS = new Set(["sku", "Sku", "SKU", "Codigo", "CODIGO"]);

function humanize(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function deriveColumns(productos) {
  const seen = new Set();
  const ordered = [];
  productos.forEach((p) => {
    if (!p?.data || typeof p.data !== "object") return;
    Object.keys(p.data).forEach((key) => {
      if (NAME_KEYS.has(key)) return;
      if (CATEGORY_KEYS.has(key)) return;
      if (STOCK_KEYS.has(key)) return;
      if (SKU_KEYS.has(key)) return;
      if (seen.has(key)) return;
      seen.add(key);
      ordered.push(key);
    });
  });
  console.log("columnas dinámicas:", ordered);
  return ordered;
}

function hasStockColumn(productos) {
  return productos.some((p) => p?.stock !== undefined && p?.stock !== null);
}

function renderCell(value, key) {
  if (value === null || value === undefined || value === "") return "—";
  if (PRICE_KEYS.has(key)) {
    const num = Number(value);
    if (Number.isFinite(num)) return formatPrecio(num);
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function ProductAvatar({ nombre }) {
  const initial = String(nombre || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e8ecf3] to-[#c7d2e0] text-[#0b3041] flex items-center justify-center font-semibold text-sm shrink-0">
      {initial}
    </div>
  );
}

export default function ProductsTable({
  productos = [],
  onSelect,
  selectedId,
  showViewAll = true,
  limit,
}) {
  const data = limit ? productos.slice(0, limit) : productos;
  const dynamicColumns = deriveColumns(productos);
  const showStatus = hasStockColumn(productos);
  console.log("showStatus:", showStatus);
  console.log("p.stock del primer producto:", productos[0]?.stock);
  const totalCols = 2 + dynamicColumns.length + (showStatus ? 1 : 0);

  return (
    <section className="bg-white rounded-2xl shadow-sm">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-base font-semibold text-gray-800">
          Recent Products
        </h2>
        {showViewAll && (
          <button
            type="button"
            className="text-xs font-medium text-[#0b3041] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition"
          >
            View All
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-[11px] uppercase tracking-wider">
              <th className="text-left font-semibold px-6 py-3">Product</th>
              <th className="text-left font-semibold px-6 py-3">SKU</th>
              <th className="text-left font-semibold px-6 py-3">Category</th>
              <th className="text-left font-semibold px-6 py-3">Stock</th>
              {dynamicColumns.map((col) => (
                <th
                  key={col}
                  className="text-left font-semibold px-6 py-3 whitespace-nowrap"
                >
                  {humanize(col)}
                </th>
              ))}
              {showStatus && (
                <th className="text-left font-semibold px-6 py-3">Status</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={totalCols}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  {productos.length === 0
                    ? "Aún no hay productos."
                    : "No hay productos en esta categoría."}
                </td>
              </tr>
            )}
            {data.map((p) => {
              const stock = p.stock ?? getStock(p);
              const status = stockStatus(stock);
              const isSelected = selectedId === p.id;
              const rowData =
                p?.data && typeof p.data === "object" ? p.data : {};
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelect?.(p)}
                  className={`border-t border-gray-100 transition cursor-pointer ${
                    isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"
                  }`}
                >
                  {/* PRODUCT */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <ProductAvatar nombre={getNombre(p)} />
                      <span className="font-medium text-gray-800">
                        {getNombre(p)}
                      </span>
                    </div>
                  </td>
                  {/* SKU */}
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {p.sku ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {getCategoria(p)}
                  </td>
                  <td className="px-6 py-3 font-medium">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${
                        p.stock <= 0
                          ? "bg-red-100 text-red-600"
                          : p.stock < 20
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p.stock ?? "—"}
                    </span>
                  </td>
                  {dynamicColumns.map((col) => (
                    <td
                      key={col}
                      className="px-6 py-3 text-gray-700 whitespace-nowrap"
                    >
                      {renderCell(rowData[col], col)}
                    </td>
                  ))}
                  {showStatus && (
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
