// controllers/produtocontroller.js
import {
  findAll,
  insertOne,
  updateOne,
  deleteOne,
  findById,
} from "../models/produtomodel.js";
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

// Função auxiliar para gerar a URL da imagem
function getImageUrl(req, relativePath) {
  const baseURL = `${req.protocol}://${req.get("host")}`;
  return `${baseURL}/${relativePath.replace(/\\/g, "/")}`;
}

// Função auxiliar que monta o objeto 'especificacoes' e o objeto produto completo
function montarProduto(req) {
  const {
    nome,
    descricao,
    nota,
    precoBase,
    precoPromocional,
    contato,
    destaque,
    especificacoes: outrasEspecificacoes = {},
  } = req.body;

  const especificacoes = {
    destaque,
    ...outrasEspecificacoes,
  };

  return {
    nome,
    descricao,
    nota: parseFloat(nota),
    precoBase: parseFloat(precoBase),
    precoPromocional: parseFloat(precoPromocional),
    contato,
    especificacoes,
  };
}

// Função auxiliar para lidar com upload de imagem (retorna o URL e remove antiga se necessário)
function tratarImagem(req, produtoExistente) {
  if (!req.file) return null;

  // Remove imagem antiga
  if (produtoExistente?.imagem) {
    const oldPath = path.join(
      process.cwd(),
      "uploads",
      "produtos",
      produtoExistente.imagem.split("/produtos/")[1]
    );
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  // Gera URL da nova imagem
  const relativePath = path.join("uploads", "produtos", req.file.filename);
  return getImageUrl(req, relativePath);
}

// Buscar todos os produtos
async function getProdutos(req, res) {
  try {
    const produtos = await findAll();
    res.status(200).json(produtos);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
}

// Buscar produto por ID
async function getProdutoById(req, res) {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const produto = await findById(id);
    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(produto);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar produto" });
  }
}

// Criar novo produto
async function createProduto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Imagem obrigatória" });
    }

    const produto = montarProduto(req);

    const imagemUrl = tratarImagem(req, null);
    if (imagemUrl) produto.imagem = imagemUrl;

    const result = await insertOne(produto);
    res.status(201).json({ mensagem: "Produto criado", id: result.insertedId, imagemUrl });
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    res.status(500).json({ erro: "Erro ao inserir produto" });
  }
}

// Atualizar produto existente
async function updateProduto(req, res) {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const produtoExistente = await findById(id);
    if (!produtoExistente) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const updateData = montarProduto(req);

    const imagemUrl = tratarImagem(req, produtoExistente);
    if (imagemUrl) updateData.imagem = imagemUrl;

    const result = await updateOne(id, updateData);
    if (result.matchedCount === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json({ mensagem: "Produto atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ erro: "Erro ao atualizar produto" });
  }
}

// Deletar produto
async function deleteProduto(req, res) {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const produto = await findById(id);
    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    if (produto.imagem) {
      const url = new URL(produto.imagem);
      const caminhoRelativo = decodeURIComponent(url.pathname);
      const caminhoFisico = path.join(process.cwd(), caminhoRelativo.replace(/^\/+/, ""));

      if (fs.existsSync(caminhoFisico)) {
        fs.unlinkSync(caminhoFisico);
      }
    }

    await deleteOne(id);
    res.json({ mensagem: "Produto deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar produto:", err);
    res.status(500).json({ erro: "Erro ao deletar produto" });
  }
}

export {
  getProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto,
};
