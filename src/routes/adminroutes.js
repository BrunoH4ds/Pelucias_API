// routes/adminroutes.js
import express from "express";
import {
  getAdmins,
  getadminByUsername,
  createadmin,
  updateadmin,
  deleteadmin,
  login,
  refresh,
  logout,
} from "../controllers/admincontroller.js";
import { autenticarToken } from "../config/middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Rotas protegidas
router.get("/", autenticarToken, getAdmins);
router.get("/:username", autenticarToken, getadminByUsername);
router.post("/", autenticarToken, createadmin);
router.put("/:id", autenticarToken, updateadmin);
router.delete("/:id", autenticarToken, deleteadmin);

export default router;
