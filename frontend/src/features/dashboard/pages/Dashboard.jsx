import { useEffect, useMemo, useState } from "react";
import { FiDollarSign, FiBox, FiGrid, FiAlertTriangle } from "react-icons/fi";

import DashboardLayout from "../../../shared/layout/DashboardLayout";
import useUsers from "../../auth/hooks/useUsers";
import useProducts from "../../products/hooks/useProducts";
import useCategories from "../../categories/hooks/useCategories";
import useSalesStats from "../../sale/hooks/useSalesStats";
import { getStock } from "../../products/utils/productData";

import StatCard from "../components/StatCard";
import DynamicCategories from "../components/DynamicCategories";
import ProductsTable from "../../products/components/ProductsTable";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildCategoryStats(products, categories) {
  if (!categories?.length) return [];
  const total = products.length || 1;
  return categories
    .map((c) => {
      const items = products.filter((p) => p.category_id === c.id).length;
      return {
        id: c.id,
        name: c.name,
        items,
        progress: Math.round((items / total) * 100),
      };
    })
    .sort((a, b) => b.items - a.items);
}

export default function Dashboard() {
  const { user, fetchUser } = useUsers();
  const { products, loadProducts, error: productsError } = useProducts();
  const { categories, loadCategories } = useCategories();
  const { summary } = useSalesStats();
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchUser();
    Promise.all([loadProducts(), loadCategories()]).catch((err) => {
      console.error("Error al cargar datos del dashboard:", err);
      setLoadError("No fue posible cargar los datos del dashboard.");
    });
  }, [loadProducts, loadCategories]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    let lowStock = 0;

    products.forEach((p) => {
      const stock = getStock(p);
      if (Number.isFinite(stock) && stock > 0 && stock < 20) lowStock += 1;
    });

    return {
      totalProducts,
      lowStock,
      totalSales: Number(summary?.revenue) || 0,
      categories: buildCategoryStats(products, categories),
      totalCategories: categories.length,
    };
  }, [products, categories, summary]);

  const todayDate = formatDate(new Date());
  const userName = (user?.name || "Alex").split(" ")[0];

  const errorMessage = loadError || productsError;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back, {userName}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">Date {todayDate}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FiDollarSign}
              label="Total Sales"
              value={`$${stats.totalSales.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              deltaTone="positive"
              chart="line"
              color="#03a696"
            />
            <StatCard
              icon={FiBox}
              label="Total Products"
              value={stats.totalProducts.toLocaleString("en-US")}
              deltaTone="positive"
              chart="bars"
              color="#0b3041"
            />
            <StatCard
              icon={FiGrid}
              label="Categories"
              value={stats.totalCategories}
              hint="active"
              chart="line"
              color="#3b82f6"
            />
            <StatCard
              icon={FiAlertTriangle}
              label="Low Stock Warnings"
              value={stats.lowStock}
              deltaTone="negative"
              chart="bars"
              color="#ef4444"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 items-start">
          <ProductsTable products={products} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <DynamicCategories categories={stats.categories} />
        </div>
      </div>
    </DashboardLayout>
  );
}
