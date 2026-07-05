import { useState } from "react"
import { MdEmail } from "react-icons/md"
import { RiLockPasswordLine } from "react-icons/ri"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function LoginForm(){
    const [form, setForm] = useState({ email: "", password: "" })
    const { loginUser, message } = useAuth()

    const handleChange = (e) => 
        setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        await loginUser(form)
    }

    return (
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
    )
}

