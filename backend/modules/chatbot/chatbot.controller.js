export async function chat(req, res) {
  const usuario_id = req.user.id;
  const { question } = req.body;

  try {
    const chatbotUrl = process.env.CHATBOT_URL || "http://chatbot_service:8000";
    const response = await fetch(`${chatbotUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, usuario_id }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en la solicitud al ChatBot");
    }

    res.status(200).json({ respuesta: data.respuesta });
  } catch (error) {
    console.error("Error al procesar la solicitud del ChatBot:", error);
    res.status(500).json({ message: "Error al procesar la solicitud del ChatBot" });
  }
}
