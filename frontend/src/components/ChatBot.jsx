import { useState } from "react";
import {motion, AnimatePresence} from "framer-motion";

export default function ChatBotComponent({visible}) {
  
  // Manejo de estados del ChatBot
  const [mensajes, setMensajes] = useState([]); // historial de chat
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviarPregunta = async () => {
    if (!pregunta.trim()) return;

    const nuevaPregunta = { tipo: "usuario", texto: pregunta };
    setMensajes([...mensajes, nuevaPregunta]);
    setCargando(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: pregunta}),
      });

      const data = await response.json();
      const respuestaBot = { tipo: "bot", texto: data.respuesta };

      setMensajes((prev) => [...prev, respuestaBot]);
    } catch (error) {
      console.error("Error al consultar el chatbot:", error);
      setMensajes((prev) => [
        ...prev,
        { tipo: "bot", texto: "Hubo un error al obtener respuesta." },
      ]);
    } finally {
      setPregunta("");
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") enviarPregunta();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chatBot"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-24 right-4 w-80 max-h-[500px] bg-white border border-black rounded-lg shadow-lg flex flex-col z-50">
            <div className="p-3 overflow-y-auto flex-grow space-y-2">
              {mensajes.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] px-4 py-2 rounded-lg text-sm ${
                    msg.tipo === "usuario"
                      ? "bg-custom-verde bg-100 self-end text-left text-white ml-auto"
                      : "bg-gray-200 self-start text-left mr-auto"
                  }`}
                >
                  {typeof msg.texto === "string"
                    ? msg.texto
                    : JSON.stringify(msg.texto, null, 2)}
                </div>
              ))}
              {cargando && <div className="italic text-black-500 text-sm">⏳ Pensando...</div>}
            </div>
            <div className="flex border-t border-200 m-1">
              <input
                type="text"
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                className="flex-1 bg-white p-2 text-sm rounded-lg outline-none"
              />
              <button onClick={enviarPregunta} className="bg-custom-verde bg-500 rounded-lg text-white px-4 py-2 text-sm hover:bg-custom-azul bg-600 transition-colors">
                Enviar
              </button>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
