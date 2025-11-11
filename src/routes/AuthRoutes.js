import express from "express";
import { registerUser, 
    loginUser, 
    getCurrentUser, 
    getSecurityQuestion, 
    verifySecurityAnswer,
    resetPassword } from "../controllers/AuthController.js";
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

// ✅ Nuevas rutas para recuperación de contraseña
router.post('/forgot-password', getSecurityQuestion);
router.post('/verify-security-answer', verifySecurityAnswer);
router.post('/reset-password', resetPassword);
router.post('/get-security-question', getSecurityQuestion);

export default router;