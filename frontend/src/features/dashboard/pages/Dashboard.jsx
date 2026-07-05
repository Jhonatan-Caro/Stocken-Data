import { useEffect, useMemo, useState } from "react";
import { FiDollarSign, FiBox, FiGrid, FiAlertTriangle } from "react-icons/fi";

import DashboardLayout from "../../../shared/layout/DashboardLayout";
import useUsers from "../../auth/hooks/useUsers";
import useProductos from "../../products/hooks/useProductos";
import useProductSearch from "../../products/hooks/useProductSearch";
import useCategorias from "../../categorys/hooks/useCategorias";
import { getPrecio, getStock } from "../../products/utils/productData";

import StatCard from "../components/StatCard";
import RecentProductsTable from "../components/RecentProductsTable";
import DynamicCategories from "../components/DynamicCategories";
import ProductsTable from "../../products/components/ProductsTable";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildCategoryStats(productos, categorias) {
  if (!categorias?.length) return [];
  const total = productos.length || 1;
  return categorias
    .map((c) => {
      const items = productos.filter((p) => p.category_id === c.id).length;
      return {
        id: c.id,
        nombre: c.name,
        items,
        progreso: Math.round((items / total) * 100),
      };
    })
    .sort((a, b) => b.items - a.items)
    .slice(0, 3);
}

export default function Dashboard() {
  const { user, fetchUser } = useUsers();
  const { productos, cargarProductos, error: errorProductos } = useProductos();
  const { categorias, cargarCategorias } = useCategorias();
  const [errorCarga, setErrorCarga] = useState(null);
  const { query, setQuery, searchedProducts } = useProductSearch(productos);

  useEffect(() => {
    fetchUser();
    Promise.all([cargarProductos(), cargarCategorias()]).catch((err) => {
      console.error("Error al cargar datos del dashboard:", err);
      setErrorCarga("No fue posible cargar los datos del dashboard.");
    });
  }, [cargarProductos, cargarCategorias]);

  const stats = useMemo(() => {
    const totalProductos = productos.length;
    let lowStock = 0;
    let totalSales = 0;

    productos.forEach((p) => {
      const stock = getStock(p);
      const precio = getPrecio(p);
      if (Number.isFinite(stock) && stock > 0 && stock < 20) lowStock += 1;
      if (Number.isFinite(precio) && Number.isFinite(stock)) {
        totalSales += precio * stock;
      }
    });

    return {
      totalProductos,
      lowStock,
      totalSales,
      categorias: buildCategoryStats(productos, categorias),
      totalCategorias: categorias.length,
    };
  }, [productos, categorias]);

  const fechaHoy = formatDate(new Date());
  const nombreUsuario = (user?.name || "Alex").split(" ")[0];

  const mensajeError = errorCarga || errorProductos;

  return (
    <DashboardLayout onSearch={setQuery}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back, {nombreUsuario}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">Date {fechaHoy}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FiDollarSign}
              label="Total Sales"
              value={`$${stats.totalSales.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              delta="+12%"
              deltaTone="positive"
              chart="line"
              color="#03a696"
            />
            <StatCard
              icon={FiBox}
              label="Total Products"
              value={stats.totalProductos.toLocaleString("en-US")}
              delta="+5%"
              deltaTone="positive"
              chart="bars"
              color="#0b3041"
            />
            <StatCard
              icon={FiGrid}
              label="Categories"
              value={stats.totalCategorias}
              hint="active"
              chart="line"
              color="#3b82f6"
            />
            <StatCard
              icon={FiAlertTriangle}
              label="Low Stock Warnings"
              value={stats.lowStock}
              delta="-3%"
              deltaTone="negative"
              chart="bars"
              color="#ef4444"
            />
          </div>

          {mensajeError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {mensajeError}
            </div>
          )}

          <ProductsTable productos={searchedProducts} />
        </div>

        <DynamicCategories categorias={stats.categorias} />
      </div>
    </DashboardLayout>
  );
}
