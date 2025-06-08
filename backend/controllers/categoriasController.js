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
        res.status(201).json(result.rows);
    }catch(err){
        console.error("Error al intentar obtener las categorias", err)
        res.status(500).json({ message:"Error al obtener las categorias" })
    }
}

export async function eliminarCategoria(req, res) {
    const { id } = req.params;
    const usuarioId = req.user.id;

    try {
        const result = await pool.query(`DELETE FROM categorias_dinamicas WHERE id=$1 AND usuario_id=$2 RETURNING *`, [id, usuarioId]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Categoria no encontrada o no pertenece al usuario" });
        }
        
        res.status(200).json({ message: "Categoria eliminada exitosamente" });
    } catch (err) {
        console.error("Error al eliminar la categoria: ", err);
        res.status(500).json({ message: "Error al eliminar la categoria" });
    }
}