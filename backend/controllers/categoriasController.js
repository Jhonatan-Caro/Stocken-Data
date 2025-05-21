import pool from "../models/db.js";

export async function crearCategorias(req, res) {
    const { nombre, descripcion } = req.body
    const usuarioId = req.user.id
    
    try{
        const result = await pool.query(`INSERT INTO categorias_dinamicas(usuario_id, nombre, descripcion)
            VALUES ($1, $2, $3) RETURNING *`,[usuarioId, nombre, descripcion]);
        res.status(201).json(result.rows[0]);
    }catch(err){
        console.error("Error al crear la categoria: ", err)
        res.status(500).json({ mesage:"error al crear la categoria" })
    }
}

export async function obtenerCategorias (req, res) {
    const usuarioId = req.user.id

    try{
        const result = await pool.query(`SELECT * FROM categorias_dinamicas WHERE usuario_id=$1`, [usuarioId])
        res.status(201).json(result.rows[0]);
    }catch(err){
        console.error("Error al intentar obtener las categorias", err)
        res.status(500).json({ message:"Error al obtener las categorias" })
    }
}