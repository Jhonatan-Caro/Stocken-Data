import { useEffect, useState } from "react";
import useVentas from "../hooks/useVentas";
import {
  getNombre,
  getPrecio,
  getStock,
  formatPrecio,
} from "../../products/utils/productData";
import TablaVentas from "./TablaVentas";

export default function Ventas() {
  const {
    ventas,
    productos,
    mensaje,
    cargarVentas,
    cargarProductosVendibles,
    realizarVenta,
  } = useVentas();
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    cargarVentas();
    cargarProductosVendibles();
  }, [cargarVentas, cargarProductosVendibles]);

  const handleVenta = async () => {
    if (!productoSeleccionado || cantidad <= 0) return;
    await realizarVenta({
      producto_id: Number(productoSeleccionado),
      cantidad: Number(cantidad),
    });
    setCantidad(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">Realizar venta</h2>

      <select
        value={productoSeleccionado}
        onChange={(e) => setProductoSeleccionado(e.target.value)}
        className="border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:border-gray-300 outline-none"
      >
        <option value="">Selecciona un producto</option>
        {productos.map((p) => {
          const stock = getStock(p);
          const precio = getPrecio(p);
          return (
            <option key={p.id} value={p.id}>
              {getNombre(p)} — {formatPrecio(precio)} (stock {stock ?? "?"})
            </option>
          );
        })}
      </select>

      <input
        type="number"
        min="1"
        value={cantidad}
        onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 1)}
        placeholder="Cantidad"
        className="border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:border-gray-300 outline-none"
      />

      <button
        type="button"
        onClick={handleVenta}
        className="self-start bg-[#0b3041] hover:bg-[#03a696] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
      >
        Realizar venta
      </button>

      {mensaje && (
        <p
          className={`text-sm ${
            mensaje.toLowerCase().includes("error")
              ? "text-red-600"
              : "text-emerald-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      <div className="mt-4">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Historial de ventas
        </h3>
        <TablaVentas ventas={ventas} />
      </div>
    </div>
  );
}
