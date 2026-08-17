import { useCallback, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCSVColumns as apiGetCSVColumns,
  uploadProductsCSV,
} from "../services/products.service";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      console.log("productos recibidos:", JSON.stringify(data[0], null, 2));
      setProducts(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "Error al obtener productos");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(
    async ({ categoryId, sku, stock, data }) => {
      console.log("addProduct recibe:", { categoryId, sku, stock, data });

      const payload = {
        category_id: Number(categoryId),
        sku,
        stock,
        data,
      };
      console.log("payload que va a createProduct:", JSON.stringify(payload));

      const created = await createProduct(payload);
      await loadProducts();
      return created;
    },
    [loadProducts],
  );

  const editProduct = useCallback(
    async (id, { categoryId, stock, data }) => {
      const payload = {};
      if (categoryId !== undefined && categoryId !== null && categoryId !== "")
        payload.category_id = Number(categoryId);
      if (stock !== undefined) payload.stock = stock;
      if (data !== undefined) payload.data = data;
      const updated = await updateProduct(id, payload);
      await loadProducts();
      return updated;
    },
    [loadProducts],
  );

  const removeProduct = useCallback(
    async (id) => {
      if (!confirm("¿Estás seguro de eliminar este producto?")) return;
      await deleteProduct(id);
      await loadProducts();
    },
    [loadProducts],
  );

  const getCSVColumns = useCallback(async (file) => {
    return await apiGetCSVColumns(file);
  }, []);

  const uploadCSV = useCallback(
    async (file, categoryId, mapping, sheet) => {
      const resp = await uploadProductsCSV(file, categoryId, mapping, sheet);
      await loadProducts();
      return resp;
    },
    [loadProducts],
  );

  return {
    products,
    setProducts,
    loading,
    error,
    loadProducts,
    addProduct,
    editProduct,
    removeProduct,
    getCSVColumns,
    uploadCSV,
  };
}
