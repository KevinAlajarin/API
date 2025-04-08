const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/service.controller');
const { auth, isTrainer } = require('../middleware/auth');
const { validateService } = require('../middleware/validation');

// Rutas públicas
router.get('/search', ServiceController.search);
router.get('/:id', ServiceController.getById);
router.get('/trainer/:trainerId?', ServiceController.getByTrainer);

// Rutas protegidas (requieren autenticación)
router.use(auth);

// Rutas para entrenadores
router.post('/', isTrainer, validateService, ServiceController.create);
router.put('/:id', isTrainer, validateService, ServiceController.update);
router.delete('/:id', isTrainer, ServiceController.delete);

module.exports = router; 