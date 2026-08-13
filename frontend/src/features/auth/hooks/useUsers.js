import { useState } from "react";
import httpClient from "../../../services/httpClient";

export default function useUsers() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        try {
            const { data } = await httpClient.get("/user");
            setUser(data);
        } catch (err) {
            console.error(err);
            setError("Error al obtener el nombre del usuario");
        }
    };

    return { user, fetchUser, error };
}
