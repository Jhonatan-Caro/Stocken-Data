// Página donde el usuario deberá iniciar sesión.

// Importaciones necesarias
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Importación Visuales
import validation from "../../assets/validacion/validation.jpg";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";

// Importación de redirección
import { Link } from "react-router-dom";

// Componente de inicio de sesión
export default function Login() {

    // Estados para manejar el formulario y mensajes
    const [form, setForm] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación del formulario
    try {
        const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
        });

        const data = await res.json();
        setMessage(data.message || "Login exitoso");

        if (res.ok) {
        // Aquí podrías guardar un token, redirigir, etc.
        localStorage.setItem("token", data.token); // Guardar el token en localStorage
        navigate("/dashboard");
        setForm({ email: "", password: "" });
        }
    } catch (err) {
        setMessage("Error al conectar con el servidor");
    }
    };    
    
    return (
        <main className="min-h-screen flex flex-col lg:flex-row">
            {/* Lado izquierdo con imagen de fondo */}
            <div className="relative overflow-hidden w-full lg:w-1/2 h-64 lg:h-auto">
            {/* Imagen de fondo desenfocada */}
            <div
            className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
            style={{ backgroundImage: `url(${validation})` }}
            />

            {/* Contenido superpuesto */}
            <div className="relative z-10 flex flex-col justify-center items-center text-white px-6 py-10 lg:p-10 h-full text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-custom-blanco">
                Inicia sesión en tu cuenta
            </h1>
            <p className="text-gray-200">
                Explora las funciones principales de nuestra plataforma&nbsp;&nbsp;
                <span className="font-bold">⭢</span>
            </p>
            </div>
        </div>

        {/* Lado derecho con el formulario */}
        <div className="pt-20 w-full lg:w-1/2 flex items-center justify-center px-10 lg:px-0 lg:bg-custom-blanco lg:pt-0">
            <form onSubmit={handleSubmit} className="text-sm w-full max-w-md space-y-6">
            <h2 className="text-2xl font-semibold text-custom-azul">Inicio de Sesión</h2>
                {/* Email */}
                <div>
                    <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 px-3">
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
                </div>

                {/* Contraseña */}
                <div>
                    <div className="mt-1 flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 px-3">
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
                </div>
                
                {/* Botón de inicio */}
                <button
                    type="submit"
                    className="w-full bg-custom-verde hover:bg-custom-azul text-custom-blanco py-2 rounded-md transition">
                    Iniciar sesión
                </button>
                
                {/* Mensaje de error o éxito */}
                <div>
                    {message && (
                        <p className="text-center text-red-500 mt-4">
                            {message}
                        </p>
                    )}
                </div>
                
                {/* Enlace a registro */}
                <p className="text-center text-gray-500">¿No tienes una cuenta?&nbsp;&nbsp;
                    <Link to="/Register" className="text-custom-azul hover:underline">
                        Regístrate
                    </Link>
                </p>
            </form>
        </div>
    </main>
    );
}