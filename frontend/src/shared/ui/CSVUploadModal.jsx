import { useState } from "react";
import {
  FiUpload,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  autoMapColumns,
  analyzeMapping,
  typeMatches,
} from "../lib/importMapping";

function initToggles(toggles) {
  return Object.fromEntries(
    (toggles ?? []).map((t) => [t.key, t.default ?? false]),
  );
}

export default function CSVUploadModal({
  open,
  onClose,
  onGetColumns,
  onUpload,
  categories,
  requiredFields,
  title,
  toggles,
}) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [mapping, setMapping] = useState({});
  const [mappingMeta, setMappingMeta] = useState({});
  const [columnTypes, setColumnTypes] = useState({});
  const [toggleValues, setToggleValues] = useState(() => initToggles(toggles));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!open) return null;

  const needsCategory = Boolean(categories);

  function reset() {
    setStep(0);
    setFile(null);
    setCategoryId("");
    setColumns([]);
    setPreview([]);
    setSheets([]);
    setSelectedSheet("");
    setMapping({});
    setMappingMeta({});
    setColumnTypes({});
    setToggleValues(initToggles(toggles));
    setError(null);
    setResult(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function applyAutoMap(cols, previewRows) {
    const { mapping: auto, meta, columnTypes: types } = autoMapColumns(
      cols,
      requiredFields,
      previewRows,
    );
    setMapping(auto);
    setMappingMeta(meta);
    setColumnTypes(types);
  }

  async function handleLoadColumns(e) {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Selecciona un archivo CSV o Excel.");
    setBusy(true);
    try {
      const data = await onGetColumns(file);
      setColumns(data.columns);
      setPreview(data.preview);
      setSheets(data.sheets || []);
      setSelectedSheet(data.defaultSheet || "");
      applyAutoMap(data.columns, data.preview);
      setStep(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al leer el archivo.");
    } finally {
      setBusy(false);
    }
  }

  function handleSheetChange(name) {
    const sheet = sheets.find((s) => s.name === name);
    if (!sheet) return;
    setSelectedSheet(name);
    setColumns(sheet.columns);
    setPreview(sheet.preview);
    applyAutoMap(sheet.columns, sheet.preview);
  }

  async function handleImport(e) {
    e.preventDefault();
    setError(null);
    const missing = requiredFields
      .filter((f) => f.required && !mapping[f.key])
      .map((f) => f.label);
    if (missing.length) {
      return setError(`Campos obligatorios sin mapear: ${missing.join(", ")}`);
    }

    if (needsCategory && !categoryId && !mapping.category) {
      return setError(
        "Selecciona una categoría por defecto o mapea la columna de categoría del archivo.",
      );
    }
    setBusy(true);
    try {
      const res = needsCategory
        ? await onUpload(file, categoryId, mapping, selectedSheet, toggleValues)
        : await onUpload(file, mapping, selectedSheet, toggleValues);
      setResult(res);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al importar.");
    } finally {
      setBusy(false);
    }
  }

  const warnings = analyzeMapping(mapping, requiredFields, columnTypes, columns);
  const hasBlocking = warnings.some((w) => w.blocking);
  const blockingWarnings = warnings.filter((w) => w.blocking);
  const advisoryWarnings = warnings.filter((w) => !w.blocking);

  function firstExample(col) {
    if (!col) return null;
    for (const row of preview) {
      const value = row?.[col];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        return String(value);
      }
    }
    return null;
  }

  function handleMappingChange(key, col) {
    setMapping((m) => ({ ...m, [key]: col }));
    setMappingMeta((meta) => ({ ...meta, [key]: col ? "manual" : undefined }));
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {title ??
                `${needsCategory ? "Importar productos" : "Importar ventas"} desde archivo`}
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

        {step === 0 && (
          <form onSubmit={handleLoadColumns} className="flex flex-col gap-4">
            {needsCategory && (
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-700">
                  Categoría por defecto
                </span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none"
                >
                  <option value="">
                    Sin categoría por defecto (usar columna del archivo)
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400">
                  Opcional si tu archivo tiene una columna de categoría: la
                  mapearás en el siguiente paso y se crearán automáticamente.
                </span>
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

        {step === 1 && (
          <form onSubmit={handleImport} className="flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Indica qué columna de tu archivo corresponde a cada campo.
              <br/>
              Apoyate de la documentacion de la aplicacion para conocer los campos requeridos y el formato de cada uno:
            </p>
            <a
              href="https://example.com/documentation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-xs font-medium"
            >
              Ver documentación
            </a>
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

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                <span>Campo</span>
                <span className="text-center">→</span>
                <span>Columna en tu archivo</span>
              </div>
              {requiredFields.map((field) => {
                const { key, label, required, type } = field;
                const selectedCol = mapping[key] || "";
                const example = firstExample(selectedCol);
                const typeMismatch =
                  selectedCol &&
                  typeMatches(type, columnTypes[selectedCol]) === false;
                return (
                  <div
                    key={key}
                    className="grid grid-cols-3 gap-2 items-start px-3 py-2 border-t border-gray-100"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-700">
                        {label}
                        {required && (
                          <span className="text-red-400 ml-0.5">*</span>
                        )}
                      </span>
                      <ConfidenceBadge
                        confidence={mappingMeta[key]}
                        mapped={Boolean(selectedCol)}
                      />
                    </div>
                    <FiArrowRight
                      className="text-gray-300 justify-self-center mt-2"
                      size={14}
                    />
                    <div className="flex flex-col gap-1">
                      <select
                        value={selectedCol}
                        onChange={(e) =>
                          handleMappingChange(key, e.target.value)
                        }
                        className={`border rounded-lg px-2 py-1.5 text-xs bg-gray-50 outline-none w-full ${
                          typeMismatch ? "border-amber-400" : "border-gray-200"
                        }`}
                      >
                        <option value="">— sin mapear —</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                      {example && (
                        <span className="text-[11px] text-gray-400 truncate">
                          p.ej.: {example}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                Vista previa (primeras {Math.min(preview.length, 5)} filas)
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
                    {preview.slice(0, 5).map((row, i) => (
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

            {toggles?.length > 0 && (
              <div className="flex flex-col gap-2">
                {toggles.map((t) => (
                  <label
                    key={t.key}
                    className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={toggleValues[t.key] ?? false}
                      onChange={(e) =>
                        setToggleValues((v) => ({
                          ...v,
                          [t.key]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 accent-[#03a696]"
                    />
                    <span>
                      {t.label}
                      {t.hint && (
                        <span className="block text-xs text-gray-400">
                          {t.hint}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {blockingWarnings.length > 0 && (
              <WarningPanel warnings={blockingWarnings} tone="error" />
            )}
            {advisoryWarnings.length > 0 && (
              <WarningPanel warnings={advisoryWarnings} tone="advisory" />
            )}

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
                disabled={busy || hasBlocking}
                className="px-4 py-2 rounded-lg bg-[#0b3041] hover:bg-[#03a696] disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {busy ? "Importando..." : "Importar"}
              </button>
            </div>
          </form>
        )}

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

function ConfidenceBadge({ confidence, mapped }) {
  if (!mapped) return null;

  if (confidence === "high") {
    return (
      <span className="inline-flex w-fit items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
        <FiCheck size={9} /> auto
      </span>
    );
  }
  if (confidence === "medium" || confidence === "low") {
    return (
      <span className="inline-flex w-fit items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-1.5 py-0.5">
        <FiAlertTriangle size={9} /> revisar
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5">
      manual
    </span>
  );
}

function WarningPanel({ warnings, tone }) {
  const styles =
    tone === "error"
      ? "text-red-600 bg-red-50 border-red-100"
      : "text-amber-700 bg-amber-50 border-amber-100";
  return (
    <div className={`text-xs rounded-lg border px-3 py-2 flex flex-col gap-1 ${styles}`}>
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <FiAlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
