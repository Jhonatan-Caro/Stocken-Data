import validation from "../../../assets/validacion/validation.jpg"
import LoginForm from "../components/LoginForm"

export default function LoginPage(){
    return (
        <main className="min-h-screen flex flex-col lg:flex-row">
            <div className="relative overflow-hidden w-full lg:w-1/2 h-64 lg:h-auto">
                <div
                className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
                style={{ backgroundImage: `url(${validation})` }}
                />

                <div className="relative z-10 flex flex-col justify-center items-center text-white px-6 py-10 lg:p-10 h-full text-center">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-custom-blanco">
                    Stocken Data
                </h1>
                <img></img>
                <p className="text-gray-200">
                    Explora las funciones principales de la plataforma y descubre cómo puede ayudarte a optimizar la gestión de tu negocio.
                </p>
                </div>
            </div>

            {/* Lado derecho con el formulario */}
            <div className="pt-20 w-full lg:w-1/2 flex items-center justify-center px-10 lg:px-0 lg:bg-custom-blanco lg:pt-0">
                <LoginForm />
            </div>
        </main>
    )
}