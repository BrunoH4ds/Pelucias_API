// src/config/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Garante que a pasta exista
const produtosPath = path.join("uploads", "produtos");
if (!fs.existsSync(produtosPath)) fs.mkdirSync(produtosPath, { recursive: true });

const storageProdutos = multer.diskStorage({
  destination: (req, file, cb) => cb(null, produtosPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const uploadProdutos = multer({ storage: storageProdutos });

const noticiasPath = path.join("uploads", "noticias");
if (!fs.existsSync(noticiasPath)) fs.mkdirSync(noticiasPath, { recursive: true });

const storageNoticias = multer.diskStorage({
  destination: (req, file, cb) => cb(null, noticiasPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const uploadNoticias = multer({ storage: storageNoticias });

export { uploadProdutos, uploadNoticias };
