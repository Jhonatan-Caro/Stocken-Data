import httpClient from "../../../services/httpClient";

export async function askChatBot(question) {
  try {
    const { data } = await httpClient.post("/chat", { ask: question });
    return data;
  } catch (error) {
    console.error("Error en chatService:", error);
    throw error;
  }
}
