import { useState } from "react";
import { useCSV } from "../hooks/useCSV";
import { useCategorias } from "../hooks/useCategorias";
import { useRegistros } from "../hooks/useRegistros";

export default function FormularioCSV() {
    const [archivo, setArchivo] = useState(null);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
    const { categorias, crearCategoria, eliminarCategoria } = useCategorias();
    const { parseCSV, subirCSV, columnas, datos } = useCSV();
    const [registrosManual, setRegistrosManual] = useState([
        [{ clave: "", valor: "" }]
    ]);
    const token = localStorage.getItem("token");
    const [esNuevaCategoria, setEsNuevaCategoria] = useState(false);
    const { fetchRegistros } = useRegistros();

    const agregarRegistroManual = () => {
        const clavesBase = registrosManual[0]?.map(c => c.clave.trim()) || [];
        const nuevoRegistro = clavesBase.map(clave => ({ clave: clave, valor: "" }));
        setRegistrosManual([...registrosManual, nuevoRegistro]);
    };

    const agregarCampo = (index) => {
        const nuevos = [...registrosManual];
        nuevos[index].push({ clave: "", valor: "" });
        setRegistrosManual(nuevos);
    };

    const handleCampoChange = (registroIdx, campoIdx, key, value) => {
        const nuevos = [...registrosManual];
        nuevos[registroIdx][campoIdx][key] = value;
        setRegistrosManual(nuevos);
    };

    const eliminarCampo = (registroIdx, campoIdx) => {
        const nuevos = [...registrosManual];
        nuevos[registroIdx].splice(campoIdx, 1);
        setRegistrosManual(nuevos);
    };
    
    const handleGuardarRegistrosManuales = async () => {
    const registros = registrosManual.map((registro) => {
        const obj = {};
        registro.forEach(({ clave, valor }) => {
        if (clave.trim()) obj[clave.trim()] = valor;
        });
        return obj;
    });

    if (registros.every((r) => Object.keys(r).length === 0)) {
        alert("Debes ingresar al menos un campo válido");
        return;
    }

    try {
        await fetch("http://localhost:4000/api/registros", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // asegúrate de tener este token definido
        },
        body: JSON.stringify({
            categoriaId: categoriaSeleccionada,
            datos: registros,
        }),
        });

        alert("Registros guardados con éxito");
        setRegistrosManual([[{ clave: "", valor: "" }]]);
    } catch (err) {
        console.error(err);
        alert("Error al guardar registros");
    }
    };

    const handleArchivo = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivo(file);
            parseCSV(file);
        }
    };

    const handleCrearCategoria = async () => {
        if (!nombre || !descripcion) {
            alert("Nombre y descripción son obligatorios");
            return;
        }
        const nueva = await crearCategoria({ nombre, descripcion });
        setCategoriaSeleccionada(nueva.id);
        setNombre("");
        setDescripcion("");
        setEsNuevaCategoria(true);
    };

    const handleSubir = async () => {
        if (!categoriaSeleccionada || !archivo) {
            alert("Debes seleccionar una categoría y un archivo");
            return;
        }

        try {
            await subirCSV(categoriaSeleccionada);
            alert("Archivo subido con éxito");
        } catch (err) {
            alert("Error al subir el archivo");
        }
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-md space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Crear nueva categoría</h2>
            <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border mx-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="text"
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="border mx-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
                onClick={handleCrearCategoria}
                className="bg-custom-verde bg-600 hover:bg-custom-azul bg-700 text-white px-4 py-2 rounded-lg shadow"
            >
                Crear categoría
            </button>

            {/* Categorías Existentes */}
            <h3 className="text-lg font-medium mt-6">O seleccionar una categoría existente:</h3>
            <select
                value={categoriaSeleccionada}
                onChange={(e) => {
                    setCategoriaSeleccionada(e.target.value)
                    setEsNuevaCategoria(false)
                }}
                className="border p-2 rounded-lg w-full"
            >
                <option value="">--Selecciona--</option>
                {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                    </option>
                ))}
            </select>

            {/* Borrar Categoría */}
            {categoriaSeleccionada && (
            <button
                onClick={async () => {
                    const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta categoría y todos sus registros?");
                    if (!confirmacion) return;

                    try {
                        await eliminarCategoria(categoriaSeleccionada);
                        alert("Categoría eliminada con éxito");
                        setCategoriaSeleccionada("");
                        setEsNuevaCategoria(false);
                    } catch (err) {
                        alert("Error al eliminar categoría");
                    }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-2"
            >
                🗑️ Eliminar categoría
            </button>
            )}

            {/* Agregar Nueva Categoría */}
            {esNuevaCategoria && (
                <div className="mt-8 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Agregar registros manualmente</h3>
                    {registrosManual.map((registro, registroIdx) => (
                        <div key={registroIdx} className="p-4 bg-gray-50 border rounded-xl shadow-sm space-y-4">
                            <h4 className="font-medium text-gray-700">Registro {registroIdx + 1}</h4>
                            {registro.map((campo, campoIdx) => (
                                <div 
                                    key={campoIdx} 
                                    className="flex flex-col md:flex-row items-center gap-2 md:gap-4"
                                >
                                    <input
                                        type="text"
                                        placeholder="Clave"
                                        value={campo.clave}
                                        onChange={(e) =>
                                        handleCampoChange(registroIdx, campoIdx, "clave", e.target.value)
                                        }
                                        disabled={registroIdx !== 0}
                                        className={`border rounded-md p-2 w-full md:w-1/2 ${
                                            registroIdx !== 0 ? "bg-gray-100 cursor-not-allowed" : ""
                                        }`}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Valor"
                                        value={campo.valor}
                                        onChange={(e) =>
                                        handleCampoChange(registroIdx, campoIdx, "valor", e.target.value)
                                        }
                                        className="border rounded-md p-2 w-full md:w-1/2"
                                    />
                                    <button 
                                        onClick={() => eliminarCampo(registroIdx, campoIdx)}
                                        className="text-red-600 hover:text-red-800 transition"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}

                            {registroIdx === 0 && (
                                <button 
                                    onClick={() => agregarCampo(registroIdx)}
                                    className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                                >
                                    + Agregar campo
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Previsualización de Registros */}
                    {registrosManual.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Previsualización de registros</h4>
                            <div className="overflow-x-auto">
                                <table className="table-auto w-full border border-gray-300 rounded-md overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            {[...new Set(registrosManual.flat().map((campo) => campo.clave.trim()))]
                                            .filter((clave) => clave)
                                            .map((clave, idx) => (
                                                <th key={idx} className="border px-4 py-2 text-left font-medium text-sm text-gray-700">{clave}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrosManual.map((registro, i) => {
                                            const fila = {};
                                            registro.forEach(({ clave, valor }) => {
                                                if (clave.trim()) fila[clave.trim()] = valor;
                                            });

                                            return (
                                                <tr key={i} className="even:bg-gray-50">
                                                    {[...new Set(registrosManual.flat().map((c) => c.clave.trim()))]
                                                        .filter((clave) => clave)
                                                        .map((clave, idx) => (
                                                        <td key={idx} className="border px-4 py-2 text-sm text-gray-800">{fila[clave] || ""}</td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Botones de Agregar/Guardar Registros Manualmente */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={agregarRegistroManual}
                            className="bg-indigo-600 hover:bg-custom-azul bg-700 text-white px-4 py-2 rounded-md shadow"
                        >
                            + Agregar nuevo registro
                        </button>

                        <button 
                            onClick={handleGuardarRegistrosManuales}
                            className="bg-custom-verde bg-600 hover:bg-custom-azul bg-700 text-white px-4 py-2 rounded-md shadow"
                        >
                            Guardar registros manuales
                        </button>
                    </div>
                </div>
            )}

            {/* Cargar CSV */}
            <div>
                <h3 className="text-lg font-medium mt-6">Seleccionar CSV</h3>
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleArchivo}
                    className="border p-2 rounded-lg mt-2"
                />
            </div>

            {datos.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Previsualización</h3>
                    <table className="table-auto w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                {columnas.map((col, i) => (
                                    <th key={i} className="border px-3 py-2">{col}</th>
                                ))}
                            </tr>   
                        </thead>
                        <tbody>
                            {datos.slice(0, 5).map((fila, i) => (
                                <tr key={i} className="even:bg-gray-50">
                                    {columnas.map((col) => (
                                        <td key={col} className="border px-3 py-2">{fila[col]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button 
                        onClick={handleSubir}
                        className="mt-4 bg-custom-verde bg-600 hover:bg-custom-azul bg-700 text-white px-4 py-2 rounded-lg"
                    >
                        Subir CSV
                    </button>
                    <br></br>
                    <span className="text-xs text-gray-500 mt-1">
                        • El Registro de la categoría se guardara con la misma organización que
                        este cuente en el CSV.
                    </span>
                </div>
            )}
            
        </div>
    );
}