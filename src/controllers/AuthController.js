import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/handleJWT.js';
import Completion from '../models/Completion.js';

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

        const token = generateToken({
            id: newUser._id,
            role: newUser.role,
            isAdmin: newUser.isAdmin
        });

        return res.status(201).json({ 
            message: 'Usuario registrado con éxito',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isAdmin: newUser.isAdmin  // ✅ Añadir isAdmin
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
            const token = generateToken({
                id: user._id,
                role: user.role,
                isAdmin: user.isAdmin
            });

            return res.status(200).json({
                message: 'Login exitoso',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isAdmin: user.isAdmin  // ✅ Añadir isAdmin
                }
            });
        } else {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error durante el login del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al iniciar sesión' });
    }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener estadísticas del usuario
        const completions = await Completion.find({ userId: req.user._id });
        const totalPoints = completions.reduce((sum, comp) => sum + (comp.totalCompletedPoints || 0), 0);
        const completedStories = completions.reduce((sum, comp) => sum + (comp.completedStories?.length || 0), 0);

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin,
            statistics: {
                totalPoints,
                completedStories,
                activeStories: 0
            }
        });
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        res.status(500).json({ message: 'Error del servidor al obtener el usuario' });
    }
};