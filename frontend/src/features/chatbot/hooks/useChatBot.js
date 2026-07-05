import { useState, useCallback } from "react";
import { questionChatBot } from "../services/chatService";

export default function useChatBot() {
  const [visible, setVisible] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);

  const toggleChatBot = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  const enviarPregunta = async () => {
    if (!pregunta.trim()) return;

    const nuevaPregunta = { tipo: "usuario", texto: pregunta };
    setMensajes([...mensajes, nuevaPregunta]);
    setCargando(true);

    try {
      const data = await questionChatBot(pregunta);
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

  const openChatBot = useCallback(() => setVisible(true), []);
  const closeChatBot = useCallback(() => setVisible(false), []);

  return {
    visible,
    toggleChatBot,
    openChatBot,
    closeChatBot,
    enviarPregunta,
    mensajes,
    setPregunta,
    pregunta,
    cargando,
  };
}
