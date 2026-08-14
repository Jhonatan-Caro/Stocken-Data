import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { spreadsheetUpload } from "../../shared/importers/upload.middleware.js";
import {
  getSales,
  getSalesCSVColumns,
  uploadSalesCSV,
  uploadSalesOrders,
} from "./sales.controller.js";
import * as stats from "./stats.controller.js";

const router = express.Router();

router.get("/", verifyToken, getSales);

router.get("/stats/summary", verifyToken, stats.getSummary);
router.get("/stats/by-product", verifyToken, stats.getByProduct);
router.get("/stats/by-month", verifyToken, stats.getByMonth);
router.get("/stats/by-channel", verifyToken, stats.getByChannel);
router.get("/stats/by-category", verifyToken, stats.getByCategory);
router.post(
  "/columns",
  verifyToken,
  spreadsheetUpload.single("file"),
  getSalesCSVColumns,
);
router.post(
  "/upload",
  verifyToken,
  spreadsheetUpload.single("file"),
  uploadSalesCSV,
);
router.post(
  "/orders/upload",
  verifyToken,
  spreadsheetUpload.single("file"),
  uploadSalesOrders,
);

export default router;
