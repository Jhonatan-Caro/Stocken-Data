import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { chat } from "./chatbot.controller.js";

const router = express.Router();

router.post("/api/chat", verifyToken, chat);

export default router;
