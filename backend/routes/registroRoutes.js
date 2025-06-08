import express from 'express';
import { 
    crearRegistros, 
    obtenerRegistros,
    actualizarRegistro,
    eliminarRegistro,
 } from '../controllers/registrosController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/', verifyToken, crearRegistros);
router.get('/', verifyToken, obtenerRegistros);
router.put('/:id', verifyToken, actualizarRegistro);
router.delete('/:id', verifyToken, eliminarRegistro);

export default router;