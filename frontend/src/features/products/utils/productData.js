function pickField(data, keys) {
  if (!data || typeof data !== "object") return undefined;
  for (const k of keys) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== "") {
      return data[k];
    }
  }
  return undefined;
}

export function getNombre(producto) {
  return (
    pickField(producto?.data, ["nombre", "Nombre", "name", "Name", "NAME"]) ??
    "—"
  );
}

export function getModelo(producto) {
  return (
    pickField(producto?.data, [
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

export function getCategoria(producto) {
  if (producto?.category_name) return producto.category_name;
  return (
    pickField(producto?.data, [
      "categoria",
      "Categoria",
      "category",
      "Category",
    ]) ?? "—"
  );
}

export function getPrecio(producto) {
  const v = pickField(producto?.data, [
    "precio",
    "Precio",
    "price",
    "Price",
    "PRICE",
  ]);
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

export function getStock(producto) {
  console.log(
    "getStock recibe p.stock:",
    producto?.stock,
    "p.data.stock:",
    producto?.data?.stock,
  );
  if (producto?.stock !== undefined && producto?.stock !== null) {
    const num = Number(producto.stock);
    if (Number.isFinite(num)) console.log("→ usando p.stock:", num);
    return num;
  }

  const v = pickField(producto?.data, [
    "stock",
    "Stock",
    "STOCK",
    "cantidad",
    "Cantidad",
  ]);
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

export function formatPrecio(precio) {
  if (precio === null || precio === undefined) return "—";
  return `$${Number(precio).toLocaleString("en-US", {
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
