import crypto from "crypto";

const serviceToken = process.env.SERVICE_TOKEN;

export function verifyServiceToken(req, res, next) {
  const provided = req.headers["x-service-token"];
  if (!serviceToken || !provided) {
    return res.status(401).json({ message: "Falta el token de servicio" });
  }
  // Comparación segura de tokens para prevenir ataques de temporización
  const a = Buffer.from(provided);
  const b = Buffer.from(serviceToken);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ message: "Token de servicio inválido" });
  }
  next();
}