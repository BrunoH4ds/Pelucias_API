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

const SECRET_ACCESS = process.env.SECRET_ACCESS;
const SECRET_REFRESH = process.env.SECRET_REFRESH;
const IS_PROD = process.env.NODE_ENV === "production";

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, SECRET_ACCESS, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, SECRET_REFRESH, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

function setRefreshCookie(res, refreshToken) {
  const cookie = serialize("refreshToken", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  res.setHeader("Set-Cookie", cookie);
}

function clearRefreshCookie(res) {
  const cookie = serialize("refreshToken", "", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });
  res.setHeader("Set-Cookie", cookie);
}

const adminSchema = Joi.object({
  username: Joi.string().min(3).required(),
  senha: Joi.string().min(6).required(),
});

// CRUD
async function getAdmins(req, res) { try { res.json(await findAll()); } catch { res.status(500).json({ erro: "Erro ao buscar administradores" }); } }
async function getadminByUsername(req, res) { try { const admin = await findByUsername(req.params.username); if (!admin) return res.status(404).json({ erro: "Administrador não encontrado" }); res.json(admin); } catch { res.status(500).json({ erro: "Erro ao buscar administrador" }); } }
async function createadmin(req, res) { try { const { username, senha } = req.body; const { error } = adminSchema.validate({ username, senha }); if (error) return res.status(400).json({ erro: error.details[0].message }); const senhaHash = await bcrypt.hash(senha, 10); const result = await insertOne({ username, senha: senhaHash }); res.status(201).json({ mensagem: "Administrador criado com sucesso", id: result.insertedId }); } catch (err) { res.status(500).json({ erro: "Erro ao criar administrador" }); } }
async function updateadmin(req, res) { try { const adminExistente = await findById(req.params.id); if (!adminExistente) return res.status(404).json({ erro: "Administrador não encontrado" }); const updateData = req.body; if (updateData.senha) updateData.senha = await bcrypt.hash(updateData.senha, 10); await updateOne(req.params.id, updateData); res.json({ mensagem: "Administrador atualizado com sucesso" }); } catch { res.status(500).json({ erro: "Erro ao atualizar administrador" }); } }
async function deleteadmin(req, res) { 
  try { 
    const admin = await findById(req.params.id); 
    if (!admin) return res.status(404).json({ erro: "Administrador não encontrado" }); 
    
    // Check if this is the last admin
    const allAdmins = await findAll();
    if (allAdmins.length <= 1) {
      return res.status(400).json({ erro: "Não é possível deletar o último administrador" });
    }
    
    await deleteOne(req.params.id); 
    res.json({ mensagem: "Administrador deletado com sucesso" }); 
  } catch { 
    res.status(500).json({ erro: "Erro ao deletar administrador" }); 
  } 
}

// LOGIN / REFRESH / LOGOUT
async function login(req, res) {
  try {
    const { username, senha } = req.body;
    if (!username || !senha) return res.status(400).json({ erro: "Usuário e senha obrigatórios" });
    const admin = await findByUsername(username);
    if (!admin) return res.status(401).json({ erro: "Credenciais inválidas" });
    const valid = await bcrypt.compare(senha, admin.senha);
    if (!valid) return res.status(401).json({ erro: "Credenciais inválidas" });

    const { accessToken, refreshToken } = generateTokens(admin._id.toString());
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken, user: { id: admin._id, username: admin.username } });
  } catch { res.status(500).json({ erro: "Erro ao realizar login" }); }
}

async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ erro: "Sem refresh token" });
    let payload;
    try { payload = jwt.verify(refreshToken, SECRET_REFRESH); } catch { return res.status(401).json({ erro: "Refresh inválido" }); }
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload.userId);
    setRefreshCookie(res, newRefresh);
    res.json({ accessToken });
  } catch { res.status(500).json({ erro: "Erro ao renovar token" }); }
}

async function logout(req, res) { try { clearRefreshCookie(res); res.json({ message: "Logout realizado" }); } catch { res.status(500).json({ erro: "Erro ao realizar logout" }); } }

export { getAdmins, getadminByUsername, createadmin, updateadmin, deleteadmin, login, refresh, logout };
