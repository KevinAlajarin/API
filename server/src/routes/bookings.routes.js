const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const { auth, isTrainer, isClient } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas para clientes
router.post('/', isClient, validateBooking, BookingController.create);
router.get('/client/:clientId?', isClient, BookingController.getByClient);
router.get('/check-availability', BookingController.checkAvailability);

// Rutas para entrenadores
router.put('/:id/status', isTrainer, BookingController.updateStatus);
router.get('/trainer/:trainerId?', isTrainer, BookingController.getByTrainer);

// Rutas compartidas
router.get('/:id', BookingController.getById);

module.exports = router; 