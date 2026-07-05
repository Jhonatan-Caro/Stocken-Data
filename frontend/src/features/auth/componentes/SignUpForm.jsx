import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import InputField from "./InputField";
import { useSignUp } from "../hooks/useSignUp";
import { Link } from "react-router-dom";

export default function SignUpForm() {
  const {
    form,
    errors,
    message,
    status,
    acceptedTerms,
    setAcceptedTerms,
    handleChange,
    handleSubmit,
  } = useSignUp();

  return (
    <form onSubmit={handleSubmit} className="text-sm w-full max-w-md space-y-6">
      <h2 className="text-2xl font-semibold text-custom-azul">
        Registro de Usuario
      </h2>
      <InputField
        icon={<FaUser className="text-gray-500 mr-2" />}
        name="name"
        type="text"
        placeholder="Nombre completo"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />
      <InputField
        icon={<MdEmail className="text-gray-500 mr-2" />}
        name="email"
        type="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
      />
      <InputField
        icon={<RiLockPasswordLine className="text-gray-500 mr-2" />}
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
      />
      <InputField
        icon={<RiLockPasswordLine className="text-gray-500 mr-2" />}
        name="confirmPassword"
        type="password"
        placeholder="Confirmar contraseña"
        value={form.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

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
          Acepto los{" "}
          <a href="#" className="text-custom-azul hover:underline">
            términos y condiciones
          </a>
        </label>
      </div>

      {/* Botón de registro */}
      <button
        type="submit"
        disabled={
          !acceptedTerms ||
          Object.values(form).some((v) => !v) ||
          Object.values(errors).some((e) => e)
        }
        className={`w-full bg-custom-gray text-custom-blanco py-2 rounded-md transition ${
          !acceptedTerms
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-custom-verde hover:bg-custom-azul text-custom-blanco py-2 rounded-md"
        }`}
      >
        Registrarse
      </button>

      {/* Mensaje de error o éxito */}
      <div>
        {message && (
          <p
            className={`text-center mt-4 ${
              status === 201 ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Enlace a login */}
      <p className="text-center text-gray-500">
        ¿Ya tienes una cuenta?&nbsp;&nbsp;
        <Link to="/Login" className="text-custom-azul hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
