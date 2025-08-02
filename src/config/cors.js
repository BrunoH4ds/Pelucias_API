import dotenv from "dotenv";

dotenv.config();
const allowedOrigins = process.env.UNLOCKED_URL;
const API_KEY = process.env.API_KEY;

const corsConfig = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origem não permitida pelo CORS"));
    }
  },
  credentials: true,
};

function checkApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key && key === API_KEY) {
    next();
  } else {
    res.status(401).json({ erro: "Acesso negado. API key inválida." });
  }
}

export { corsConfig, checkApiKey };
