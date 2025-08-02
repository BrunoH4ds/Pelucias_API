import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { serialize } from "cookie";

import {
  findAll,
  insertOne,
  updateOne,
  deleteOne,
  findByUsername,
  findById,
} from "../models/adminmodel.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Validação com Joi
const adminSchema = Joi.object({
  username: Joi.string().min(3).required(),
  senha: Joi.string().min(6).required(),
});

async function getAdmins(req, res) {
  try {
    const admins = await findAll();
    res.status(200).json(admins);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar administradores" });
  }
}

async function getadminByUsername(req, res) {
  try {
    const username = req.params.username;

    if (!username) {
      return res.status(400).json({ erro: "Username inválido" });
    }

    const admin = await findByUsername(username);
    if (!admin) {
      return res.status(404).json({ erro: "Administrador não encontrado" });
    }

    res.status(200).json(admin);
  } catch {
    res.status(500).json({ erro: "Erro ao buscar administrador" });
  }
}

async function createadmin(req, res) {
  try {
    const { username, senha } = req.body;

    const { error } = adminSchema.validate({ username, senha });
    if (error) {
      return res.status(400).json({ erro: error.details[0].message });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const admin = { username, senha: senhaHash };
    const result = await insertOne(admin);

    res.status(201).json({
      mensagem: "Administrador criado com sucesso",
      id: result.insertedId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar administrador" });
  }
}

async function updateadmin(req, res) {
  try {
    const id = req.params.id;
    const adminExistente = await findById(id);
    if (!adminExistente)
      return res.status(404).json({ erro: "Administrador não encontrado" });

    const updateData = req.body;

    if (updateData.senha) {
      updateData.senha = await bcrypt.hash(updateData.senha, 10);
    }

    await updateOne(id, updateData);
    res.json({ mensagem: "Administrador atualizado com sucesso" });
  } catch {
    res.status(500).json({ erro: "Erro ao atualizar administrador" });
  }
}

async function deleteadmin(req, res) {
  try {
    const id = req.params.id;
    const admin = await findById(id);

    if (!admin) return res.status(404).json({ erro: "Administrador não encontrado" });

    await deleteOne(id);
    res.json({ mensagem: "Administrador deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar administrador:", err);
    res.status(500).json({ erro: "Erro ao deletar administrador" });
  }
}

// 🔐 Rota de login
async function login(req, res) {
  try {
    const { username, senha } = req.body;

    if (!username || !senha) {
      return res.status(400).json({ erro: "Usuário e senha obrigatórios" });
    }

    const admin = await findByUsername(username);
    if (!admin) return res.status(401).json({ erro: "Credenciais inválidas" });

    const senhaValida = await bcrypt.compare(senha, admin.senha);
    if (!senhaValida) return res.status(401).json({ erro: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const cookieHeader = serialize("adminToken", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60, // 1 hora em segundos
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.setHeader("Set-Cookie", cookieHeader);
    res.json({ token, cookieHeader });
    console.log("Admin encontrado:", admin);
    console.log(cookieHeader);
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro ao realizar login" });
  }
}

export {
  getAdmins,
  getadminByUsername,
  createadmin,
  updateadmin,
  deleteadmin,
  login
};
