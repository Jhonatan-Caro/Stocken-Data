import {
  getName,
  getCategory,
  getStock,
  formatPrice,
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

function hasValue(v) {
  return v !== null && v !== undefined && v !== "" && v !== "—";
}

function humanize(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function deriveColumns(products) {
  const seen = new Set();
  const ordered = [];
  products.forEach((p) => {
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
  // Solo conservar columnas dinámicas con al menos un valor real
  return ordered.filter((col) =>
    products.some((p) => {
      const d = p?.data && typeof p.data === "object" ? p.data : {};
      return hasValue(d[col]);
    }),
  );
}

function hasStockColumn(products) {
  return products.some((p) => p?.stock !== undefined && p?.stock !== null);
}

function renderCell(value, key) {
  if (value === null || value === undefined || value === "") return "—";
  if (PRICE_KEYS.has(key)) {
    const num = Number(value);
    if (Number.isFinite(num)) return formatPrice(num);
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

function ProductAvatar({ name }) {
  const initial = String(name || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e8ecf3] to-[#c7d2e0] text-[#0b3041] flex items-center justify-center font-semibold text-sm shrink-0">
      {initial}
    </div>
  );
}

// Columnas fijas que preceden a las dinámicas. Cada una declara cómo saber si
// un producto tiene valor (present) y cómo pintar su celda (cell). En el render
// se descartan las columnas sin ningún valor en toda la tabla.
const LEADING_COLUMNS = [
  {
    key: "product",
    header: "Product",
    present: (p) => getName(p) !== "—",
    cellClass: "px-6 py-3",
    cell: (p) => (
      <div className="flex items-center gap-3">
        <ProductAvatar name={getName(p)} />
        <span className="font-medium text-gray-800">{getName(p)}</span>
      </div>
    ),
  },
  {
    key: "sku",
    header: "SKU",
    present: (p) => hasValue(p.sku),
    cellClass: "px-6 py-3 text-gray-600 whitespace-nowrap",
    cell: (p) => p.sku ?? "—",
  },
  {
    key: "category",
    header: "Category",
    present: (p) => getCategory(p) !== "—",
    cellClass: "px-6 py-3 text-gray-600 whitespace-nowrap",
    cell: (p) => getCategory(p),
  },
  {
    key: "warehouse",
    header: "Warehouse",
    present: (p) => hasValue(p.warehouse),
    cellClass: "px-6 py-3 text-gray-600 whitespace-nowrap",
    cell: (p) => (hasValue(p.warehouse) ? p.warehouse : "—"),
  },
  {
    key: "location",
    header: "Location",
    present: (p) => hasValue(p.location),
    cellClass: "px-6 py-3 text-gray-600 whitespace-nowrap",
    cell: (p) => (hasValue(p.location) ? p.location : "—"),
  },
  {
    key: "stock",
    header: "Stock",
    present: (p) => {
      const s = p.stock ?? getStock(p);
      return s !== null && s !== undefined;
    },
    cellClass: "px-6 py-3 font-medium",
    cell: (p) => {
      const s = p.stock ?? getStock(p);
      return (
        <span
          className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${
            s <= 0
              ? "bg-red-100 text-red-600"
              : s < 20
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {s ?? "—"}
        </span>
      );
    },
  },
];

export default function ProductsTable({
  products = [],
  onSelect,
  selectedId,
  showViewAll = true,
  limit,
}) {
  const data = limit ? products.slice(0, limit) : products;
  const leadingColumns = LEADING_COLUMNS.filter((c) =>
    products.some((p) => c.present(p)),
  );
  const dynamicColumns = deriveColumns(products);
  const showStatus = hasStockColumn(products);
  const totalCols =
    leadingColumns.length + dynamicColumns.length + (showStatus ? 1 : 0);

  return (
    <section className="w-full max-w-full overflow-hidden bg-white rounded-2xl shadow-sm">
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

      <div className="w-full overflow-x-auto overflow-y-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-gray-500 text-[11px] uppercase tracking-wider">
              {leadingColumns.map((col) => (
                <th
                  key={col.key}
                  className="text-left font-semibold px-6 py-3 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
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
                  colSpan={totalCols || 1}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  {products.length === 0
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
                  {leadingColumns.map((col) => (
                    <td key={col.key} className={col.cellClass}>
                      {col.cell(p)}
                    </td>
                  ))}
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
