import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export function verifyToken(req, res, next) {
  console.log("Autorization header:", req.headers["authorization"]);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });	
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });	
    }
    req.user = user;
    next();
  });
}