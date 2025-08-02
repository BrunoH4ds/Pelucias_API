import express from "express";
import { uploadNoticias } from "../config/multer.js";
import {
  getNoticias,
  createNoticia,
  updateNoticia,
  deleteNoticia,
  getNoticiaById,
} from "../controllers/noticiacontroller.js";
import { autenticarToken } from "../config/middleware/auth.js";

const router = express.Router();

router.get("/", getNoticias);             
router.get("/:id", getNoticiaById);        
router.post("/",autenticarToken, uploadNoticias.single("imagem"), createNoticia); 
router.put("/:id",autenticarToken, uploadNoticias.single("imagem"), updateNoticia); 
router.delete("/:id",autenticarToken, deleteNoticia);      

export default router;
