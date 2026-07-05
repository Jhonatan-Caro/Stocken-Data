import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../services/auth.service";

export default function useAuthUser() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        await verifyToken();
      } catch (error) {
        console.error("Error de autenticacion ", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);
}
