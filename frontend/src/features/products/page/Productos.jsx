import { useEffect, useState } from "react";
import { FiUpload, FiPlus, FiEdit2 } from "react-icons/fi";

import DashboardLayout from "../../../shared/layout/DashboardLayout";
import useProductos from "../hooks/useProductos";
import useProductFilter from "../hooks/useProductFilter";
import useProductSearch from "../hooks/useProductSearch";
import useCategorias from "../../categorys/hooks/useCategorias";

import ProductsTable from "../components/ProductsTable";
import ProductFormPanel from "../components/ProductFormPanel";
import CategoryFilter from "../components/CategoryFilter";
import CSVUploadModal from "../components/CSVUploadModal";

const PRODUCT_FIELDS = [
  { key: "sku", label: "SKU / code", required: true },
  { key: "stock", label: "Stock", required: false },
  { key: "name", label: "Name", required: false },
];

export default function Productos() {
  const {
    productos,
    cargarProductos,
    agregarProducto,
    modificarProducto,
    subirCSV,
    obtenerColumnasCSV,
    error,
  } = useProductos();
  const { categorias, cargarCategorias } = useCategorias();

  const {
    categoryFilter,
    setCategoryFilter,
    filteredProducts,
    currentCategoryKeys,
  } = useProductFilter(productos, categorias);

  const { query, setQuery, searchedProducts } =
    useProductSearch(filteredProducts);
  const [mode, setMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const handleSelect = (product) => setSelected(product);

  const handleSubmit = async ({ categoryId, sku, stock, data }) => {
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "edit" && selected) {
        await modificarProducto(selected.id, { categoryId, stock, data });
        setMessage("Product updated.");
      } else {
        await agregarProducto({ categoryId, sku, stock, data });
        setMessage("Product created.");
      }
      setMode(null);
      setSelected(null);
    } finally {
      setBusy(false);
    }
  };

  const handleEditClick = () => {
    if (!selected)
      return setMessage("Select a product from the table to edit.");
    setMode("edit");
  };

  const handleGetColumns = (file) => obtenerColumnasCSV(file);

  const handleUploadCSV = async (file, categoryId, mapping, sheet) => {
    const resp = await subirCSV(file, categoryId, mapping, sheet);
    setMessage("Archivo procesado correctamente.");
    return resp;
  };

  return (
    <DashboardLayout onSearch={setQuery}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Products
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCsvOpen(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#03a696] hover:text-[#03a696] text-gray-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm transition"
          >
            <FiUpload size={16} /> Upload CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setMode("create");
            }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#03a696] hover:text-[#03a696] text-gray-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm transition"
          >
            <FiPlus size={16} /> Add
          </button>
          <button
            type="button"
            onClick={handleEditClick}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#03a696] hover:text-[#03a696] text-gray-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm transition"
          >
            <FiEdit2 size={16} /> Edit
          </button>

          <CategoryFilter
            categories={categorias}
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setSelected(null);
              setMode(null);
            }}
          />
        </div>
        {/* Indicador de búsqueda activa */}
        {query && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              Showing{" "}
              <span className="font-medium text-gray-800">
                {searchedProducts.length}
              </span>{" "}
              results for
              <span className="font-medium text-gray-800"> "{query}"</span>
            </span>
            <button
              onClick={() => setQuery("")}
              className="text-xs text-[#03a696] hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {(error || message) && (
          <div
            className={`text-sm rounded-xl px-4 py-3 ${
              error
                ? "bg-red-50 border border-red-100 text-red-600"
                : "bg-emerald-50 border border-emerald-100 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <ProductsTable
            productos={searchedProducts}
            onSelect={handleSelect}
            selectedId={selected?.id}
            limit={mode ? 6 : 10}
          />

          {mode && (
            <ProductFormPanel
              mode={mode}
              initialProduct={mode === "edit" ? selected : null}
              categories={categorias}
              initialCategoryId={categoryFilter}
              existingKeys={currentCategoryKeys}
              onSubmit={handleSubmit}
              onClose={() => setMode(null)}
              busy={busy}
            />
          )}
        </div>
      </div>

      <CSVUploadModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onGetColumns={handleGetColumns}
        onUpload={handleUploadCSV}
        categorias={categorias}
        requiredFields={PRODUCT_FIELDS}
      />
    </DashboardLayout>
  );
}
