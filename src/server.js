import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connect } from "./config/connect.js";
import adminRoutes from "./routes/adminroutes.js"
import produtoRoutes from "./routes/produtoroutes.js";
import noticiaRoutes from "./routes/noticiaroutes.js";
import { corsConfig, checkApiKey } from "./config/cors.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(corsConfig));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(checkApiKey); // habilitar se quiser proteção por API key

app.use("/admins", adminRoutes)
app.use("/produtos", produtoRoutes);
app.use("/noticias", noticiaRoutes);

app.get("/", (req, res) => {
  res.send("Endpoints disponíveis: /produtos, /noticias e /admins");
});

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar no banco:", err);
  });
