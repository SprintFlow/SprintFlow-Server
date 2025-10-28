import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";
import { generateToken } from "../utils/generateToken.js";

/**
 * @desc Login de usuario
 * @route POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor al iniciar sesión" });
  }
};

/**
 * @desc Registrar un nuevo usuario
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "El email ya está en uso" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error del servidor al registrar usuario" });
  }
};