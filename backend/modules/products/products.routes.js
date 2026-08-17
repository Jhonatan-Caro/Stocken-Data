import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { spreadsheetUpload } from "../../shared/importers/upload.middleware.js";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./products.controller.js";
import { uploadCSV, getCSVColumns } from "./upload.controller.js";

const router = express.Router();

router.get("/", verifyToken, getProducts);
router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);
router.post(
  "/columns",
  verifyToken,
  spreadsheetUpload.single("file"),
  getCSVColumns,
);
router.post(
  "/upload",
  verifyToken,
  spreadsheetUpload.single("file"),
  uploadCSV,
);

export default router;
