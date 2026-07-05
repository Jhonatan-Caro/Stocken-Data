import * as productsService from "./products.service.js";

export async function getProductos(req, res) {
  try {
    const rows = await productsService.getAll(req.user.id);
    res.json(rows);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al obtener los productos" });
  }
}

export async function createProducto(req, res) {
  try {
    const product = await productsService.create(req.user.id, req.body);
    res.status(201).json(product);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al crear el producto" });
  }
}

export async function updateProducto(req, res) {
  try {
    const product = await productsService.update(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.json(product);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al actualizar el producto" });
  }
}

export async function deleteProducto(req, res) {
  try {
    await productsService.remove(req.params.id, req.user.id);
    res.sendStatus(204);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al eliminar el producto" });
  }
}
