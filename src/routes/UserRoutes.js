import express from 'express';
import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
} from '../controllers/UserController.js';

// Router Definition
const router = express.Router();

// Route Definitions

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Authenticate a user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin (to be protected later)
router.get('/', getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin (to be protected later)
router.get('/:id', getUserById);

// @route   PUT /api/users/:id/role
// @desc    Update user role
// @access  Private/Admin (to be protected later)
router.put('/:id/role', updateUserRole);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin (to be protected later)
router.delete('/:id', deleteUser);

// Export
export default router;
