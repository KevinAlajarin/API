const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/service.controller');
const { validateService } = require('../middleware/validation');
const { authenticate, authorizeTrainer } = require('../middleware/auth');

// Rutas públicas
router.get('/', ServiceController.getAll);
router.get('/categories', ServiceController.getCategories);
router.get('/zones', ServiceController.getZones);
router.get('/durations', ServiceController.getDurations);
router.get('/:id', ServiceController.getById);

// Rutas protegidas para entrenadores
router.post('/', authenticate, authorizeTrainer, validateService, ServiceController.create);
router.put('/:id', authenticate, authorizeTrainer, validateService, ServiceController.update);
router.delete('/:id', authenticate, authorizeTrainer, ServiceController.delete);

module.exports = router; 