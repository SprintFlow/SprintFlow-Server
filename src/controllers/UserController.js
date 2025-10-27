import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
// const { generateToken } = require('../utils/tokenUtils'); // This will be provided by Aday
import { generateToken } from '../utils/handleJWT.js'; // <-- Tu código nuevo para token

// -- REGISTER CONTROLLER -- //
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Por favor, incluye nombre, email y contraseña' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(409).json({ message: 'El email ya está registrado' });

        const newUser = new User({ name, email, password });
        await newUser.save();

        return res.status(201).json({ 
            message: 'Usuario registrado con éxito',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Error durante el registro del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al registrar el usuario' });
    }
};

// -- LOGIN CONTROLLER -- //
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor, incluye email y contraseña' });
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Generamos el token dentro de la función, solo cuando el usuario es válido
            const token = generateToken({
                id: user._id,
                role: user.role,
                isAdmin: user.isAdmin
            });

            return res.status(200).json({
                message: 'Login exitoso',
                token,       // <-- Token generado
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error durante el login del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al iniciar sesión' });
    }
};

// --- USER CRUD --- //

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        res.status(500).json({ message: 'Error del servidor al obtener los usuarios' });
    }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error del servidor al obtener el usuario' });
    }
};

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar el rol del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar el rol' });
    }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (user) {
            res.status(200).json({ message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar el usuario' });
    }
};
