import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

// Middleware de protección general (requiere token JWT)
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verificar token y decodificar el payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el usuario en la base de datos
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado o eliminado" });
      }

      // ✅ CRÍTICO: Convertir documento de Mongoose a objeto plano
      req.user = user.toObject();

      console.log("👤 Usuario autenticado:", {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin
      });

      next();
    } else {
      return res.status(401).json({ message: "No autorizado, token ausente" });
    }
  } catch (error) {
    console.error("❌ Error de autenticación:", error.message);
    return res.status(401).json({ 
      message: "Token no válido o expirado", 
      error: error.message 
    });
  }
};

// Middleware para restringir acceso a administradores
export const admin = (req, res, next) => {
  console.log("🔐 Verificando permisos admin:");
  console.log("  - Usuario existe:", !!req.user);
  console.log("  - Usuario ID:", req.user?._id);
  console.log("  - isAdmin:", req.user?.isAdmin);
  console.log("  - Tipo isAdmin:", typeof req.user?.isAdmin);

  if (req.user && req.user.isAdmin === true) {
    console.log("✅ Acceso admin CONCEDIDO");
    next();
  } else {
    console.log("❌ Acceso admin DENEGADO");
    return res.status(403).json({ 
      message: "Acceso restringido a administradores",
      debug: {
        hasUser: !!req.user,
        userId: req.user?._id,
        isAdmin: req.user?.isAdmin,
        typeIsAdmin: typeof req.user?.isAdmin
      }
    });
  }
};