import httpClient from "../../../services/httpCliente";

export const getSales = async ({ limit = 50, offset = 0 } = {}) => {
  const { data } = await httpClient.get("/ventas", {
    params: { limit, offset },
  });
  return data;
};

// Paso 1: columnas + preview
export const getSalesCSVColumns = async (file) => {
  const formData = new FormData();
  formData.append("archivo", file);
  const { data } = await httpClient.post("/ventas/columns", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Paso 2: importar ventas con mapping
// sheet: hoja del Excel a importar (opcional; el backend usa la primera)
export const uploadSalesCSV = async (file, mapping, sheet) => {
  const formData = new FormData();
  formData.append("archivo", file);
  formData.append("mapping", JSON.stringify(mapping));
  if (sheet) formData.append("sheet", sheet);
  const { data } = await httpClient.post("/ventas/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
