const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validation');

// Rutas públicas
router.get('/trainers', UserController.getTrainers);
router.get('/trainers/:id', UserController.getTrainerById);

// Rutas protegidas
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validateUserUpdate, UserController.updateProfile);
router.put('/profile/password', authenticate, UserController.updatePassword);

// Rutas administrativas
router.get('/', authenticate, authorizeAdmin, UserController.getAllUsers);
router.delete('/:id', authenticate, authorizeAdmin, UserController.deleteUser);

module.exports = router; 