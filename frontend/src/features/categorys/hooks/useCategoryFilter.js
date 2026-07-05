import { useMemo, useState } from "react";

// Busca en todas las propiedades relevantes de una categoría
function matchesQuery(category, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();

  // Busca en columnas fijas
  if (category.name?.toLowerCase().includes(q)) return true;
  if (category.description?.toLowerCase().includes(q)) return true;

  return false;
}

export default function useCategoryFilter(categories) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(
    () => categories.filter((c) => matchesQuery(c, query)),
    [categories, query],
  );

  return { query, setQuery, filteredCategories };
}
