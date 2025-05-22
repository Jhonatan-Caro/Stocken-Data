import { useState, useEffect } from "react";

export function useCategorias() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    const fetchCategorias = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:4000/api/categorias", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setCategorias(Array.isArray(data) ? data : [data]);
        } catch (err) {
            setError("Error al obtener categorías");
        } finally {
            setLoading(false);
        }
    };

    const crearCategoria = async ({ nombre, descripcion }) => {
        try {
            const res = await fetch("http://localhost:4000/api/categorias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nombre, descripcion }),
            });

            const nuevaCategoria = await res.json();
            setCategorias(prev => [...prev, nuevaCategoria]);
            return nuevaCategoria;
        } catch (err) {
            setError("Error al crear categoría");
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    return {
        categorias,
        loading,
        error,
        fetchCategorias,
        crearCategoria,
    };
}