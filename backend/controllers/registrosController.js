import pool from "../models/db.js";

// Funcion para crear registros dinamicos
export async function crearRegistros(req, res) {
    console.log("Body recibido:", req.body);
    const { categoriaId, datos } = req.body
    const usuarioId = req.user.id

    if(!Array.isArray(datos)){
        return res.status(400).json({ message:"El formato de los datos debe ser una array de formato JSON"})
    }

    try{
        const value = datos.map(item => `(${categoriaId}, ${usuarioId}, '${JSON.stringify(item)}')`)
        const result = await pool.query(`INSERT INTO registros_dinamicos (categoria_id, usuario_id, datos) VALUES ${value} RETURNING * `);
        console.log("Registros insertados:", value);
        res.status(201).json(result.rows)
    }catch(err){
        console.error("Error al insertar los registros: ",err)
        res.status(500).json({ message:"Error al insertar los registros" })
    }
}

//Funcion para obtener los registros de una categoria especifica
export async function obtenerRegistros(req, res) {
    const usuarioId = req.user.id
    const { categoriaId } = req.query

    if(!categoriaId){
        return res.status(400).json({ message:"El id de la categoria es requerido y debe ser un numero" })
    }

    try{
        const result = await pool.query("SELECT id, datos, created_at FROM registros_dinamicos WHERE usuario_id = $1 AND categoria_id = $2", [usuarioId, categoriaId])
        res.status(200).json(result.rows)
    }catch(err){
        console.error("Error al obtener los registros: ", err)
        res.status(500).json({ message:"Error al obtener los registros" })
    }
}  

// Funcion para editar registros dinamicos
export async function actualizarRegistro(req, res) {
    const usuarioId = req.user.id;
    const registroId = req.params.id;
    const { datos } = req.body;

    if (!datos || typeof datos !== 'object') {
        return res.status(400).json({ message: "El campo 'datos' es requerido y debe ser un objeto" });
    }

    try {
        const result = await pool.query(
            `UPDATE registros_dinamicos 
             SET datos = $1 
             WHERE id = $2 AND usuario_id = $3 
             RETURNING *`,
            [datos, registroId, usuarioId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Registro no encontrado o no autorizado" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error al actualizar el registro:", err);
        res.status(500).json({ message: "Error del servidor al actualizar el registro" });
    }
}

// Funcion para eliminar registros dinamicos
export async function eliminarRegistro(req, res) {
    const usuarioId = req.user.id;
    const registroId = req.params.id;

    try {
        const result = await pool.query(
            `DELETE FROM registros_dinamicos 
             WHERE id = $1 AND usuario_id = $2`,
            [registroId, usuarioId]
        );

        if(registroId === undefined || isNaN(registroId)) {
            return res.status(400).json({ message: "El id del registro es requerido y debe ser un numero" });
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Registro no encontrado o no autorizado" });
        }

        res.status(200).json({ message: "Registro eliminado con éxito" });
    } catch (err) {
        console.error("Error al eliminar el registro:", err);
        res.status(500).json({ message: "Error del servidor al eliminar el registro" });
    }
}