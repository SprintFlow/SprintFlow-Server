

import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';


// Middleware de protección general (requiere token JWT)
export const protect = async (req, res, next) => {
  try {
    let token;

    // Verificamos si hay header de autorización con formato Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verificar token y decodificar el payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el usuario en la base de datos y asignarlo al request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Usuario no encontrado o eliminado" });
      }

      next();
    } else {
      return res.status(401).json({ message: "No autorizado, token ausente" });
    }
  } catch (error) {
    console.error("Error de autenticación:", error.message);
    return res
      .status(401)
      .json({ message: "Token no válido o expirado", error: error.message });
  }
};

// Middleware para restringir acceso a administradores
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Acceso restringido a administradores" });
  }
};

module.exports = (req, res, next) => {
  console.warn('⚠️ authMiddleware aún no implementado — acceso temporalmente permitido.');
  next();
};

