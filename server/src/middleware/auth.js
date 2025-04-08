const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
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

const isTrainer = async (req, res, next) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de entrenador' });
  }
  next();
};

const isClient = async (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de cliente' });
  }
  next();
};

module.exports = {
  auth,
  isTrainer,
  isClient
}; 