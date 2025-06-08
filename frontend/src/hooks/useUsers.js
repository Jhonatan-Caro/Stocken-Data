import { useState } from "react";

export default function useUsers() {
    const [user, setUser] = useState(null)
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    const fetchUser = async() => {
        try{
            const res = await fetch("http://localhost:4000/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            if (!res.ok) {
                throw new Error("Error al obtener registros");
            }
            const data = await res.json();
            setUser(data);
        }catch (err) {
            console.error(err)
            setError(err.meessage || "Error al obtener el nombre del usuario");
        }
    }

    return {
        user,
        fetchUser,
        error
    }
}