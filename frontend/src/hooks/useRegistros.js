import { useState } from "react";

export function useRegistros() {
    const [registros, setRegistros] = useState([]);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    const fetchRegistros = async (categoriaId) => {
        try {
            const res = await fetch(`http://localhost:4000/api/registros?categoriaId=${categoriaId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error("Error al obtener registros");
            }
            const data = await res.json();
            setRegistros(data);
            return data;
        } catch (err) {
            console.error(err)
            setError(err.meessage || "Error al obtener registros");
        }
    };  

    const removeRegistros = (registroId) => {
        setRegistros((prev) => prev.filter((registro) => registro.id !== registroId));
    }
    return {
        registros,
        fetchRegistros,
        error,
        removeRegistros
    };
}