import httpClient from "../../../services/httpCliente";

export const getCategorias = async () => {
  const { data } = await httpClient.get("/categorias");
  return data;
};

export const createCategoria = async ({ nombre, descripcion }) => {
  const { data } = await httpClient.post("/categorias", {
    nombre,
    descripcion,
  });
  return data;
};

export const deleteCategoria = async (id) => {
  const { data } = await httpClient.delete(`/categorias/${id}`);
  return data;
};
