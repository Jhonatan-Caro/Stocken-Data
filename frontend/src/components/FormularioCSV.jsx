import { useState } from "react";
import { useCSV } from "../hooks/useCSV.js";

export default function FormularioCSV() {
    const [tipoTabla, setTipoTabla] = useState("");
    const { datos, columnas, parseCSV, subirCSV } = useCSV([]);

    const handleArchivo = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            parseCSV(archivo);
        }
    }

    const handleEnviar = async (e) => {
        if(!tipoTabla) {
            alert("Por favor selecciona un tipo de tabla");
            return; 
        }

        try{
            await subirCSV(tipoTabla);
            alert("Archivo subido correctamente");  
        }catch (error) {
            console.error("Error al subir el archivo:", error);
            alert("Error al subir el archivo");
        }
    }

    return(
        <div className="panel">
            <h2>Subir archivo CSV</h2>

            <input type="file" accept=".csv" onChange={handleArchivo} />

            <input 
                type="text" 
                name="Nombre de la nueva tabla" 
                value={tipoTabla} 
                onChange={(e) => setTipoTabla(e.target.value)}
            />

            {datos.length > 0 && (
                <div>
                    <h3>Previsualizacion del CSV</h3>
                    <table>
                        <thead>
                            <tr>
                                {columnas.map((columna, index) => (
                                    <th key={index}>{columna}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {datos.slice(0,5).map((fila, index) => (
                                <tr key={index}>
                                    {columnas.map((columna) => (
                                        <td key={columna}>{fila[columna]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={handleEnviar}>Crear tabla y guardar datos</button>
                </div>
            )}
        </div>
    )
}