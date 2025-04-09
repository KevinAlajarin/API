const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const { authenticate, authorizeTrainer, authorizeClient } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

// Rutas para clientes
router.post('/', authenticate, authorizeClient, validateBooking, BookingController.create);
router.get('/my-bookings', authenticate, BookingController.getMyBookings);
router.get('/client/:clientId?', authenticate, authorizeClient, BookingController.getByClient);
router.get('/check-availability', authenticate, BookingController.checkAvailability);
router.delete('/:id', authenticate, authorizeClient, BookingController.delete);

// Rutas para entrenadores
router.put('/:id/status', authenticate, authorizeTrainer, BookingController.updateStatus);
router.get('/trainer/:trainerId?', authenticate, authorizeTrainer, BookingController.getByTrainer);

// Ruta para ver detalles de una reserva (accesible por cliente o entrenador)
router.get('/:id', authenticate, BookingController.getById);

module.exports = router; 