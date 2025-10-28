import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/handleJWT.js';

// ------------------- REGISTER ------------------- //
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, incluye nombre, email y contraseña' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'El email ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user', // por defecto 'user' si no se pasa
    });

    const token = generateToken({
      id: newUser._id,
      role: newUser.role,
      isAdmin: newUser.role === 'admin',
    });

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error('Error durante el registro del usuario:', error);
    res.status(500).json({ message: 'Error del servidor al registrar el usuario' });
  }
};

// ------------------- LOGIN ------------------- //
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, incluye email y contraseña' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const token = generateToken({
      id: user._id,
      role: user.role,
      isAdmin: user.role === 'admin',
    });

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Error durante el login del usuario:', error);
    res.status(500).json({ message: 'Error del servidor al iniciar sesión' });
  }
};

// ------------------- USER CRUD ------------------- //

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    res.status(500).json({ message: 'Error del servidor al obtener los usuarios' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) res.status(200).json(user);
    else res.status(404).json({ message: 'Usuario no encontrado' });
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el usuario' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (user) res.status(200).json(user);
    else res.status(404).json({ message: 'Usuario no encontrado' });
  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar el rol' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) res.status(200).json({ message: 'Usuario eliminado correctamente' });
    else res.status(404).json({ message: 'Usuario no encontrado' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar el usuario' });
  }
};
