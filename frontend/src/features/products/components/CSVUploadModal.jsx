import { useState } from "react";
import {
  FiUpload,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";

// steps: 0 = selección, 1 = mapper, 2 = resultado
export default function CSVUploadModal({
  open,
  onClose,
  onGetColumns, // (file) => { columns, preview }
  onUpload, // (file, categoryId, mapping) => result   [productos]
  // (file, mapping) => result               [ventas]
  categorias, // solo productos; undefined en ventas
  requiredFields, // [{ key, label, required }]
}) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [mapping, setMapping] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!open) return null;

  const needsCategory = Boolean(categorias);

  function reset() {
    setStep(0);
    setFile(null);
    setCategoryId("");
    setColumns([]);
    setPreview([]);
    setSheets([]);
    setSelectedSheet("");
    setMapping({});
    setError(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  // Pre-mapear automáticamente si el nombre coincide exactamente
  function autoMapColumns(cols) {
    const autoMap = {};
    requiredFields.forEach(({ key }) => {
      if (cols.includes(key)) autoMap[key] = key;
    });
    return autoMap;
  }

  // Paso 0 → 1: subir archivo y obtener columnas (y hojas si es Excel)
  async function handleLoadColumns(e) {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Selecciona un archivo CSV o Excel.");
    if (needsCategory && !categoryId)
      return setError("Selecciona una categoría.");
    setBusy(true);
    try {
      const data = await onGetColumns(file);
      setColumns(data.columns);
      setPreview(data.preview);
      setSheets(data.sheets || []);
      setSelectedSheet(data.defaultSheet || "");
      setMapping(autoMapColumns(data.columns));
      setStep(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al leer el archivo.");
    } finally {
      setBusy(false);
    }
  }

  // Cambiar de hoja: columnas y preview vienen de la respuesta ya cargada,
  // sin nueva llamada al backend; el mapping se recalcula para la hoja nueva
  function handleSheetChange(name) {
    const sheet = sheets.find((s) => s.name === name);
    if (!sheet) return;
    setSelectedSheet(name);
    setColumns(sheet.columns);
    setPreview(sheet.preview);
    setMapping(autoMapColumns(sheet.columns));
  }

  // Paso 1 → 2: importar con mapping confirmado
  async function handleImport(e) {
    e.preventDefault();
    setError(null);
    const missing = requiredFields
      .filter((f) => f.required && !mapping[f.key])
      .map((f) => f.label);
    if (missing.length) {
      return setError(`Campos obligatorios sin mapear: ${missing.join(", ")}`);
    }
    setBusy(true);
    try {
      const res = needsCategory
        ? await onUpload(file, categoryId, mapping, selectedSheet)
        : await onUpload(file, mapping, selectedSheet);
      setResult(res);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al importar.");
    } finally {
      setBusy(false);
    }
  }

  const requiredMapped = requiredFields
    .filter((f) => f.required)
    .every((f) => mapping[f.key]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {needsCategory ? "Importar productos" : "Importar ventas"} desde
              archivo
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              {["Archivo", "Mapear columnas", "Resultado"].map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium
                    ${
                      step > i
                        ? "bg-[#03a696] text-white"
                        : step === i
                          ? "bg-[#0b3041] text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > i ? <FiCheck size={10} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs ${step === i ? "text-gray-700 font-medium" : "text-gray-400"}`}
                  >
                    {label}
                  </span>
                  {i < 2 && <div className="w-4 h-px bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* PASO 0: selección de archivo */}
        {step === 0 && (
          <form onSubmit={handleLoadColumns} className="flex flex-col gap-4">
            {needsCategory && (
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-700">Categoría</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-700">
                Archivo CSV o Excel (.xlsx)
              </span>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-3 bg-gray-50">
                <FiUpload className="text-gray-400" size={18} />
                <input
                  type="file"
                  accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-sm flex-1"
                />
              </div>
              {file && (
                <span className="text-xs text-gray-500">
                  Seleccionado: {file.name}
                </span>
              )}
            </label>
            {error && <ErrorBox message={error} />}
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-[#0b3041] hover:bg-[#03a696] disabled:opacity-60 text-white text-sm font-semibold transition flex items-center gap-1.5"
              >
                {busy ? (
                  "Leyendo..."
                ) : (
                  <>
                    <span>Siguiente</span>
                    <FiArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* PASO 1: mapper de columnas */}
        {step === 1 && (
          <form onSubmit={handleImport} className="flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Indica qué columna de tu archivo corresponde a cada campo.
            </p>

            {/* Selector de hoja: solo para Excel con varias hojas */}
            {sheets.length > 1 && (
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-700">Hoja del Excel</span>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none"
                >
                  {sheets.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.rowCount} filas)
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Tabla de mapeo */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                <span>Campo</span>
                <span className="text-center">→</span>
                <span>Columna en tu archivo</span>
              </div>
              {requiredFields.map(({ key, label, required }) => (
                <div
                  key={key}
                  className="grid grid-cols-3 items-center px-3 py-2 border-t border-gray-100"
                >
                  <span className="text-sm text-gray-700">
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                  </span>
                  <FiArrowRight
                    className="text-gray-300 justify-self-center"
                    size={14}
                  />
                  <select
                    value={mapping[key] || ""}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [key]: e.target.value }))
                    }
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 outline-none w-full"
                  >
                    <option value="">— sin mapear —</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                Vista previa (primeras {preview.length} filas)
              </p>
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="text-xs w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => {
                        const isMapped = Object.values(mapping).includes(col);
                        return (
                          <th
                            key={col}
                            className={`px-3 py-2 text-left font-medium whitespace-nowrap
                              ${isMapped ? "text-[#03a696]" : "text-gray-400"}`}
                          >
                            {col}
                            {isMapped ? " ✓" : ""}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {columns.map((col) => {
                          const isMapped = Object.values(mapping).includes(col);
                          return (
                            <td
                              key={col}
                              className={`px-3 py-1.5 whitespace-nowrap
                                ${isMapped ? "text-[#03a696] font-medium" : "text-gray-500"}`}
                            >
                              {row[col] ?? "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && <ErrorBox message={error} />}

            <div className="flex justify-between gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setStep(0);
                  setError(null);
                }}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-1.5"
              >
                <FiArrowLeft size={14} /> Atrás
              </button>
              <button
                type="submit"
                disabled={busy || !requiredMapped}
                className="px-4 py-2 rounded-lg bg-[#0b3041] hover:bg-[#03a696] disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {busy ? "Importando..." : "Importar"}
              </button>
            </div>
          </form>
        )}

        {/* PASO 2: resultado */}
        {step === 2 && result && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center
              ${result.rowsFailed > 0 ? "bg-yellow-50" : "bg-green-50"}`}
            >
              <FiCheck
                size={24}
                className={
                  result.rowsFailed > 0 ? "text-yellow-500" : "text-[#03a696]"
                }
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">
                {result.message}
              </p>
              {result.rowsFailed > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {result.rowsFailed} filas no se importaron
                </p>
              )}
            </div>

            {/* Errores por fila */}
            {result.errors?.length > 0 && (
              <div className="w-full max-h-32 overflow-y-auto border border-red-100 rounded-lg bg-red-50 p-2">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600">
                    Fila {e.row}: {e.error}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  reset();
                }}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                Importar otro
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-[#0b3041] hover:bg-[#03a696] text-white text-sm font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {message}
    </div>
  );
}
