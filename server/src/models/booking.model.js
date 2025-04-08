const db = require('../database/db');

class Booking {
  static async create({ serviceId, clientId, scheduledDate, notes }) {
    const pool = await db.getConnection();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();

      // Verificar que el servicio existe y está activo
      const service = await transaction.request()
        .input('serviceId', serviceId)
        .query('SELECT * FROM services WHERE id = @serviceId');

      if (!service.recordset[0]) {
        throw new Error('Servicio no encontrado');
      }

      // Verificar que la fecha es futura
      const now = new Date();
      if (new Date(scheduledDate) <= now) {
        throw new Error('La fecha debe ser futura');
      }

      // Crear la reserva
      const result = await transaction.request()
        .input('serviceId', serviceId)
        .input('clientId', clientId)
        .input('scheduledDate', scheduledDate)
        .input('notes', notes)
        .query(`
          INSERT INTO bookings (service_id, client_id, scheduled_date, notes, status)
          VALUES (@serviceId, @clientId, @scheduledDate, @notes, 'pending');
          SELECT SCOPE_IDENTITY() as id;
        `);

      const bookingId = result.recordset[0].id;

      await transaction.commit();
      return this.findById(bookingId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async updateStatus(id, status, trainerId) {
    const pool = await db.getConnection();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();

      // Verificar que la reserva existe y pertenece a un servicio del entrenador
      const booking = await transaction.request()
        .input('id', id)
        .query(`
          SELECT b.*, s.trainer_id
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          WHERE b.id = @id
        `);

      if (!booking.recordset[0]) {
        throw new Error('Reserva no encontrada');
      }

      if (booking.recordset[0].trainer_id !== trainerId) {
        throw new Error('No tienes permiso para modificar esta reserva');
      }

      // Actualizar el estado
      await transaction.request()
        .input('id', id)
        .input('status', status)
        .query(`
          UPDATE bookings
          SET status = @status,
              updated_at = GETDATE()
          WHERE id = @id
        `);

      await transaction.commit();
      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async findById(id) {
    const pool = await db.getConnection();
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT b.*, 
               s.title as service_title,
               s.description as service_description,
               s.price as service_price,
               c.name as category_name,
               d.minutes as duration_minutes,
               u1.first_name as client_first_name,
               u1.last_name as client_last_name,
               u2.first_name as trainer_first_name,
               u2.last_name as trainer_last_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN categories c ON s.category_id = c.id
        JOIN allowed_durations d ON s.duration_id = d.id
        JOIN users u1 ON b.client_id = u1.id
        JOIN users u2 ON s.trainer_id = u2.id
        WHERE b.id = @id
      `);
    return result.recordset[0];
  }

  static async findByClient(clientId) {
    const pool = await db.getConnection();
    const result = await pool.request()
      .input('clientId', clientId)
      .query(`
        SELECT b.*, 
               s.title as service_title,
               s.description as service_description,
               s.price as service_price,
               c.name as category_name,
               d.minutes as duration_minutes,
               u.first_name as trainer_first_name,
               u.last_name as trainer_last_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN categories c ON s.category_id = c.id
        JOIN allowed_durations d ON s.duration_id = d.id
        JOIN users u ON s.trainer_id = u.id
        WHERE b.client_id = @clientId
        ORDER BY b.scheduled_date DESC
      `);
    return result.recordset;
  }

  static async findByTrainer(trainerId) {
    const pool = await db.getConnection();
    const result = await pool.request()
      .input('trainerId', trainerId)
      .query(`
        SELECT b.*, 
               s.title as service_title,
               s.description as service_description,
               s.price as service_price,
               c.name as category_name,
               d.minutes as duration_minutes,
               u.first_name as client_first_name,
               u.last_name as client_last_name
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN categories c ON s.category_id = c.id
        JOIN allowed_durations d ON s.duration_id = d.id
        JOIN users u ON b.client_id = u.id
        WHERE s.trainer_id = @trainerId
        ORDER BY b.scheduled_date DESC
      `);
    return result.recordset;
  }

  static async delete(id, userId, isTrainer) {
    const pool = await db.getConnection();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();

      // Verificar que la reserva existe y pertenece al usuario
      const booking = await transaction.request()
        .input('id', id)
        .query(`
          SELECT b.*, s.trainer_id
          FROM bookings b
          JOIN services s ON b.service_id = s.id
          WHERE b.id = @id
        `);

      if (!booking.recordset[0]) {
        throw new Error('Reserva no encontrada');
      }

      const canDelete = isTrainer 
        ? booking.recordset[0].trainer_id === userId
        : booking.recordset[0].client_id === userId;

      if (!canDelete) {
        throw new Error('No tienes permiso para eliminar esta reserva');
      }

      await transaction.request()
        .input('id', id)
        .query('DELETE FROM bookings WHERE id = @id');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = Booking; 