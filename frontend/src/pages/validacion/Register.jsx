// Página donde el usuario podrá registrarse en la web.

//Importaciones necesarias
import {  useState } from "react";

// Importaciones Visuales
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import validation from "../../assets/validacion/validation.jpg";

// Importación de redirección
import { Link } from "react-router-dom";

export default function SignUp() {
  
  // Estados para manejar el formulario y mensajes
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // Función para manejar los valores en el formulario
  const validateForm = (campo, valor) => {
    switch (campo) {
      case "name":
        return valor.trim() === "" ? "El nombre es obligatorio" : "";
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) ? "El correo electrónico no es válido" : "";
      case "password":
        return valor.length < 6 ? "La contraseña debe tener al menos 6 caracteres" : "";
      case "confirmPassword":
        return valor !== form.password ? "Las contraseñas no coinciden" : "";
      default:
        return "";
    }
  };

  // Función para manejar los cambios en los campos del formulario
  // Esta función actualiza el estado del formulario y valida el campo modificado
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    const errores = validateForm(e.target.name, e.target.value);
    setErrors((prev) => ({ ...prev, [e.target.name]: errores }));

    //setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de errores antes de enviar el formulario
    setMessage(""); // Limpiar mensajes previos
    setStatus(0);
    const hasErrors = Object.values(errors).some((message) => message !== "");
    if (hasErrors) {
      setMessage("Por favor, corrige los errores antes de enviar el formulario");
      return;
    }

    // Validación del formulario
    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setForm({ name: "", email: "", password: "", confirmPassword: "" });
        setAcceptedTerms(false);
        setStatus(201);
      }
    } catch (err) {
      setMessage("Error al conectarse con el servidor");
      setStatus(500);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Lado izquierdo con imagen de fondo */}
      <div className="relative overflow-hidden w-full lg:w-1/2 h-64 lg:h-auto">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
          style={{ backgroundImage: `url(${validation})` }}
        />
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-6 py-10 lg:p-10 h-full text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-custom-blanco">
            Crea tu cuenta
          </h1>
          <p className="text-gray-200">
            Únete y comienza a disfrutar de nuestras funcionalidades&nbsp;&nbsp;
            <span className="font-bold">⭢</span>
          </p>
        </div>
      </div>

      {/* Lado derecho con el formulario */}
      <div className="pt-20 w-full lg:w-1/2 flex items-center justify-center px-10 lg:px-0 lg:bg-custom-blanco lg:pt-0">
        <form onSubmit={handleSubmit} className="text-sm w-full max-w-md space-y-6">
          <h2 className="text-2xl font-semibold text-custom-azul">
            Registro de Usuario
          </h2>

          {/* Nombre */}
          <div>
            <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm px-3 focus-within:ring-2 focus-within:ring-indigo-500">
              <FaUser className="text-gray-500 mr-2" />
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre completo"
                className="w-full py-2 outline-none"
                required
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm px-3 focus-within:ring-2 focus-within:ring-indigo-500">
              <MdEmail className="text-gray-500 mr-2" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                className="w-full py-2 outline-none"
                required
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm px-3 focus-within:ring-2 focus-within:ring-indigo-500">
              <RiLockPasswordLine className="text-gray-500 mr-2" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="w-full py-2 outline-none"
                required
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm px-3 focus-within:ring-2 focus-within:ring-indigo-500">
              <RiLockPasswordLine className="text-gray-500 mr-2" />
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                className="w-full py-2 outline-none"
                required
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Aceptar términos */}
          <div className="flex items-center">
            <input
              type="checkbox" 
              id="terms"
              className="mr-2"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="text-gray-600">
              Acepto los <a href="#" className="text-custom-azul hover:underline">términos y condiciones</a>
            </label>
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={!acceptedTerms || Object.values(form).some((v) => !v) || Object.values(errors).some((e) => e)}
            className={`w-full bg-custom-gray text-custom-blanco py-2 rounded-md transition ${
              !acceptedTerms ? "bg-gray-400 cursor-not-allowed" : "bg-custom-verde hover:bg-custom-azul text-custom-blanco py-2 rounded-md"
            }`}
          >
            Registrarse
          </button>
          
          {/* Mensaje de error o éxito */}
          <div>
            {message && (
              <p
                className={`text-center mt-4 ${
                  status === 201 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {message}
              </p>
            )}
          </div>

            {/* Enlace a login */}
            <p className="text-center text-gray-500">¿Ya tienes una cuenta?&nbsp;&nbsp;
                <Link to="/Login" className="text-custom-azul hover:underline">
                    Inicia sesión
                </Link>
            </p>
        </form>
      </div>
    </main>
  );
}