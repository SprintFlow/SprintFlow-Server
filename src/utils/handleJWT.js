import jwt from 'jsonwebtoken';

/**
 * Genera un JWT para un usuario
 * @param {Object} payload - Datos del usuario (id, email, role, etc.)
 * @returns {String} token JWT
 */
export const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no definido');
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verifica un JWT y devuelve el payload decodificado
 * @param {String} token - Token JWT
 * @returns {Object} payload decodificado
 */
export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no definido');
  return jwt.verify(token, process.env.JWT_SECRET);
};
