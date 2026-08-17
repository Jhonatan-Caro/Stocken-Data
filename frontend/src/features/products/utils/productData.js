function pickField(data, keys) {
  if (!data || typeof data !== "object") return undefined;
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== "") {
      return data[k];
    }
  }
  return undefined;
}

export function getName(product) {
  return (
    pickField(product?.data, ["nombre", "Nombre", "name", "Name", "NAME"]) ??
    "—"
  );
}

export function getModel(product) {
  return (
    pickField(product?.data, [
      "modelo",
      "Modelo",
      "model",
      "Model",
      "MODEL",
      "sku",
      "SKU",
      "Sku",
    ]) ?? "—"
  );
}

export function getCategory(product) {
  if (product?.category_name) return product.category_name;
  return (
    pickField(product?.data, [
      "categoria",
      "Categoria",
      "category",
      "Category",
    ]) ?? "—"
  );
}

export function getPrice(product) {
  const v = pickField(product?.data, [
    "precio",
    "Precio",
    "price",
    "Price",
    "PRICE",
  ]);
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

export function getStock(product) {
  if (product?.stock !== undefined && product?.stock !== null) {
    const num = Number(product.stock);
    return num;
  }

  const v = pickField(product?.data, [
    "stock",
    "Stock",
    "STOCK",
    "cantidad",
    "Cantidad",
  ]);
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

export function formatPrice(price) {
  if (price === null || price === undefined) return "—";
  return `$${Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function stockStatus(stock) {
  if (stock === null || stock === undefined)
    return { label: "—", cls: "bg-gray-100 text-gray-500" };
  if (stock <= 0)
    return { label: "Out of Stock", cls: "bg-red-100 text-red-600" };
  if (stock < 20)
    return { label: "Low Stock", cls: "bg-amber-100 text-amber-700" };
  return { label: "Available", cls: "bg-emerald-100 text-emerald-700" };
}
