import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import { login } from "../../../api/authApi";

import { login } from "../services/auth.service";

export function useAuth() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const loginUser = async (form) => {
    try {
      const data = await login(form);

      setMessage(data.message || "Login exitoso");

      localStorage.setItem("token", data.token);

      navigate("/dashboard");

      return true;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setMessage("Credenciales incorrectas");
        } else {
          setMessage(
            err.response.data?.message || "Error en el inicio de sesión",
          );
        }
      } else {
        setMessage("No se pudo conectar con el servidor 501");
      }
      return false;
    }
  };

  return { loginUser, message, setMessage };
}
