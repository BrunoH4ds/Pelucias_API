// config/middleware/auth.js
import jwt from "jsonwebtoken";

const SECRET_ACCESS = process.env.SECRET_ACCESS;

export function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: "Token ausente" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Token inválido" });

  try {
    const decoded = jwt.verify(token, SECRET_ACCESS);
    req.auth = { userId: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ erro: "Token expirado ou inválido" });
  }
}
