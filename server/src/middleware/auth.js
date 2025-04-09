const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware para autenticar al usuario
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para autorizar a entrenadores
const authorizeTrainer = async (req, res, next) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de entrenador' });
  }
  next();
};

// Middleware para autorizar a clientes
const authorizeClient = async (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de cliente' });
  }
  next();
};

// Middleware para autorizar a administradores
const authorizeAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

// Mantener compatibilidad con código existente
const auth = authenticate;
const isTrainer = authorizeTrainer;
const isClient = authorizeClient;

module.exports = {
  authenticate,
  authorizeTrainer,
  authorizeClient,
  authorizeAdmin,
  // Exportar aliases para compatibilidad
  auth,
  isTrainer,
  isClient
}; 