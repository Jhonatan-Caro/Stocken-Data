import { useCallback, useEffect, useState } from "react";
import {
  getStatsSummary,
  getStatsByProduct,
  getStatsByMonth,
  getStatsByChannel,
  getStatsByCategory,
} from "../services/sales.service";

export default function useSalesStats() {
  const [range, setRange] = useState({ from: "", to: "" });

  const [data, setData] = useState({
    summary: null,
    byProduct: [],
    byMonth: [],
    byChannel: [],
    byCategory: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (currentRange) => {
    setLoading(true);
    setError(null);
    try {
      const r = {
        from: currentRange.from || null,
        to: currentRange.to || null,
      };
      const [summary, byProduct, byMonth, byChannel, byCategory] =
        await Promise.all([
          getStatsSummary(r),
          getStatsByProduct(r),
          getStatsByMonth(r),
          getStatsByChannel(r),
          getStatsByCategory(r),
        ]);
      setData({ summary, byProduct, byMonth, byChannel, byCategory });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Error al cargar las estadísticas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  return { range, setRange, ...data, loading, error };
}
