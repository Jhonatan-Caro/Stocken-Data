import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { createCategory, getCategories, deleteCategory } from "./categories.controller.js";

const router = express.Router();

router.post("/", verifyToken, createCategory);
router.get("/", verifyToken, getCategories);
router.delete("/:id", verifyToken, deleteCategory);

export default router;
