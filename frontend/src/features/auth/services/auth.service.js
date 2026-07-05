import httpClient from "../../../services/httpCliente.js";

export const login = async (credentials) => {
  const { data } = await httpClient.post("/login", credentials);
  return data;
};

export const register = async (formData) => {
  const { data } = await httpClient.post("/register", formData);
  return data;
};

export const verifyToken = async () => {
  const { data } = await httpClient.get("tokenVerify");
  return data;
};
