const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/service.controller');
const { authenticate, authorizeTrainer } = require('../middleware/auth');
const { validateService } = require('../middleware/validation');

// Rutas públicas
router.get('/', ServiceController.getAll);
router.get('/search', ServiceController.search);
router.get('/categories', ServiceController.getCategories);
router.get('/zones', ServiceController.getZones);
router.get('/durations', ServiceController.getDurations);
router.get('/trainer/:trainerId?', ServiceController.getByTrainer);
router.get('/:id', ServiceController.getById);

// Rutas protegidas para entrenadores
router.post('/', authenticate, authorizeTrainer, validateService, ServiceController.create);
router.put('/:id', authenticate, authorizeTrainer, validateService, ServiceController.update);
router.delete('/:id', authenticate, authorizeTrainer, ServiceController.delete);

module.exports = router; 