import pool from "../models/db";

export async function crearRegistros(req, res) {
    const { categoriaId, datos } = req.body
    const usuarioId = req.user.id

    if(!Array.isArray(datos)){
        return res.status(400).json({ message:"El formato de los datos debe ser una array de formato JSON"})
    }

    try{
        const value = datos.map(item => `(${categoriaId}, ${usuarioId}, '${JSON.stringify(item)}')`)
        const result = await pool.query(`INSERT INTO registrod_dinamicos (categoria_id, usuario_id, datos) VALUES ${value} RETURNING * `);
        res.status(201).json(result.rows)
    }catch(err){
        console.error("Error al insertar los registros: ",err)
        res.status(500).json({ message:"Error al insertar los registros" })
    }


}