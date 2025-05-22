import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();   

const upload = multer({ dest: 'upload/' });

router.post("/", verifyToken, upload.single('archivo'), (req, res) => {
    const usuarioId = req.user.id;
    const categoriaId = req.body.categoriaId;

    if(!req.file) {
        return res.status(400).json({ message: "No se ha subido ningun archivo" });
    }

    const resultados = [];

    fs.createReadStream(path.resolve(req.file.path))
    .pipe(csv())
    .on("data", (data) => resultados.push(data))    
    .on("end", async () => {
        try{
            const value = resultados.map(item => `(${categoriaId}, ${usuarioId}, '${JSON.stringify(item)}')`).join(", ");
            const { rows } = await pool.query(`INSERT INTO registros_dinamicos (categoria_id, usuario_id, datos) VALUES ${value} RETURNING * `);

            fs.unlink(req.file.path);

            res.status(201).json({message: "Registros insertados exitosamente", registros: rows });
        }catch(err){
            console.error("Error al insertar los registros: ", err);
            res.status(500).json({ message: "Error al insertar los registros" });
        }
    })
})

export default router;
// Este código es un ejemplo de cómo manejar la carga de archivos CSV en una aplicación Express utilizando multer y csv-parser.
// El código define una ruta POST para cargar un archivo CSV, procesarlo y almacenar los datos en una base de datos PostgreSQL.