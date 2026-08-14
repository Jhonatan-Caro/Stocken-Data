import { useCallback, useState } from "react";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../services/categories.service";

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Error al obtener categorías:", err);
      setError(err?.response?.data?.message || "Error al obtener categorías");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(
    async ({ name, description }) => {
      const created = await createCategory({ name, description });
      await loadCategories();
      return created;
    },
    [loadCategories],
  );

  const removeCategory = useCallback(
    async (id) => {
      await deleteCategory(id);
      await loadCategories();
    },
    [loadCategories],
  );

  return {
    categories,
    loading,
    error,
    loadCategories,
    addCategory,
    removeCategory,
  };
}
