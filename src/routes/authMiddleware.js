

import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';


// Middleware de protección general (requiere token JWT)
export const protect = async (req, res, next) => {
  let token;

  // Verificamos si hay header de autorización con formato Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Extraer el token
      token = req.headers.authorization.split(" ")[1];

      // 2. Verificar el token y decodificar el payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Buscar el usuario en la base de datos y asignarlo al request
      req.user = await User.findById(decoded.id).select("-password");

      // 4. Si todo es correcto, continuar al siguiente middleware
      next();
    } catch (error) {
      console.error("Error de autenticación:", error.message);
      // Si el token falla (expirado, malformado, etc.), devolvemos 401
      return res.status(401).json({ message: "No autorizado, el token ha fallado" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No autorizado, no se encontró un token" });
  }
};

// Middleware para restringir acceso a administradores
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador." });
  }
};
