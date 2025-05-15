import express from express;
import { crearCategorias, obtenerCategorias } from "../controllers/categoriasController";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.post("/", verifyToken, crearCategorias)
router.get("/", verifyToken, obtenerCategorias)

export default router;