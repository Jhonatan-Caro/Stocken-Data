import { FiSearch } from "react-icons/fi";

import DashboardLayout from "../../../shared/layout/DashboardLayout";
import CategoryFilter from "../../products/components/CategoryFilter";
import useSalesStats from "../hooks/useSalesStats";
import useStatsProductFilter from "../hooks/useStatsProductFilter";

import KpiTile from "../components/charts/KpiTile";
import LineChart from "../components/charts/LineChart";
import HBarChart from "../components/charts/HBarChart";
import QuadrantScatter from "../components/charts/QuadrantScatter";
import {
  SERIES,
  CLASSIFICATION,
  INK,
  fmtEuro,
  fmtNum,
  fmtPct,
  warehouseLabel,
} from "../components/charts/theme";

export default function SalesStatistics() {
  const {
    range,
    setRange,
    summary,
    byProduct,
    byMonth,
    byChannel,
    byCategory,
    loading,
    error,
  } = useSalesStats();

  const {
    categories,
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    classFilter,
    setClassFilter,
    filteredProducts,
  } = useStatsProductFilter(byProduct);

  const monthData = byMonth.map((m) => ({ ...m, label: m.mes }));

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Estadísticas de ventas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Rendimiento por producto, canal y mes. Usa el filtro de
              fechas para acotar el periodo.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <label className="flex items-center gap-1.5 text-gray-600">
              Desde
              <input
                type="date"
                value={range.from}
                onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white outline-none"
              />
            </label>
            <label className="flex items-center gap-1.5 text-gray-600">
              Hasta
              <input
                type="date"
                value={range.to}
                onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white outline-none"
              />
            </label>
            {(range.from || range.to) && (
              <button
                onClick={() => setRange({ from: "", to: "" })}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm rounded-xl px-4 py-3 bg-red-50 border border-red-100 text-red-600">
            {error}
          </div>
        )}

        <div
          className={`flex flex-col gap-6 transition-opacity ${loading ? "opacity-50" : ""}`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiTile label="Ingresos" value={fmtEuro(summary?.revenue)} hint="líneas de venta, IVA incl." />
            <KpiTile label="Beneficio bruto" value={fmtEuro(summary?.margin)} hint={`margen ${fmtPct(summary?.margin_pct)}`} />
            <KpiTile label="Pedidos" value={fmtNum(summary?.orders)} />
            <KpiTile label="Ticket medio" value={fmtEuro(summary?.avg_ticket, 2)} />
            <KpiTile label="Unidades" value={fmtNum(summary?.units)} />
            <KpiTile label="Reembolsos" value={fmtEuro(summary?.refunded)} />
          </div>

          <ChartCard
            title="Evolución mensual"
            subtitle="Ingresos y beneficio bruto por mes (€)"
          >
            <LineChart
              data={monthData}
              series={[
                { key: "revenue", label: "Ingresos", color: SERIES.ingresos, format: (v) => fmtEuro(v, 2) },
                { key: "margin", label: "Beneficio", color: SERIES.beneficio, format: (v) => fmtEuro(v, 2) },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Mapa de productos: volumen vs rentabilidad"
            subtitle="Cada punto es un producto. Las líneas grises son las medianas del catálogo: definen los 4 cuadrantes de clasificación."
          >
            <QuadrantScatter data={byProduct} />
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Ingresos por canal" subtitle="IVA incluido">
              <HBarChart
                data={byChannel.map((c) => ({ ...c, label: c.channel, value: c.revenue }))}
                tooltipRows={(d) => [
                  { label: "Ingresos", value: fmtEuro(d.revenue, 2) },
                  { label: "Beneficio", value: fmtEuro(d.margin, 2) },
                  { label: "Margen", value: fmtPct(d.margin_pct) },
                  { label: "Unidades", value: fmtNum(d.units) },
                  { label: "Pedidos", value: fmtNum(d.orders) },
                ]}
              />
            </ChartCard>
            <ChartCard title="Ingresos por categoría" subtitle="IVA incluido">
              <HBarChart
                data={byCategory.map((c) => ({ ...c, label: c.category, value: c.revenue }))}
                tooltipRows={(d) => [
                  { label: "Ingresos", value: fmtEuro(d.revenue, 2) },
                  { label: "Beneficio", value: fmtEuro(d.margin, 2) },
                  { label: "Margen", value: fmtPct(d.margin_pct) },
                  { label: "Productos", value: fmtNum(d.products) },
                ]}
              />
            </ChartCard>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por SKU o producto..."
                className="w-full bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white pl-10 pr-4 py-2 rounded-full text-sm outline-none transition"
              />
            </div>
            <CategoryFilter
              categories={categories}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:border-[#03a696] transition"
            >
              <option value="">Todas las clases</option>
              {Object.entries(CLASSIFICATION)
                .filter(([key]) => key !== "sin_datos")
                .map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </div>

          <ChartCard
            title="Detalle por producto"
            subtitle="Ordenado por ingresos. La clase sale del cuadrante del mapa superior."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-xs text-left" style={{ color: INK.muted }}>
                    <th className="px-3 py-2 font-medium">SKU</th>
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-3 py-2 font-medium">Almacén</th>
                    <th className="px-3 py-2 font-medium text-right">Uds.</th>
                    <th className="px-3 py-2 font-medium text-right">Pedidos</th>
                    <th className="px-3 py-2 font-medium text-right">Ingresos</th>
                    <th className="px-3 py-2 font-medium text-right">Beneficio</th>
                    <th className="px-3 py-2 font-medium text-right">Margen</th>
                    <th className="px-3 py-2 font-medium">Clase</th>
                  </tr>
                </thead>
                <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                  {filteredProducts.map((p, idx) => (
                    <tr key={p.product_id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">{p.sku}</td>
                      <td className="px-3 py-2">{p.product_name ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {warehouseLabel(p)}
                      </td>
                      <td className="px-3 py-2 text-right">{fmtNum(p.units)}</td>
                      <td className="px-3 py-2 text-right">{fmtNum(p.orders)}</td>
                      <td className="px-3 py-2 text-right font-medium">{fmtEuro(p.revenue, 2)}</td>
                      <td className="px-3 py-2 text-right">{fmtEuro(p.margin, 2)}</td>
                      <td className="px-3 py-2 text-right">{fmtPct(p.margin_pct)}</td>
                      <td className="px-3 py-2">
                        <ClassBadge classification={p.classification} />
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                        {byProduct.length === 0
                          ? "Sin ventas en el periodo seleccionado"
                          : "Sin resultados para la búsqueda o el filtro"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-semibold" style={{ color: INK.primary }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs mt-0.5 mb-3" style={{ color: INK.secondary }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

function ClassBadge({ classification }) {
  const cls = CLASSIFICATION[classification] ?? CLASSIFICATION.sin_datos;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: INK.secondary }}>
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: cls.color }}
      />
      {cls.label}
    </span>
  );
}
