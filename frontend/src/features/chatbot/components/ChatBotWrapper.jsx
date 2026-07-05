import useChatBot from "../hooks/useChatBot";
import ChatBotComponent from "./ChatBot";

export default function ChatBotWrapper() {
  const { visible, toggleChatBot } = useChatBot();

  return (
    <div>
      <button
        onClick={toggleChatBot}
        className="fixed bottom-6 right-6 bg-custom-verde bg-600 text-custom-blanco p-4 rounded-full shadow-lg hover:bg-custom-azul bg-700 transition-all z-50"
        title={visible ? "Cerrar ChatBot" : "Abrir ChatBot"}
      >
        {visible ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4h9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
          </svg>
        )}
      </button>
      <ChatBotComponent visible={visible} />
    </div>
  );
}
