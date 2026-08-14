import httpClient from "../../../services/httpClient";

export const getSales = async ({
  limit = 50,
  offset = 0,
  search = "",
  date = "",
} = {}) => {
  const { data } = await httpClient.get("/sales", {
    params: {
      limit,
      offset,
      search: search || undefined,
      date: date || undefined,
    },
  });
  return data;
};

export const getSalesCSVColumns = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await httpClient.post("/sales/columns", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const uploadSalesCSV = async (file, mapping, sheet, options = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mapping", JSON.stringify(mapping));
  if (sheet) formData.append("sheet", sheet);
  if (options.adjustStock === false) formData.append("adjustStock", "false");
  const { data } = await httpClient.post("/sales/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const uploadSalesOrders = async (file, mapping, sheet) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mapping", JSON.stringify(mapping));
  if (sheet) formData.append("sheet", sheet);
  const { data } = await httpClient.post("/sales/orders/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const getStats = async (view, range = {}) => {
  const params = {};
  if (range.from) params.from = range.from;
  if (range.to) params.to = range.to;
  const { data } = await httpClient.get(`/sales/stats/${view}`, { params });
  return data;
};

export const getStatsSummary = (range) => getStats("summary", range);
export const getStatsByProduct = (range) => getStats("by-product", range);
export const getStatsByMonth = (range) => getStats("by-month", range);
export const getStatsByChannel = (range) => getStats("by-channel", range);
export const getStatsByCategory = (range) => getStats("by-category", range);
