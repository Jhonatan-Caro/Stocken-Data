import httpClient from "../../../services/httpClient";

export const getCategories = async () => {
  const { data } = await httpClient.get("/categories");
  return data;
};

export const createCategory = async ({ name, description }) => {
  const { data } = await httpClient.post("/categories", {
    name,
    description,
  });
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await httpClient.delete(`/categories/${id}`);
  return data;
};
