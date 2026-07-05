import { useMemo, useState } from "react";

// Busca en todas las propiedades relevantes de un producto
function matchesQuery(product, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();

  // Busca en columnas fijas
  if (product.sku?.toLowerCase().includes(q)) return true;
  if (String(product.stock).includes(q)) return true;
  if (product.category_name?.toLowerCase().includes(q)) return true;

  // Busca en todos los valores del JSONB
  if (product.data && typeof product.data === "object") {
    for (const value of Object.values(product.data)) {
      if (
        String(value ?? "")
          .toLowerCase()
          .includes(q)
      )
        return true;
    }
  }

  return false;
}

export default function useProductSearch(products) {
  const [query, setQuery] = useState("");

  const searchedProducts = useMemo(
    () => products.filter((p) => matchesQuery(p, query)),
    [products, query],
  );

  return { query, setQuery, searchedProducts };
}
