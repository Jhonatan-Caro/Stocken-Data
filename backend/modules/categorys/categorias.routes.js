import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { crearCategorias, obtenerCategorias, eliminarCategoria } from "./categorias.controller.js";

const router = express.Router();

router.post("/", verifyToken, crearCategorias);
router.get("/", verifyToken, obtenerCategorias);
router.delete("/:id", verifyToken, eliminarCategoria);

export default router;
