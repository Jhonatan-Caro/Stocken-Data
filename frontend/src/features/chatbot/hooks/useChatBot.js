import { useState, useCallback } from "react";
import { askChatBot } from "../services/chatService";

export default function useChatBot() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChatBot = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { type: "user", text: question };
    setMessages([...messages, userMessage]);
    setLoading(true);

    try {
      const data = await askChatBot(question);
      const botMessage = { type: "bot", text: data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error al consultar el chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Hubo un error al obtener respuesta." },
      ]);
    } finally {
      setQuestion("");
      setLoading(false);
    }
  };

  const openChatBot = useCallback(() => setVisible(true), []);
  const closeChatBot = useCallback(() => setVisible(false), []);

  return {
    visible,
    toggleChatBot,
    openChatBot,
    closeChatBot,
    sendQuestion,
    messages,
    setQuestion,
    question,
    loading,
  };
}
