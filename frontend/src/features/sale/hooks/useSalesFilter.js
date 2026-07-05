import { useMemo, useState } from "react";

export default function useSalesFilter(sales) {
  const [dateFilter, setDateFilter] = useState("");

  const filteredSales = useMemo(() => {
    return dateFilter ? sales.filter((s) => s.sold_at === dateFilter) : sales;
  }, [sales, dateFilter]);

  return {
    dateFilter,
    setDateFilter,
    filteredSales,
  };
}
//PENDIENTE APLICAR EN COMPONENTE DE VENTAS, PARA FILTRAR POR FECHA, SIMILAR A COMO SE HACE EN PRODUCTOS Y CATEGORIAS
