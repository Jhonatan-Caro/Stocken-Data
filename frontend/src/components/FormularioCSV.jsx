import { useState } from "react";
import { useCSV } from "../hooks/useCSV";
import { useCategorias } from "../hooks/useCategorias";

export default function FormularioCSV() {
    const [archivo, setArchivo] = useState(null);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
    const { categorias, crearCategoria } = useCategorias();
    const { parseCSV, subirCSV, columnas, datos } = useCSV();

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
        <div className="formulario">
            <h2>Crear nueva categoría</h2>
            <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            <input
                type="text"
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
            />
            <button onClick={handleCrearCategoria}>Crear categoría</button>

            <h3>O seleccionar una categoría existente:</h3>
            <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
                <option value="">--Selecciona--</option>
                {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                    </option>
                ))}
            </select>

            <h3>Seleccionar CSV</h3>
            <input type="file" accept=".csv" onChange={handleArchivo} />

            {datos.length > 0 && (
                <div>
                    <h3>Previsualización (primeras filas)</h3>
                    <table>
                        <thead>
                            <tr>
                                {columnas.map((col, i) => (
                                    <th key={i}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {datos.slice(0, 5).map((fila, i) => (
                                <tr key={i}>
                                    {columnas.map((col) => (
                                        <td key={col}>{fila[col]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={handleSubir}>Subir CSV</button>
                </div>
            )}
        </div>
    );
}