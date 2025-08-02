import {
  findAll,
  insertOne,
  updateOne,
  deleteOne,
  findById,
} from "../models/noticiamodel.js";
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

// Monta o objeto notícia com base no req.body
function montarNoticia(req) {
  const { titulo, descricao } = req.body;
  return { titulo, descricao };
}

// Gera URL da imagem e remove imagem antiga se existir
function tratarImagemNoticia(req, noticiaExistente) {
  if (!req.file) return null;

  if (noticiaExistente?.imagemUrl) {
    const oldPath = path.join(
      process.cwd(),
      "uploads",
      "noticias",
      noticiaExistente.imagemUrl.split("/noticias/")[1]
    );
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const relativePath = path.join("uploads", "noticias", req.file.filename);
  const baseURL = `${req.protocol}://${req.get("host")}`;
  return `${baseURL}/${relativePath.replace(/\\/g, "/")}`;
}

async function getNoticias(req, res) {
  try {
    const noticias = await findAll();
    res.status(200).json(noticias);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar notícias" });
  }
}

async function getNoticiaById(req, res) {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const noticia = await findById(id);
    if (!noticia) {
      return res.status(404).json({ erro: "Notícia não encontrada" });
    }

    res.json(noticia);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar notícia" });
  }
}

async function createNoticia(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Imagem obrigatória" });
    }

    const noticia = montarNoticia(req);

    const imagemUrl = tratarImagemNoticia(req, null);
    if (imagemUrl) noticia.imagemUrl = imagemUrl;

    const result = await insertOne(noticia);

    res
      .status(201)
      .json({ mensagem: "Notícia criada", id: result.insertedId, imagemUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao inserir notícia" });
  }
}

async function updateNoticia(req, res) {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const noticiaExistente = await findById(id);
    if (!noticiaExistente) {
      return res.status(404).json({ erro: "Notícia não encontrada" });
    }

    const updateData = montarNoticia(req);

    const imagemUrl = tratarImagemNoticia(req, noticiaExistente);
    if (imagemUrl) updateData.imagemUrl = imagemUrl;

    await updateOne(id, updateData);

    res.json({ mensagem: "Notícia atualizada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar notícia" });
  }
}

async function deleteNoticia(req, res) {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ erro: "ID inválido" });

    const noticia = await findById(id);
    if (!noticia) return res.status(404).json({ erro: "Notícia não encontrada" });

    if (noticia.imagemUrl) {
      const url = new URL(noticia.imagemUrl);
      const caminhoRelativo = decodeURIComponent(url.pathname);
      const caminhoFisico = path.join(process.cwd(), caminhoRelativo.replace(/^\/+/, ""));

      if (fs.existsSync(caminhoFisico)) {
        fs.unlinkSync(caminhoFisico);
      }
    }

    await deleteOne(id);
    res.json({ mensagem: "Notícia deletada com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar notícia:", err);
    res.status(500).json({ erro: "Erro ao deletar notícia" });
  }
}

export { getNoticias, createNoticia, updateNoticia, deleteNoticia, getNoticiaById };
