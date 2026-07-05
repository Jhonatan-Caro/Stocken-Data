import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "../../../shared/layout/DashboardLayout";
import useCategorias from "../hooks/useCategorias";
import useCategoryFilter from "../hooks/useCategoryFilter";

export default function PaginaCargaCSV() {
  const { categorias, cargarCategorias, agregarCategoria, eliminarCategoria } =
    useCategorias();
  const { query, setQuery, filteredCategories } = useCategoryFilter(categorias);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    try {
      await agregarCategoria({ nombre, descripcion });
      setMensaje("Categoría creada");
      setNombre("");
      setDescripcion("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "No fue posible crear la categoría",
      );
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar esta categoría y todos sus productos asociados?"))
      return;
    setMensaje(null);
    setError(null);
    try {
      await eliminarCategoria(id);
      setMensaje("Categoría eliminada");
    } catch (err) {
      setError(err?.response?.data?.message || "No fue posible eliminar");
    }
  };

  return (
    <DashboardLayout onSearch={setQuery}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Categories
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Crea y administra las categorías de tus productos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Categorías existentes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Creada</th>
                  <th className="px-4 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categorias.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Sin categorías. Crea la primera en el panel de la derecha.
                    </td>
                  </tr>
                )}
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("es-ES")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleEliminar(c.id)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 size={14} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Nueva categoría
          </h2>

          <form onSubmit={handleCrear} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-700">Nombre</span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Electronics"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-gray-300 outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-700">Descripción</span>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Opcional"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-gray-300 outline-none"
              />
            </label>

            {(mensaje || error) && (
              <div
                className={`text-sm rounded-lg px-3 py-2 ${
                  error
                    ? "bg-red-50 border border-red-100 text-red-600"
                    : "bg-emerald-50 border border-emerald-100 text-emerald-700"
                }`}
              >
                {error || mensaje}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#0b3041] hover:bg-[#03a696] transition text-white font-semibold py-2.5 rounded-lg text-sm"
            >
              <FiPlus size={16} /> Crear
            </button>
          </form>
        </aside>
      </div>
    </DashboardLayout>
  );
}
