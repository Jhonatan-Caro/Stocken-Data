import { useMemo, useState } from "react";

// Searches in all relevant properties of a sale
function matchesQuery(sale, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();

  // Search in fixed columns
  if (sale.sku?.toLowerCase().includes(q)) return true;
  if (sale.product_name?.toLowerCase().includes(q)) return true;

  // Search in all values of the JSONB data
  if (sale.data && typeof sale.data === "object") {
    for (const value of Object.values(sale.data)) {
      if (typeof value === "string" && value.toLowerCase().includes(q)) {
        return true;
      }
    }
  }

  return false;
}

export default function useSalesSearch(sales) {
  const [query, setQuery] = useState("");

  const searchedSales = useMemo(
    () => sales.filter((sale) => matchesQuery(sale, query)),
    [sales, query],
  );

  return { query, setQuery, searchedSales };
}
