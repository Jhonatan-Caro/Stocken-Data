import { useState } from "react";
import { validateField } from "../utils/validation";
import { register } from "../services/auth.service";

export function useSignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, { ...form, [name]: value }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setStatus(0);
    const hasErrors = Object.values(errors).some((message) => message !== "");
    if (hasErrors) {
      setMessage(
        "Por favor, corrige los errores antes de enviar el formulario",
      );
      return;
    }

    try {
      const data = await register(form);
      setMessage(data.message);
      setStatus(201);
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setAcceptedTerms(false);
    } catch (err) {
      setMessage("Error al conectarse con el servidor");
      setStatus(500);
    }
  };

  return {
    useState,
    form,
    errors,
    message,
    status,
    acceptedTerms,
    setAcceptedTerms,
    handleChange,
    handleSubmit,
  };
}
