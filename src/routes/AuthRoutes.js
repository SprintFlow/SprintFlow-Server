import express from "express";
import { registerUser, loginUser } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;