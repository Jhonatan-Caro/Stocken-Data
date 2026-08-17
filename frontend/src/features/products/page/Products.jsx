import { useEffect, useState } from "react";
import { FiUpload, FiPlus, FiEdit2 } from "react-icons/fi";

import DashboardLayout from "../../../shared/layout/DashboardLayout";
import useProducts from "../hooks/useProducts";
import useProductFilter from "../hooks/useProductFilter";
import useProductSearch from "../hooks/useProductSearch";
import useCategories from "../../categories/hooks/useCategories";

import ProductsTable from "../components/ProductsTable";
import ProductFormModal from "../../../shared/ui/ProductFormModal";
import CategoryFilter from "../components/CategoryFilter";
import CSVUploadModal from "../../../shared/ui/CSVUploadModal";

const PRODUCT_FIELDS = [
  {
    key: "sku",
    label: "SKU / code",
    required: true,
    type: "text",
    aliases: ["sku", "codigo", "cod", "ref", "referencia", "ean", "code"],
  },
  {
    key: "stock",
    label: "Stock",
    required: false,
    type: "integer",
    aliases: ["existencias", "inventario", "cantidad", "qty", "unidades", "disponible"],
  },
  {
    key: "warehouse",
    label: "Almacén",
    required: false,
    type: "text",
    aliases: ["almacen", "deposito", "bodega", "warehouse"],
  },
  {
    key: "location",
    label: "Ubicación",
    required: false,
    type: "text",
    aliases: ["ubicacion", "localizacion", "posicion", "estante", "location"],
  },
  {
    key: "name",
    label: "Name",
    required: false,
    type: "text",
    aliases: ["nombre", "producto", "descripcion", "articulo", "detalle", "description"],
  },
  {
    key: "category",
    label: "Categoría",
    required: false,
    type: "text",
    aliases: ["categoria", "familia", "tipo", "rubro", "category"],
  },
];

export default function Products() {
  const {
    products,
    loadProducts,
    addProduct,
    editProduct,
    uploadCSV,
    getCSVColumns,
    error,
  } = useProducts();
  const { categories, loadCategories } = useCategories();

  const {
    categoryFilter,
    setCategoryFilter,
    filteredProducts,
    currentCategoryKeys,
  } = useProductFilter(products, categories);

  const { query, setQuery, searchedProducts } =
    useProductSearch(filteredProducts);
  const [mode, setMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleSelect = (product) => setSelected(product);

  const handleSubmit = async ({ categoryId, sku, stock, data }) => {
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "edit" && selected) {
        await editProduct(selected.id, { categoryId, stock, data });
        setMessage("Product updated.");
      } else {
        await addProduct({ categoryId, sku, stock, data });
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

  const handleGetColumns = (file) => getCSVColumns(file);

  const handleUploadCSV = async (file, categoryId, mapping, sheet) => {
    const resp = await uploadCSV(file, categoryId, mapping, sheet);
    setMessage("Archivo procesado correctamente.");
    return resp;
  };

  return (
    <DashboardLayout onSearch={setQuery}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Products
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Importa tus productos para administrarlos facilmente. Puedes subir un archivo CSV o XLSX con los datos, o agregarlos manualmente.
        </p>
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
            categories={categories}
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

        <div>
          <ProductsTable
            products={searchedProducts}
            onSelect={handleSelect}
            selectedId={selected?.id}
          />
        </div>
      </div>

      {/* [MODIFICADO] El formulario de crear/editar producto ahora es un MODAL
          (shared/ui/ProductFormModal). Se renderiza solo cuando hay `mode`
          activo, así se monta de cero en cada apertura y el formulario se
          resetea entre crear y editar (igual que hacía el panel anterior). */}
      {mode && (
        <ProductFormModal
          open
          mode={mode}
          initialProduct={mode === "edit" ? selected : null}
          categories={categories}
          initialCategoryId={categoryFilter}
          existingKeys={currentCategoryKeys}
          onSubmit={handleSubmit}
          onClose={() => setMode(null)}
          busy={busy}
        />
      )}

      <CSVUploadModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onGetColumns={handleGetColumns}
        onUpload={handleUploadCSV}
        categories={categories}
        requiredFields={PRODUCT_FIELDS}
      />
    </DashboardLayout>
  );
}
