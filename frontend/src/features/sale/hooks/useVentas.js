import { useCallback, useState } from "react";
import {
  getSales,
  getSalesCSVColumns,
  uploadSalesCSV,
} from "../services/sales.service";

export default function useVentas() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarVentas = useCallback(async ({ limit = 50, offset = 0 } = {}) => {
    setCargando(true);
    setError(null);
    try {
      const data = await getSales({ limit, offset });
      setVentas(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "Error al obtener ventas");
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const obtenerColumnasCSV = useCallback(async (file) => {
    return await getSalesCSVColumns(file);
  }, []);

  const subirCSV = useCallback(
    async (file, mapping, sheet) => {
      const resp = await uploadSalesCSV(file, mapping, sheet);
      await cargarVentas();
      return resp;
    },
    [cargarVentas],
  );

  return {
    ventas,
    cargando,
    error,
    cargarVentas,
    obtenerColumnasCSV,
    subirCSV,
  };
}
