import { useState } from 'react';
import papa from 'papaparse';

export function useCSV() {
    const [archivoCSV, setArchivoCSV] = useState(null);
    const [datos, setDatos] = useState([]);
    const [columnas, setColumnas] = useState([]);

    const parseCSV = (archivo) => {
        setArchivoCSV(archivo);

        papa.parse(archivo, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                setDatos(result.data);
                setColumnas(Object.keys(result.data[0] || {}));
            },
            error: (error) => {
                console.error("Error al parsear el CSV:", error);
            },
        });
    }

    const subirCSV = async (tipo) => {
        if(!archivoCSV) {
            console.error("No hay archivo CSV para subir");
            return;
        }

        const formData = new FormData();
        formData.append("archivo", archivoCSV);
        if(tipo) {
            formData.append("tipo", tipo);
        }

        const token = localStorage.getItem("token")

        const respuesta = await fetch("http://localhost:4000/api/upload", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
            }

        })

        if(!respuesta.ok) {
            console.error("Error al subir el archivo CSV:", respuesta.statusText);
            return;
        }
        return await respuesta.json();
    }

    return{
        archivoCSV,
        datos,
        columnas,
        parseCSV,
        subirCSV,
    }
}