import { useCallback, useState } from "react";
import {
  getCategorias,
  createCategoria,
  deleteCategoria,
} from "../services/categorias.service";

export default function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarCategorias = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getCategorias();
      setCategorias(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Error al obtener categorías:", err);
      setError(err?.response?.data?.message || "Error al obtener categorías");
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const agregarCategoria = useCallback(
    async ({ nombre, descripcion }) => {
      const creada = await createCategoria({ nombre, descripcion });
      await cargarCategorias();
      return creada;
    },
    [cargarCategorias],
  );

  const eliminarCategoria = useCallback(
    async (id) => {
      await deleteCategoria(id);
      await cargarCategorias();
    },
    [cargarCategorias],
  );

  return {
    categorias,
    cargando,
    error,
    cargarCategorias,
    agregarCategoria,
    eliminarCategoria,
  };
}
