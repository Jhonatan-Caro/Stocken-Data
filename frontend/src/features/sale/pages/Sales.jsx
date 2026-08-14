import { useEffect, useState } from "react";
import { FiUpload, FiBarChart2, FiFileText, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import useSales from "../hooks/useSales";

import DashboardLayout from "../../../shared/layout/DashboardLayout";

import CSVUploadModal from "../../../shared/ui/CSVUploadModal";
import SaleFilter from "../components/SaleFilter";

const PAGE_SIZE = 50;

const SALES_FIELDS = [
  { key: "sku", label: "SKU / código", required: true },
  { key: "quantity", label: "Cantidad", required: true },
  { key: "total", label: "Total / importe", required: true },
  { key: "sold_at", label: "Fecha de venta", required: false },
  { key: "unit_price", label: "Precio unitario", required: false },
  { key: "discount", label: "Descuento (€)", required: false },
  { key: "tax_rate", label: "IVA (0.21 = 21%)", required: false },
  { key: "cost", label: "Coste", required: false },
  { key: "margin", label: "Margen / beneficio", required: false },
  { key: "channel", label: "Canal de venta", required: false },
  { key: "warehouse", label: "Almacén", required: false },
  { key: "order_ref", label: "Nº de pedido", required: false },
];

const ORDER_FIELDS = [
  { key: "order_ref", label: "Nº de pedido", required: true },
  { key: "total", label: "Total del pedido", required: true },
  { key: "sold_at", label: "Fecha", required: false },
  { key: "channel", label: "Canal de venta", required: false },
  { key: "customer_code", label: "Cód. cliente", required: false },
  { key: "payment_status", label: "Estado del pago", required: false },
  { key: "shipping_total", label: "Envío / portes", required: false },
  { key: "discount_total", label: "Descuento total", required: false },
  { key: "tax_total", label: "Cuota de IVA", required: false },
  { key: "refunded", label: "Reembolsado", required: false },
  { key: "cost_total", label: "Coste mercancía", required: false },
  { key: "margin_total", label: "Margen bruto", required: false },
];

const SALES_TOGGLES = [
  {
    key: "historical",
    label: "Import histórico (no ajustar inventario)",
    hint: "Para cargar ventas pasadas: no valida stock, no lo descuenta ni genera movimientos.",
    default: false,
  },
];

export default function SalesPage() {
  const {
    sales,
    total,
    dates,
    loading,
    error,
    loadSales,
    getCSVColumns,
    uploadCSV,
    uploadOrders,
  } = useSales();

  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(0); // 0-based
  const [refreshKey, setRefreshKey] = useState(0); // fuerza recarga tras importar

  const [modalOpen, setModalOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [query, dateFilter]);

  useEffect(() => {
    const t = setTimeout(
      () => {
        loadSales({
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          search: query,
          date: dateFilter,
        });
      },
      query ? 300 : 0,
    );
    return () => clearTimeout(t);
  }, [query, dateFilter, page, refreshKey, loadSales]);

  const handleUploadCSV = async (file, mapping, sheet, options) => {
    const resp = await uploadCSV(file, mapping, sheet, options);
    setPage(0);
    setRefreshKey((k) => k + 1);
    return resp;
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE + sales.length, total);

  return (
    <DashboardLayout onSearch={setQuery}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales</h1>
        <p className="text-sm text-gray-500 mt-1">
          Importa tus ventas para administrarlas facilmente. Puedes subir un archivo CSV o XLSX con los datos, o agregarlos manualmente.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/sales/statistics"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#03a696] hover:text-[#03a696] text-gray-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm transition"
          >
            <FiBarChart2 size={16} /> Estadísticas
          </Link>
          <button
            type="button"
            onClick={() => setOrdersModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#03a696] hover:text-[#03a696] text-gray-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm transition"
          >
            <FiFileText size={16} /> Importar pedidos
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#03a696] hover:text-[#03a696] text-gray-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm transition"
          >
            <FiUpload size={16} /> Importar ventas
          </button>

          <SaleFilter dates={dates} value={dateFilter} onChange={setDateFilter} />
        </div>

        {query && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              Showing{" "}
              <span className="font-medium text-gray-800">{total}</span>{" "}
              results for
              <span className="font-medium text-gray-800"> "{query}"</span>
            </span>
            <button
              onClick={() => setQuery("")}
              className="text-xs text-[#03a696] hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {error && (
          <div className="text-sm rounded-xl px-4 py-3 bg-red-50 border border-red-100 text-red-600">
            {error}
          </div>
        )}

        <section className="w-full max-w-full overflow-hidden bg-white rounded-2xl shadow-sm">
          <div className="w-full overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="text-left font-semibold px-6 py-3 whitespace-nowrap">
                    SKU
                  </th>
                  <th className="text-left font-semibold px-6 py-3 whitespace-nowrap">
                    Producto
                  </th>
                  <th className="text-left font-semibold px-6 py-3 whitespace-nowrap">
                    Cantidad
                  </th>
                  <th className="text-left font-semibold px-6 py-3 whitespace-nowrap">
                    Total
                  </th>
                  <th className="text-left font-semibold px-6 py-3 whitespace-nowrap">
                    Fecha venta
                  </th>
                  <th className="text-left font-semibold px-6 py-3 whitespace-nowrap">
                    Origen
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Cargando...
                    </td>
                  </tr>
                )}
                {!loading && sales.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      {query || dateFilter
                        ? "No hay ventas que coincidan con el filtro."
                        : "No hay ventas registradas. Importa un CSV para empezar."}
                    </td>
                  </tr>
                )}
                {!loading &&
                  sales.map((v) => (
                    <tr
                      key={v.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-gray-500">
                        {v.sku}
                      </td>
                      <td className="px-6 py-3 text-gray-800">
                        {v.product_name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-gray-700">{v.quantity}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">
                        {Number(v.total).toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {new Date(v.sold_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                          {v.source}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* [NUEVO] Barra de paginación: rango visible, total y navegación.
              Los botones se desactivan en los extremos. */}
          <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>
              {total === 0
                ? "0 ventas"
                : `${rangeStart}–${rangeEnd} de ${total} ventas`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                Página {page + 1} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canPrev || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#03a696] hover:text-[#03a696] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition"
              >
                <FiChevronLeft size={14} /> Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => (canNext ? p + 1 : p))}
                disabled={!canNext || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#03a696] hover:text-[#03a696] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition"
              >
                Siguiente <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <CSVUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onGetColumns={getCSVColumns}
        onUpload={handleUploadCSV}
        requiredFields={SALES_FIELDS}
        toggles={SALES_TOGGLES}
        title="Importar ventas (líneas) desde archivo"
      />
      <CSVUploadModal
        open={ordersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
        onGetColumns={getCSVColumns}
        onUpload={uploadOrders}
        requiredFields={ORDER_FIELDS}
        title="Importar pedidos (cabeceras) desde archivo"
      />
    </DashboardLayout>
  );
}
