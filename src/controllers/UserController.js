import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
// const { generateToken } = require('../utils/tokenUtils'); // This will be provided by Aday
import { generateToken } from '../utils/handleJWT.js'; // <-- Tu código nuevo para token
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
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

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

/**
 * @desc    Get current user profile with statistics
 * @route   GET /api/users/me
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
                activeStories: 0 // Puedes calcular esto si tienes historias asignadas
            }
        });
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        res.status(500).json({ message: 'Error del servidor al obtener el usuario' });
    }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
    try {
        const { name, email, avatar } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el email ya existe (si está cambiando)
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(409).json({ message: 'El email ya está en uso' });
            }
        }

        // Actualizar campos
        if (name) user.name = name;
        if (email) user.email = email;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        res.status(200).json({
            message: 'Perfil actualizado exitosamente',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar el perfil' });
    }
};

/**
 * @desc    Change current user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                message: 'Por favor, proporciona la contraseña actual y la nueva contraseña' 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'La nueva contraseña debe tener al menos 6 caracteres' 
            });
        }

        // ✅ CORRECCIÓN: usar req.user._id en lugar de req.user.id
        console.log('🔍 Buscando usuario con ID:', req.user._id);
        const user = await User.findById(req.user._id);
        
        if (!user) {
            console.error('❌ Usuario no encontrado con ID:', req.user._id);
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        console.log('✅ Usuario encontrado:', user.name);

        // Verificar contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña (el pre-save hook la encriptará)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error del servidor al cambiar la contraseña' });
    }
};

/**
 * @desc    Create a new user (Admin only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Por favor, incluye nombre, email y contraseña' 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }

        const newUser = new User({ 
            name, 
            email, 
            password,
            role: role || 'Developer'
        });
        
        await newUser.save();

        res.status(201).json({ 
            message: 'Usuario creado con éxito',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error del servidor al crear el usuario' });
    }
};

/**
 * @desc    Update user by ID (Admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el email ya existe (si está cambiando)
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(409).json({ message: 'El email ya está en uso' });
            }
        }

        // Actualizar campos
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;

        await user.save();

        res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar el usuario' });
    }
};
