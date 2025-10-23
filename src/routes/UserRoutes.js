// --- 1. Dependencies ---
const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController.js');

// --- 2. Router Definition ---
const router = express.Router();

// --- 3. Route Definitions ---

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Authenticate a user & get token
// @access  Public
router.post('/login', loginUser);

// --- 4. Export ---
module.exports = router;