const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const { authenticate, authorizeTrainer } = require('../middleware/auth');

// Rutas públicas para obtener reseñas
router.get('/service/:serviceId', ReviewController.getByService);
router.get('/trainer/:trainerId', ReviewController.getByTrainer);
router.get('/stats/service/:serviceId', ReviewController.getServiceStats);

// Rutas para reseñas específicas
router.get('/:id', ReviewController.getById);

// Rutas protegidas para crear/actualizar/eliminar reseñas
router.post('/', authenticate, ReviewController.create); // Cualquier usuario autenticado puede crear una reseña
router.put('/:id', authenticate, ReviewController.update); // Permitir a los usuarios actualizar sus propias reseñas
router.delete('/:id', authenticate, ReviewController.delete); // Permitir a los usuarios eliminar sus propias reseñas

// Ruta para que los entrenadores respondan a reseñas
router.post('/:id/reply', authenticate, authorizeTrainer, ReviewController.addReply);

module.exports = router; 