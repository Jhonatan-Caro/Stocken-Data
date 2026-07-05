import { useEffect, useState } from "react";

const NOMBRE_KEYS = new Set(["nombre", "Nombre", "name", "Name"]);
const FIXED_KEYS = new Set([
  "sku",
  "stock",
  "nombre",
  "Nombre",
  "name",
  "Name",
]);

export default function useProductForm({
  mode,
  initialProduct,
  existingKeys,
  initialCategoryId,
}) {
  const [categoryId, setCategoryId] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [name, setName] = useState("");
  const [fields, setFields] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (mode === "edit" && initialProduct) {
      setCategoryId(String(initialProduct.category_id ?? ""));
      setSku(initialProduct.sku ?? "");
      setStock(String(initialProduct.stock ?? ""));

      const incoming = initialProduct.data || {};
      const nameEntry = Object.entries(incoming).find(([k]) =>
        NOMBRE_KEYS.has(k),
      );
      setName(nameEntry ? nameEntry[1] : "");

      const dynamic = {};
      Object.entries(incoming).forEach(([k, v]) => {
        if (!FIXED_KEYS.has(k)) dynamic[k] = v ?? "";
      });
      setFields(dynamic);
    } else {
      setCategoryId(initialCategoryId ?? "");
      setSku("");
      setStock("");
      setName("");
      const dynamic = {};
      existingKeys.forEach((k) => {
        dynamic[k] = "";
      });
      setFields(dynamic);
    }
  }, [mode, initialProduct, existingKeys, initialCategoryId]);

  const setFieldValue = (key, value) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  function validate() {
    if (!categoryId) return "Select a category.";
    if (!sku.trim()) return "SKU is required.";
    if (stock === "" || isNaN(Number(stock)) || Number(stock) < 0)
      return "Stock must be a number greater than or equal to 0.";
    if (!name.trim()) return "Name is required.";
    return null;
  }

  function buildPayload() {
    const data = { nombre: name.trim() };
    Object.entries(fields).forEach(([k, v]) => {
      if (k.trim()) data[k] = v;
    });
    return {
      categoryId,
      sku: sku.trim(),
      stock: Number(stock),
      data,
    };
  }

  return {
    categoryId,
    setCategoryId,
    sku,
    setSku,
    stock,
    setStock,
    name,
    setName,
    fields,
    setFieldValue,
    errorMsg,
    setErrorMsg,
    validate,
    buildPayload,
  };
}
