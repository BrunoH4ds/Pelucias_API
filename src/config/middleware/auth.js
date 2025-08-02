import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) return res.status(401).json({ erro: "Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ erro: "Token inválido ou expirado" });
    req.usuario = usuario;
    next();
  });
}
