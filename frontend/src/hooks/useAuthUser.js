import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthUser() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            navigate("/Login");
            return;
        }

        const verificarToken = async () => {
            try{
                const res = await fetch("http://localhost:4000/api/tokenVerify", {
                    method: "GET",
                    headers: {Authorization: `Bearer ${token}`},
                });

                if(!res.ok){
                    throw new Error("No Autorizado: Token inválido o expirado");
                }

            }catch (error) {
                console.error(" Error de autenticación: ", error);
                navigate("/login");
            }
        };
        verificarToken();
    }, [navigate]);
}