import express from 'express';
import { verifyServiceToken } from '../../middleware/verifyServiceToken.js';
import * as stats from './stats.service.js';
import { parseDateRange } from './stats.controller.js';

const router = express.Router();

function internalHandler(serviceFn, label) {
  return async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!Number.isInteger(userId)) {
        return res.status(400).json({ message: "userId inválido" });
      }
      const range = parseDateRange(req.query);
      return res.json(await serviceFn(userId, range));
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