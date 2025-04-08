const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const { validateBooking } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Rutas protegidas para clientes
router.post('/', authenticate, validateBooking, BookingController.create);
router.get('/my-bookings', authenticate, BookingController.getMyBookings);
router.delete('/:id', authenticate, BookingController.delete);

// Rutas protegidas para entrenadores
router.put('/:id/status', authenticate, BookingController.updateStatus);

// Ruta para ver detalles de una reserva (accesible por cliente o entrenador)
router.get('/:id', authenticate, BookingController.getById);

module.exports = router; 