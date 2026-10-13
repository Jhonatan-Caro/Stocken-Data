import * as categoriesService from "./categories.service.js";

// tenantId aísla los datos; userId queda como "creado por".
function ctxFrom(req) {
  return { tenantId: req.user.tenant_id, userId: req.user.id };
}

export async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    const category = await categoriesService.create(
      ctxFrom(req),
      name,
      description,
    );
    res.status(201).json(category);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al crear la categoria" });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await categoriesService.getAll(ctxFrom(req));
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener las categorias" });
  }
}

export async function deleteCategory(req, res) {
  try {
    await categoriesService.remove(req.params.id, ctxFrom(req));
    res.status(200).json({ message: "Categoria eliminada exitosamente" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error al eliminar la categoria" });
  }
}
