// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connect } from "./config/connect.js";
import adminRoutes from "./routes/adminroutes.js";
import produtoRoutes from "./routes/produtoroutes.js";
import noticiaRoutes from "./routes/noticiaroutes.js";
import { corsConfig, checkApiKey } from "./config/cors.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ ...corsConfig, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkApiKey); // habilitar se quiser proteção por API key
app.use("/uploads", express.static("uploads"));

// Rotas
app.use("/admins", adminRoutes);
app.use("/produtos", produtoRoutes);
app.use("/noticias", noticiaRoutes);

// Teste raiz
app.get("/", (req, res) => {
  res.send("Endpoints disponíveis: /produtos, /noticias e /admins");
});

// Conexão com banco
connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar no banco:", err);
  });
