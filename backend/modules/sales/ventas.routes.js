import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { spreadsheetUpload } from "../../shared/importers/upload.middleware.js";
import {
  getVentas,
  getSalesCSVColumns,
  uploadSalesCSV,
} from "./ventas.controller.js";

const router = express.Router();

router.get("/", verifyToken, getVentas);
router.post(
  "/columns",
  verifyToken,
  spreadsheetUpload.single("archivo"),
  getSalesCSVColumns,
);
router.post(
  "/upload",
  verifyToken,
  spreadsheetUpload.single("archivo"),
  uploadSalesCSV,
);

export default router;
