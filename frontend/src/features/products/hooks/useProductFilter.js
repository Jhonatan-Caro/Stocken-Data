import { useMemo, useState } from "react";

export default function useProductFilter(products, categories) {
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredProducts = useMemo(
    () =>
      categoryFilter
        ? products.filter((p) => String(p.category_id) === categoryFilter)
        : products,
    [products, categoryFilter],
  );

  const currentCategoryKeys = useMemo(() => {
    if (!categoryFilter) return [];
    const EXCLUDE = new Set([
      "sku",
      "stock",
      "nombre",
      "Nombre",
      "name",
      "Name",
    ]);
    const seen = new Set();
    filteredProducts.forEach((p) => {
      Object.keys(p.data || {}).forEach((key) => {
        if (!EXCLUDE.has(key)) seen.add(key);
      });
    });
    return Array.from(seen);
  }, [filteredProducts, categoryFilter]);

  return {
    categoryFilter,
    setCategoryFilter,
    filteredProducts,
    currentCategoryKeys,
  };
}
