import express from 'express';
import { crearRegistros, obtenerRegistros } from '../controllers/registrosController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/', verifyToken, crearRegistros);
router.get('/:categoriaId', verifyToken, obtenerRegistros);

export default router;