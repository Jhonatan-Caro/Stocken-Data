import jwt from "jsonwebtoken";

export async function chat(req, res) {
  const user_id = req.user.id;
  const tenant_id = req.user.tenant_id;
  const { ask } = req.body;

  try {
    const chatbotUrl = process.env.CHATBOT_URL || "http://chatbot_service:8000";
    // El aislamiento viaja en el token firmado (tid = tenant_id), que el
    // chatbot_service reenvía tal cual como x-user-token. user_id sigue en el
    // body solo para satisfacer el contrato del servicio Python (es decorativo:
    // el backend interno resuelve el tenant desde el token, no del body).
    const userToken = jwt.sign({ tid: tenant_id }, process.env.SECRET_KEY, {
      expiresIn: "2m",
    });
    const response = await fetch(`${chatbotUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ask, user_id, user_token: userToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en la solicitud al ChatBot");
    }

    res.status(200).json({ answer: data.respuesta });
  } catch (error) {
    console.error("Error al procesar la solicitud del ChatBot:", error);
    res.status(500).json({ message: "Error al procesar la solicitud del ChatBot" });
  }
}
