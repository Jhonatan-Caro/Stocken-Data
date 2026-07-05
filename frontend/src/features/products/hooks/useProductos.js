import { useCallback, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCSVColumns,
  uploadProductsCSV,
} from "../services/products.service";

export default function useProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getProducts();
      console.log("productos recibidos:", JSON.stringify(data[0], null, 2));
      setProductos(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || "Error al obtener productos");
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const agregarProducto = useCallback(
    async ({ categoryId, sku, stock, data }) => {
      console.log("agregarProducto recibe:", { categoryId, sku, stock, data });

      const payload = {
        category_id: Number(categoryId),
        sku,
        stock,
        data,
      };
      console.log("payload que va a createProduct:", JSON.stringify(payload)); // ← añade esto

      const creado = await createProduct(payload);
      await cargarProductos();
      return creado;
    },
    [cargarProductos],
  );

  const modificarProducto = useCallback(
    async (id, { categoryId, stock, data }) => {
      const payload = {};
      if (categoryId !== undefined && categoryId !== null && categoryId !== "")
        payload.category_id = Number(categoryId);
      if (stock !== undefined) payload.stock = stock;
      if (data !== undefined) payload.data = data;
      const actualizado = await updateProduct(id, payload);
      await cargarProductos();
      return actualizado;
    },
    [cargarProductos],
  );

  const eliminarProducto = useCallback(
    async (id) => {
      if (!confirm("¿Estás seguro de eliminar este producto?")) return;
      await deleteProduct(id);
      await cargarProductos();
    },
    [cargarProductos],
  );

  // Paso 1: leer columnas del CSV
  const obtenerColumnasCSV = useCallback(async (file) => {
    return await getCSVColumns(file);
  }, []);

  // Paso 2: importar con mapping
  const subirCSV = useCallback(
    async (file, categoryId, mapping) => {
      const resp = await uploadProductsCSV(file, categoryId, mapping);
      await cargarProductos();
      return resp;
    },
    [cargarProductos],
  );

  return {
    productos,
    setProductos,
    cargando,
    error,
    cargarProductos,
    agregarProducto,
    modificarProducto,
    eliminarProducto,
    obtenerColumnasCSV,
    subirCSV,
  };
}
