import { useCallback, useState } from "react";
import {
  getSales,
  getSalesCSVColumns,
  uploadSalesCSV,
  uploadSalesOrders, // [NUEVO] import de cabeceras de pedido
} from "../services/sales.service";

export default function useSales() {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSales = useCallback(
    async ({ limit = 50, offset = 0, search = "", date = "" } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSales({ limit, offset, search, date });
        setSales(Array.isArray(data?.rows) ? data.rows : []);
        setTotal(data?.total ?? 0);
        setDates(Array.isArray(data?.dates) ? data.dates : []);
        return data;
      } catch (err) {
        setError(err?.response?.data?.message || "Error al obtener ventas");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getCSVColumns = useCallback(async (file) => {
    return await getSalesCSVColumns(file);
  }, []);

  const uploadCSV = useCallback(async (file, mapping, sheet, options = {}) => {
    return await uploadSalesCSV(file, mapping, sheet, {
      adjustStock: !options.historical,
    });
  }, []);

  const uploadOrders = useCallback(async (file, mapping, sheet) => {
    return await uploadSalesOrders(file, mapping, sheet);
  }, []);

  return {
    sales,
    total,
    dates,
    loading,
    error,
    loadSales,
    getCSVColumns,
    uploadCSV,
    uploadOrders,
  };
}
