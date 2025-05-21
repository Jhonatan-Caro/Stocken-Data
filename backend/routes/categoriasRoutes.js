import express from 'express';
import { crearCategorias, obtenerCategorias } from "../controllers/categoriasController.js";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();

router.post("/", verifyToken, crearCategorias)
router.get("/", verifyToken, obtenerCategorias)

export default router;