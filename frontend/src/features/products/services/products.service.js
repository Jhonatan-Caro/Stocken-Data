import httpClient from "../../../services/httpCliente";

export const getProducts = async () => {
  const { data } = await httpClient.get("/productos");
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await httpClient.post("/productos", payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  console.log("createProduct payload:", JSON.stringify(payload));
  const { data } = await httpClient.put(`/productos/${id}`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await httpClient.delete(`/productos/${id}`);
  return data;
};

// Paso 1: sube el archivo (CSV o XLSX) y devuelve columnas + preview
// (y hojas disponibles) para el mapper
export const getCSVColumns = async (file) => {
  const formData = new FormData();
  formData.append("archivo", file);
  const { data } = await httpClient.post("/productos/columns", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Paso 2: importa con el mapping confirmado por el usuario
// sheet: hoja del Excel a importar (opcional; el backend usa la primera)
export const uploadProductsCSV = async (file, categoryId, mapping, sheet) => {
  const formData = new FormData();
  formData.append("archivo", file);
  formData.append("categoriaId", categoryId);
  formData.append("mapping", JSON.stringify(mapping));
  if (sheet) formData.append("sheet", sheet);
  const { data } = await httpClient.post("/productos/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
