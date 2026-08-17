import httpClient from "../../../services/httpClient";

export const getProducts = async () => {
  const { data } = await httpClient.get("/products");
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await httpClient.post("/products", payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await httpClient.put(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await httpClient.delete(`/products/${id}`);
  return data;
};

export const getCSVColumns = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await httpClient.post("/products/columns", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const uploadProductsCSV = async (file, categoryId, mapping, sheet) => {
  const formData = new FormData();
  formData.append("file", file);
  // [MODIFICADO] La categoría manual es opcional cuando el mapping trae
  // columna de categoría. FormData convierte todo a string, así que un
  // "" viajaría como texto vacío al backend: mejor no enviar el campo.
  if (categoryId) formData.append("categoryId", categoryId);
  formData.append("mapping", JSON.stringify(mapping));
  if (sheet) formData.append("sheet", sheet);
  const { data } = await httpClient.post("/products/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
