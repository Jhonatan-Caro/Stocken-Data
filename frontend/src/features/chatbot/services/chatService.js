import httpClient from "../../../services/httpClient";

export async function questionChatBot(pregunta) {
  try {
    const { data } = await httpClient.post("/chat", { question: pregunta });
    return data;
  } catch (error) {
    console.error("Error en chatService:", error);
    throw error;
  }
}
