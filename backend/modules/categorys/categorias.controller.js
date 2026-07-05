import * as categoriasService from "./categorias.service.js";

export async function crearCategorias(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    const categoria = await categoriasService.create(
      req.user.id,
      nombre,
      descripcion,
    );
    res.status(201).json(categoria);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al crear la categoria" });
  }
}

export async function obtenerCategorias(req, res) {
  try {
    const categorias = await categoriasService.getAll(req.user.id);
    res.status(200).json(categorias);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener las categorias" });
  }
}

export async function eliminarCategoria(req, res) {
  try {
    await categoriasService.remove(req.params.id, req.user.id);
    res.status(200).json({ message: "Categoria eliminada exitosamente" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al eliminar la categoria" });
  }
}
