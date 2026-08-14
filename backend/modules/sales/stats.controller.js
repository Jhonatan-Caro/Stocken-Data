import * as statsService from "./stats.service.js";

function parseDateRange(query) {
  const range = { from: null, to: null };

  for (const key of ["from", "to"]) {
    if (query[key]) {
      const date = new Date(query[key]);
      if (isNaN(date.getTime())) {
        throw { status: 400, message: `Fecha "${key}" inválida: ${query[key]}` };
      }
      range[key] = date;
    }
  }

  return range;
}

function handlerFor(serviceFn, label) {
  return async function (req, res) {
    try {
      const range = parseDateRange(req.query);
      const result = await serviceFn(req.user.id, range);
      return res.json(result);
    } catch (err) {
      console.error(`Error en stats/${label}:`, err);
      return res.status(err.status || 500).json({
        message: err.message || `Error al calcular estadísticas (${label})`,
      });
    }
  };
}

export const getSummary = handlerFor(statsService.getSummary, "summary");

export const getByProduct = handlerFor(statsService.getByProduct, "by-product");

export const getByMonth = handlerFor(statsService.getByMonth, "by-month");

export const getByChannel = handlerFor(statsService.getByChannel, "by-channel");

export const getByCategory = handlerFor(
  statsService.getByCategory,
  "by-category",
);
