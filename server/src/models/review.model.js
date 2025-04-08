const { poolPromise } = require('../config/database');

class Review {
  static async create({ bookingId, rating, comment }) {
    const pool = await poolPromise;
    
    // Verificar que la contratación existe y está completada
    const booking = await pool.request()
      .input('bookingId', bookingId)
      .query(`
        SELECT status FROM Bookings 
        WHERE id = @bookingId
      `);

    if (!booking.recordset[0]) {
      throw new Error('Contratación no encontrada');
    }

    if (booking.recordset[0].status !== 'completed') {
      throw new Error('Solo se pueden dejar reseñas en contrataciones completadas');
    }

    // Verificar que no existe una reseña previa
    const existingReview = await pool.request()
      .input('bookingId', bookingId)
      .query('SELECT id FROM Reviews WHERE bookingId = @bookingId');

    if (existingReview.recordset.length > 0) {
      throw new Error('Ya existe una reseña para esta contratación');
    }

    const result = await pool.request()
      .input('bookingId', bookingId)
      .input('rating', rating)
      .input('comment', comment)
      .query(`
        INSERT INTO Reviews (bookingId, rating, comment)
        OUTPUT INSERTED.id, INSERTED.rating, INSERTED.comment
        VALUES (@bookingId, @rating, @comment)
      `);

    return result.recordset[0];
  }

  static async update(id, { rating, comment }) {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('id', id)
      .input('rating', rating)
      .input('comment', comment)
      .query(`
        UPDATE Reviews 
        SET rating = @rating,
            comment = @comment
        WHERE id = @id
        OUTPUT INSERTED.id, INSERTED.rating, INSERTED.comment
      `);

    return result.recordset[0];
  }

  static async delete(id) {
    const pool = await poolPromise;
    await pool.request()
      .input('id', id)
      .query('DELETE FROM Reviews WHERE id = @id');
  }

  static async findById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT r.*, 
               b.clientId, b.serviceId,
               u.firstName as clientFirstName, u.lastName as clientLastName
        FROM Reviews r
        JOIN Bookings b ON r.bookingId = b.id
        JOIN Users u ON b.clientId = u.id
        WHERE r.id = @id
      `);
    
    return result.recordset[0];
  }

  static async findByService(serviceId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('serviceId', serviceId)
      .query(`
        SELECT r.*, 
               u.firstName as clientFirstName, u.lastName as clientLastName
        FROM Reviews r
        JOIN Bookings b ON r.bookingId = b.id
        JOIN Users u ON b.clientId = u.id
        WHERE b.serviceId = @serviceId
        ORDER BY r.createdAt DESC
      `);
    
    return result.recordset;
  }

  static async findByTrainer(trainerId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('trainerId', trainerId)
      .query(`
        SELECT r.*, 
               s.category, s.description,
               u.firstName as clientFirstName, u.lastName as clientLastName
        FROM Reviews r
        JOIN Bookings b ON r.bookingId = b.id
        JOIN Services s ON b.serviceId = s.id
        JOIN Users u ON b.clientId = u.id
        WHERE s.trainerId = @trainerId
        ORDER BY r.createdAt DESC
      `);
    
    return result.recordset;
  }

  static async addTrainerReply(id, reply) {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('id', id)
      .input('reply', reply)
      .query(`
        UPDATE Reviews 
        SET trainerReply = @reply
        WHERE id = @id
        OUTPUT INSERTED.id, INSERTED.trainerReply
      `);

    return result.recordset[0];
  }

  static async getServiceStats(serviceId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('serviceId', serviceId)
      .query(`
        SELECT 
          COUNT(*) as totalReviews,
          AVG(CAST(rating AS FLOAT)) as averageRating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as fiveStars,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as fourStars,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as threeStars,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as twoStars,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as oneStar
        FROM Reviews r
        JOIN Bookings b ON r.bookingId = b.id
        WHERE b.serviceId = @serviceId
      `);
    
    return result.recordset[0];
  }
}

module.exports = Review; 