import pool from "../models/db.js";

export async function exportarProductos(req, res){
    try {
    const userId = req.user.id;

    const query = `
      SELECT id, nombre, precio, stock, caracteristicas
      FROM productos
      WHERE usuario_id = $1
    `;
    const result = await pool.query(query, [userId]);
    const csv = new Parser().parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('productos.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al exportar productos');
  }
}

export async function exportarRegistrosDinamicos(req, res){

}

export async function exportarVentas(req, res){

}