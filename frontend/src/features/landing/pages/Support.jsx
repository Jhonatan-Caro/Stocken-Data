import Menu from "../components/Menu";
import Footer from "../components/Footer";
import { FiUser, FiMail, FiEdit3 } from "react-icons/fi";

export default function Support() {
  return (
    <div className="bg-gray-50">
      <div className="fixed top-0 left-0 w-full z-50">
        <Menu />
      </div>

      <main className="min-h-screen flex justify-center items-center pt-10">
        <div className="w-full px-10 flex flex-col lg:flex-row gap-10 / lg:px-60 lg:gap-10 text-sm pt-20">
          <div className="w-full lg:w-1/2">
            <h2 className="text-4xl font-bold text-custom-verde pb-4">
              Soporte
            </h2>
            <p className="pb-4">/ Support</p>
            <p className="text-xs">
              ¿Tienes alguna pregunta sobre la aplicación?
            </p>
            <p className="text-xs">
              Escríbela en el formulario y te responderemos lo antes
              posible.&nbsp;&nbsp;
              <span className="font-bold">⭢</span>
            </p>
          </div>

          <form className="w-full lg:w-1/2 space-y-5">
            <div className="flex items-center border-b border-gray-300 py-2">
              <FiUser size={16} className="text-custom-azul mr-2 mb-1" />
              <input
                type="text"
                placeholder="Nombre"
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border-b border-gray-300 py-2">
              <FiUser size={16} className="text-custom-azul mr-2 mb-1" />
              <input
                type="text"
                placeholder="Apellidos"
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center border-b border-gray-300 py-2">
              <FiMail size={16} className="text-custom-azul mr-2" />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full outline-none bg-transparent"
              />
            </div>

            <div className="flex items-start border-b border-gray-300 py-2">
              <FiEdit3 size={16} className="text-custom-azul mr-2 mt-1" />
              <textarea
                placeholder="Escribe tu pregunta..."
                rows="5"
                className="w-full outline-none bg-transparent resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-custom-verde text-white font-medium py-2 rounded-lg hover:bg-custom-azul transition duration-200"
            >
              Enviar&nbsp;&nbsp;<span className="font-bold">⭢</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
