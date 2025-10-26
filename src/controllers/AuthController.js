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
