import pool from "../models/db.js";    

export async function crearVenta(req, res) {
    const { producto_id, cantidad } = req.body;
    const usuario_id = req.user.id;

    if(!producto_id || !cantidad || cantidad <= 0) {
        return res.status(400).json({ message: "Producto ID y cantidad son requeridos" });
    }

    try {
        const client = await pool.connect()

        try{
            await client.query("BEGIN");
            // Verificar si el producto existe

            const { rows } = await client.query(
                "SELECT stock FROM productos WHERE id = $1 FOR UPDATE",
                [producto_id]
            );

            if (rows.length === 0) {
                await client.query("ROLLBACK");
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            if( rows[0].stock < cantidad) {
                await client.query("ROLLBACK");
                return res.status(400).json({ message: "Stock insuficiente" });
            }   

            await client.query(
                "UPDATE productos SET stock = stock - $1 WHERE id = $2",
                [cantidad, producto_id]
            )

            await client.query(
                "INSERT INTO ventas (producto_id, usuario_id, cantidad) VALUES ($1, $2, $3)",
                [producto_id, usuario_id, cantidad]
            );

            await client.query("COMMIT");
            res.status(201).json({ message: "Venta creada exitosamente" })
        }catch (err) {
            await client.query("ROLLBACK");
            console.error("Error al crear la venta:", err);
            res.status(500).json({ message: "Error del servidor al crear la venta" });
        } finally {
            client.release();
        }
    }catch (err) {
        console.error("Error al crear la venta:", err);
        res.status(500).json({ message: "Error del servidor al crear la venta" });
    }

}

export async function obtenerVentas(req, res) { 
    const usuario_id = req.user.id;

    try {
        const { rows } = await pool.query(
            "SELECT v.id, p.nombre AS producto, v.cantidad, v.fecha FROM ventas v JOIN productos p ON v.producto_id = p.id WHERE v.usuario_id = $1 ORDER BY v.fecha DESC",
            [usuario_id]
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error("Error al obtener las ventas:", err);
        res.status(500).json({ message: "Error del servidor al obtener las ventas" });
    }
}

export async function obtenerVentasDinamicas(req, res) { 
  const usuario_id = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT 
         v.id,
         v.registro_id,
         r.datos->>'nombre' AS producto, 
         v.cantidad,
         v.fecha 
       FROM ventas v 
       JOIN registros_dinamicos r 
         ON v.registro_id = r.id   
       WHERE v.usuario_id = $1 
       ORDER BY v.fecha DESC`,
      [usuario_id]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error al obtener las ventas:", err);
    res.status(500).json({ message: "Error del servidor al obtener las ventas" });
  }
}

export async function crearVentaDinamica(req, res){
    const { registro_id, cantidad } = req.body
    const usuario_id = req.user.id

    if(!registro_id || !cantidad || cantidad <= 0){
        return res.status(400).json({ message:" Faltan datos" })
    }

    const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT datos FROM registros_dinamicos WHERE id = $1 FOR UPDATE",
      [registro_id]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    const datos = rows[0].datos;
    const stock = datos.stock ?? datos.cantidad;

    if (stock < cantidad) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    datos.stock = stock - cantidad; // Actualiza en el JSON

    await client.query(
      "UPDATE registros_dinamicos SET datos = $1 WHERE id = $2",
      [datos, registro_id]
    );

    await client.query(
      "INSERT INTO ventas (registro_id, usuario_id, cantidad) VALUES ($1, $2, $3)",
      [registro_id, usuario_id, cantidad]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Venta dinámica realizada" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error en venta dinámica:", err);
    res.status(500).json({ message: "Error en venta dinámica" });
  } finally {
    client.release();
  }
}

export async function obtenerRegistrosVenta(req, res) {
  const usuarioId = req.user.id;
  try {
    const { rows } = await pool.query(
      "SELECT id, datos FROM registros_dinamicos WHERE usuario_id = $1",
      [usuarioId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener registros dinámicos", err);
    res.status(500).json({ message: "Error interno" });
  }
}