import { useState } from "react";
import {motion, AnimatePresence} from "framer-motion";
import useChatBot from "../hooks/useChatBot";

export default function ChatBotComponent({visible}) {
  const { sendQuestion, messages, setQuestion, question, loading } = useChatBot();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendQuestion();
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
          className="
            fixed bottom-24 right-2
            w-[95%] max-w-sm
            sm:w-[28rem] sm:right-4 sm:max-w-md
            md:w-[32rem] md:max-w-lg
            bg-white border border-black rounded-lg shadow-lg
            flex flex-col z-50"
          >
            <div className="pt-2 pb-2 px-4 overflow-y-auto flex-grow space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[400px]">
              {messages.map((msg, idx) => (
                <div
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    key={idx}
                    className={`px-4 py-2 rounded-lg text-sm inline-block max-w-[80%] break-words ${
                      msg.type === "user"
                        ? "bg-custom-verde text-white ml-auto"
                        : "bg-gray-200 text-gray-800 mr-auto"
                    }`}
                  >
                    {typeof msg.text === "string"
                      ? msg.text
                      : JSON.stringify(msg.text, null, 2)}
                  </div>
                </div>
              ))}
              {loading && <div className="italic text-black-500 text-sm">⏳ Pensando...</div>}
            </div>
            <div className="flex border-t border-200 m-1">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                className="flex-1 bg-gray-100 p-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-custom-verde transition-all"
              />
              <button onClick={sendQuestion} className="bg-custom-verde bg-500 rounded-lg text-white px-4 py-2 text-sm hover:bg-custom-azul bg-600 transition-colors">
                Enviar
              </button>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
