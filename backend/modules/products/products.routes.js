import express from "express";
import multer from "multer";
import { verifyToken } from "../../middleware/verifyToken.js";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "./products.controller.js";
import { uploadCSV, getCSVColumns } from "./upload.controller.js";

const router = express.Router();

// memoryStorage: el buffer va directo al controller, sin escribir en disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos CSV"));
    }
  },
});

router.get("/", verifyToken, getProductos);
router.post("/", verifyToken, createProducto);
router.put("/:id", verifyToken, updateProducto);
router.delete("/:id", verifyToken, deleteProducto);
router.post("/columns", verifyToken, upload.single("archivo"), getCSVColumns);
router.post("/upload", verifyToken, upload.single("archivo"), uploadCSV);

export default router;
