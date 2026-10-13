import * as productsService from "./products.service.js";

// tenantId aísla los datos; userId queda como "creado/modificado por".
function ctxFrom(req) {
  return { tenantId: req.user.tenant_id, userId: req.user.id };
}

export async function getProducts(req, res) {
  try {
    const rows = await productsService.getAll(ctxFrom(req));
    res.json(rows);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al obtener los productos" });
  }
}

export async function createProduct(req, res) {
  try {
    const product = await productsService.create(ctxFrom(req), req.body);
    res.status(201).json(product);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al crear el producto" });
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await productsService.update(
      req.params.id,
      ctxFrom(req),
      req.body,
    );
    res.json(product);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al actualizar el producto" });
  }
}

export async function deleteProduct(req, res) {
  try {
    await productsService.remove(req.params.id, ctxFrom(req));
    res.sendStatus(204);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al eliminar el producto" });
  }
}
