import express from "express";
import multer from "multer";
import { verifyToken } from "../../middleware/verifyToken.js";
import {
  getVentas,
  getSalesCSVColumns,
  uploadSalesCSV,
} from "./ventas.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos CSV"));
    }
  },
});

router.get("/", verifyToken, getVentas);
router.post(
  "/columns",
  verifyToken,
  upload.single("archivo"),
  getSalesCSVColumns,
);
router.post("/upload", verifyToken, upload.single("archivo"), uploadSalesCSV);

export default router;
