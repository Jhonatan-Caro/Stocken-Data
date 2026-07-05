import { useEffect, useState } from "react";
import { FiUpload, FiTrendingUp } from "react-icons/fi";

import useVentas from "../hooks/useVentas";
import useSalesFilter from "../hooks/useSalesFilter";
import useSalesSearch from "../hooks/useSalesSearch";

import DashboardLayout from "../../../shared/layout/DashboardLayout";

import CSVUploadModal from "../../products/components/CSVUploadModal";
import SaleFilter from "../components/SaleFilter";

const SALES_FIELDS = [
  { key: "sku", label: "SKU / código", required: true },
  { key: "quantity", label: "Cantidad", required: true },
  { key: "total", label: "Total / importe", required: true },
  { key: "sold_at", label: "Fecha de venta", required: false },
];

export default function SalesPage() {
  const {
    ventas,
    cargando,
    error,
    cargarVentas,
    obtenerColumnasCSV,
    subirCSV,
  } = useVentas();
  const dates = Array.from(new Set(ventas.map((v) => v.sold_at)));
  const { dateFilter, setDateFilter, filteredSales } = useSalesFilter(ventas);
  const { query, setQuery, searchedSales } = useSalesSearch(filteredSales);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  return (
    <DashboardLayout onSearch={setQuery}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-custom-azul flex items-center gap-2">
              <FiTrendingUp /> Sales
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Importa un CSV para registrar ventas y descontar stock
              automáticamente.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b3041] hover:bg-[#03a696] text-white text-sm font-semibold transition"
            >
              <FiUpload size={15} /> Importar CSV
            </button>
            <div className="flex items-center gap-2">
              <p>Filtra por fechas:</p>
              <SaleFilter
                dates={dates}
                value={dateFilter}
                onChange={setDateFilter}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-custom-verde text-white">
              <tr>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">Cantidad</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Fecha venta</th>
                <th className="px-4 py-3 text-left">Origen</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Cargando...
                  </td>
                </tr>
              )}
              {!cargando && searchedSales.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No hay ventas registradas. Importa un CSV para empezar.
                  </td>
                </tr>
              )}
              {searchedSales.map((v, idx) => (
                <tr
                  key={v.id}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">
                    {v.sku}
                  </td>
                  <td className="px-4 py-2">{v.product_name ?? "—"}</td>
                  <td className="px-4 py-2">{v.quantity}</td>
                  <td className="px-4 py-2 font-medium">
                    {Number(v.total).toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(v.sold_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                      {v.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CSVUploadModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onGetColumns={obtenerColumnasCSV}
          onUpload={subirCSV}
          requiredFields={SALES_FIELDS}
          // sin categorias → el modal sabe que es ventas
        />
      </div>
    </DashboardLayout>
  );
}
