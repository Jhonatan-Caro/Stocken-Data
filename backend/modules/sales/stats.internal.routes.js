import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyServiceToken } from '../../middleware/verifyServiceToken.js';
import * as stats from './stats.service.js';
import { parseDateRange } from './stats.controller.js';

const router = express.Router();

function resolveTenantId(req) {
  const raw = req.headers["x-user-token"];
  if (!raw) {
    throw { status: 401, message: "Falta la aserción de usuario" };
  }
  let payload;
  try {
    payload = jwt.verify(raw, process.env.SECRET_KEY);
  } catch {
    throw { status: 401, message: "Aserción de usuario inválida" };
  }
  const tenantId = Number(payload.tid);
  if (!Number.isInteger(tenantId)) {
    throw { status: 400, message: "tenant_id inválido en la aserción" };
  }
  return tenantId;
}

function internalHandler(serviceFn, label) {
  return async (req, res) => {
    try {
      const tenantId = resolveTenantId(req);
      const range = parseDateRange(req.query);
      return res.json(await serviceFn({ tenantId }, range));
    } catch (err) {
      console.error(`Error en internal/stats/${label}:`, err);
      return res.status(err.status || 500).json({ message: err.message || "Error interno" });
    }
  };
}

router.use(verifyServiceToken);

router.get('/internal/stats/summary', internalHandler(stats.getSummary, "summary"));
router.get('/internal/stats/by-product', internalHandler(stats.getByProduct, "by-product"));
router.get('/internal/stats/by-month', internalHandler(stats.getByMonth, "by-month"));
router.get('/internal/stats/by-channel', internalHandler(stats.getByChannel, "by-channel"));
router.get('/internal/stats/by-category', internalHandler(stats.getByCategory, "by-category"));

export default router;