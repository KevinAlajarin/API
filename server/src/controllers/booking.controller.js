const Booking = require('../models/booking.model');
const { validateBooking } = require('../middleware/validation');

class BookingController {
  static async create(req, res) {
    try {
      const { serviceId, scheduledDate, notes } = req.body;
      const clientId = req.user.id;

      const booking = await Booking.create({
        serviceId,
        clientId,
        scheduledDate,
        notes
      });

      res.status(201).json({ message: 'Reserva creada exitosamente', booking });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const trainerId = req.user.id;

      const booking = await Booking.updateStatus(id, status, trainerId);
      res.json({ message: 'Estado de la reserva actualizado', booking });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id);
      
      if (!booking) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
      }

      // Verificar que el usuario tiene acceso a la reserva
      const isTrainer = req.user.role === 'trainer';
      const hasAccess = isTrainer 
        ? booking.trainer_id === req.user.id
        : booking.client_id === req.user.id;

      if (!hasAccess) {
        return res.status(403).json({ message: 'No tienes permiso para ver esta reserva' });
      }

      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getMyBookings(req, res) {
    try {
      const userId = req.user.id;
      const isTrainer = req.user.role === 'trainer';

      const bookings = isTrainer
        ? await Booking.findByTrainer(userId)
        : await Booking.findByClient(userId);

      res.json(bookings);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isTrainer = req.user.role === 'trainer';

      await Booking.delete(id, userId, isTrainer);
      res.json({ message: 'Reserva eliminada exitosamente' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = BookingController; 