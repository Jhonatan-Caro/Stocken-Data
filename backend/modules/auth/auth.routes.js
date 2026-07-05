import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { register, login, getUser, verifyTokenEndpoint, dashboard } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", verifyToken, getUser);
router.get("/tokenVerify", verifyToken, verifyTokenEndpoint);
router.get("/dashboard", verifyToken, dashboard);

export default router;
