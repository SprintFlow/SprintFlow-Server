import express from 'express';
import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getCurrentUser,
    updateUserProfile,
    changePassword,
    createUser,
    updateUser
} from '../controllers/UserController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

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

// @route   GET /api/users/me
// @desc    Get current user profile with statistics
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   PUT /api/users/change-password
// @desc    Change current user password
// @access  Private
router.put('/change-password', protect, changePassword);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, getAllUsers);

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private/Admin
router.post('/', protect, admin, createUser);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', protect, admin, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user by ID (Admin only)
// @access  Private/Admin
router.put('/:id', protect, admin, updateUser);

// @route   PUT /api/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/:id/role', protect, admin, updateUserRole);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteUser);

// Export
export default router;
