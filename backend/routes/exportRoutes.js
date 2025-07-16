import express from 'express';
import { 
    exportarProductos, 
} from '../controllers/exportsController.js';

import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router()

router.post('/', verifyToken, exportarProductos)

export default router