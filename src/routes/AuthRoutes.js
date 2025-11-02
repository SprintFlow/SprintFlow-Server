import express from "express";
import { registerUser, loginUser, getCurrentUser } from "../controllers/AuthController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user & get token
// @access  Public
router.post("/login", loginUser);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get("/me", protect, getCurrentUser);

export default router;