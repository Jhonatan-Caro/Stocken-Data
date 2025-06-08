import express from 'express';
import { crearVenta, crearVentaDinamica, obtenerVentas, obtenerRegistrosVenta, obtenerVentasDinamicas } from '../controllers/ventasController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/', verifyToken, crearVenta)
router.get('/', verifyToken, obtenerVentas)
router.post('/dinamicas', verifyToken, crearVentaDinamica)
//router.get('/registros', verifyToken, listarRegistrosValidos)
router.get('/registros', verifyToken, obtenerRegistrosVenta)
router.get('/csv', verifyToken, obtenerVentasDinamicas)


export default router;