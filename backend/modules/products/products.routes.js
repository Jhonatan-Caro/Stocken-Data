import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { spreadsheetUpload } from "../../shared/importers/upload.middleware.js";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "./products.controller.js";
import { uploadCSV, getCSVColumns } from "./upload.controller.js";

const router = express.Router();

router.get("/", verifyToken, getProductos);
router.post("/", verifyToken, createProducto);
router.put("/:id", verifyToken, updateProducto);
router.delete("/:id", verifyToken, deleteProducto);
router.post(
  "/columns",
  verifyToken,
  spreadsheetUpload.single("archivo"),
  getCSVColumns,
);
router.post(
  "/upload",
  verifyToken,
  spreadsheetUpload.single("archivo"),
  uploadCSV,
);

export default router;
