export async function questionChatBot(pregunta) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:4000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question: pregunta }),
    });

    if (!response.ok) {
      throw new Error("Error al consultar el chatbot");
    }

    return response.json();
  } catch (error) {
    console.error("Error en chatService:", error);
    throw error;
  }
}