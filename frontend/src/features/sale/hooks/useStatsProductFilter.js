import { useEffect, useMemo, useState } from "react";
import useCategories from "../../categories/hooks/useCategories";

function matchesQuery(row, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  if (row.sku?.toLowerCase().includes(q)) return true;
  if (row.product_name?.toLowerCase().includes(q)) return true;
  return false;
}

export default function useStatsProductFilter(byProduct) {
  const { categories, loadCategories } = useCategories();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const selectedCategoryName = useMemo(() => {
    if (!categoryFilter) return null;
    return (
      categories.find((c) => String(c.id) === categoryFilter)?.name ?? null
    );
  }, [categoryFilter, categories]);

  const filteredProducts = useMemo(() => {
    return byProduct.filter((row) => {
      if (selectedCategoryName && row.category !== selectedCategoryName)
        return false;
      if (classFilter && row.classification !== classFilter) return false;
      return matchesQuery(row, query);
    });
  }, [byProduct, query, selectedCategoryName, classFilter]);

  return {
    categories,
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    classFilter,
    setClassFilter,
    filteredProducts,
  };
}
