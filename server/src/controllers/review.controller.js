const Review = require('../models/review.model');

class ReviewController {
  static async create(req, res) {
    try {
      const { bookingId, rating, comment } = req.body;
      const review = await Review.create({ bookingId, rating, comment });
      res.status(201).json({ message: 'Reseña creada exitosamente', review });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const review = await Review.update(id, { rating, comment });
      res.json({ message: 'Reseña actualizada exitosamente', review });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Review.delete(id);
      res.json({ message: 'Reseña eliminada exitosamente' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ message: 'Reseña no encontrada' });
      }
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getByService(req, res) {
    try {
      const { serviceId } = req.params;
      const reviews = await Review.findByService(serviceId);
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getByTrainer(req, res) {
    try {
      const { trainerId } = req.params;
      const reviews = await Review.findByTrainer(trainerId);
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async addReply(req, res) {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const review = await Review.addTrainerReply(id, reply);
      res.json({ message: 'Respuesta agregada exitosamente', review });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getServiceStats(req, res) {
    try {
      const { serviceId } = req.params;
      const stats = await Review.getServiceStats(serviceId);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = ReviewController; 