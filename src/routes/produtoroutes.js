import express from "express";
import { uploadProdutos } from "../config/multer.js";
import {
  getProdutos,
  createProduto,
  updateProduto,
  deleteProduto,
  getProdutoById,
} from "../controllers/produtocontroller.js";
import { autenticarToken } from "../config/middleware/auth.js";

const router = express.Router();

router.get("/", getProdutos);
router.get("/:id", getProdutoById);
router.post("/",autenticarToken, uploadProdutos.single("imagem"), createProduto);
router.put("/:id",autenticarToken, uploadProdutos.single("imagem"), updateProduto);
router.delete("/:id",autenticarToken, deleteProduto);

export default router;
