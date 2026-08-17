import { FiX } from "react-icons/fi";
import useProductForm from "../../features/products/hooks/useProductForm";

export default function ProductFormModal({
  open,
  mode = "create",
  initialProduct = null,
  categories = [],
  initialCategoryId = "",
  existingKeys = [],
  onSubmit,
  onClose,
  busy = false,
}) {
  const {
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
  } = useProductForm({ mode, initialProduct, existingKeys, initialCategoryId });

  const isEdit = mode === "edit";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    const error = validate();
    if (error) return setErrorMsg(error);
    try {
      await onSubmit(buildPayload());
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Could not save product.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {isEdit ? "Edit product" : "Add product"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <FiX size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-6 py-5 overflow-y-auto"
        >
          {/* Category */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-gray-700">Category</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isEdit}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none disabled:opacity-50"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* SKU + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-700">
                SKU <span className="text-red-400">*</span>
              </span>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. NEV-001"
                disabled={isEdit}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-700">
                Stock <span className="text-red-400">*</span>
              </span>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none"
              />
            </label>
          </div>

          {/* Name */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-gray-700">
              Name <span className="text-red-400">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samsung Fridge 200L"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none"
            />
          </label>

          {/* Dynamic fields */}
          {Object.keys(fields).length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-700">Attributes</span>
              {Object.entries(fields).map(([key, value]) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 capitalize">{key}</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setFieldValue(key, e.target.value)}
                    placeholder={`Value for ${key}`}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none"
                  />
                </label>
              ))}
            </div>
          )}

          {!isEdit && !initialCategoryId && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Filter by a category first to see its available attributes.
            </p>
          )}

          {errorMsg && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 bg-[#0b3041] hover:bg-[#03a696] disabled:opacity-60 transition text-white font-semibold py-2.5 rounded-lg text-sm"
          >
            {busy ? "Saving..." : isEdit ? "Save changes" : "Create product"}
          </button>
        </form>
      </div>
    </div>
  );
}
