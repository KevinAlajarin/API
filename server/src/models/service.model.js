const db = require('../database/db');

class Service {
  static async create({ trainerId, title, description, price, categoryId, durationId, zones, isVirtual }) {
    const pool = await db.getConnection();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();
      
      // Insertar el servicio
      const serviceResult = await transaction.request()
        .input('trainerId', trainerId)
        .input('title', title)
        .input('description', description)
        .input('price', price)
        .input('categoryId', categoryId)
        .input('durationId', durationId)
        .input('isVirtual', isVirtual)
        .query(`
          INSERT INTO services (trainer_id, title, description, price, category_id, duration_id, is_virtual)
          VALUES (@trainerId, @title, @description, @price, @categoryId, @durationId, @isVirtual);
          SELECT SCOPE_IDENTITY() as id;
        `);

      const serviceId = serviceResult.recordset[0].id;

      // Insertar las zonas
      for (const zoneId of zones) {
        await transaction.request()
          .input('serviceId', serviceId)
          .input('zoneId', zoneId)
          .query(`
            INSERT INTO service_zones (service_id, zone_id)
            VALUES (@serviceId, @zoneId);
          `);
      }

      await transaction.commit();
      return this.findById(serviceId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(id, { title, description, price, categoryId, durationId, zones, isVirtual }) {
    const pool = await db.getConnection();
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();

      // Actualizar el servicio
      await transaction.request()
        .input('id', id)
        .input('title', title)
        .input('description', description)
        .input('price', price)
        .input('categoryId', categoryId)
        .input('durationId', durationId)
        .input('isVirtual', isVirtual)
        .query(`
          UPDATE services
          SET title = @title,
              description = @description,
              price = @price,
              category_id = @categoryId,
              duration_id = @durationId,
              is_virtual = @isVirtual,
              updated_at = GETDATE()
          WHERE id = @id;
        `);

      // Eliminar zonas existentes
      await transaction.request()
        .input('serviceId', id)
        .query('DELETE FROM service_zones WHERE service_id = @serviceId');

      // Insertar nuevas zonas
      for (const zoneId of zones) {
        await transaction.request()
          .input('serviceId', id)
          .input('zoneId', zoneId)
          .query(`
            INSERT INTO service_zones (service_id, zone_id)
            VALUES (@serviceId, @zoneId);
          `);
      }

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
        SELECT s.*, c.name as category_name, d.minutes as duration_minutes,
               STRING_AGG(z.name, ', ') AS zones
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN allowed_durations d ON s.duration_id = d.id
        LEFT JOIN service_zones sz ON s.id = sz.service_id
        LEFT JOIN zones z ON sz.zone_id = z.id
        WHERE s.id = @id
        GROUP BY s.id, s.trainer_id, s.title, s.description, s.price, 
                 s.category_id, s.duration_id, s.is_virtual, s.created_at, 
                 s.updated_at, c.name, d.minutes;
      `);
    return result.recordset[0];
  }

  static async findAll(filters = {}) {
    const pool = await db.getConnection();
    let query = `
      SELECT s.*, c.name as category_name, d.minutes as duration_minutes,
             STRING_AGG(z.name, ', ') AS zones,
             AVG(r.rating) as average_rating
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN allowed_durations d ON s.duration_id = d.id
      LEFT JOIN service_zones sz ON s.id = sz.service_id
      LEFT JOIN zones z ON sz.zone_id = z.id
      LEFT JOIN reviews r ON s.id = r.service_id
    `;

    const conditions = [];
    const params = {};

    if (filters.categoryId) {
      conditions.push('s.category_id = @categoryId');
      params.categoryId = filters.categoryId;
    }

    if (filters.zoneId) {
      conditions.push('sz.zone_id = @zoneId');
      params.zoneId = filters.zoneId;
    }

    if (filters.durationId) {
      conditions.push('s.duration_id = @durationId');
      params.durationId = filters.durationId;
    }

    if (filters.isVirtual !== undefined) {
      conditions.push('s.is_virtual = @isVirtual');
      params.isVirtual = filters.isVirtual;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY s.id, s.trainer_id, s.title, s.description, s.price, ' +
             's.category_id, s.duration_id, s.is_virtual, s.created_at, ' +
             's.updated_at, c.name, d.minutes';

    // Ordenamiento
    if (filters.orderBy) {
      switch (filters.orderBy) {
        case 'price_asc':
          query += ' ORDER BY s.price ASC';
          break;
        case 'price_desc':
          query += ' ORDER BY s.price DESC';
          break;
        case 'rating_asc':
          query += ' ORDER BY average_rating ASC';
          break;
        case 'rating_desc':
          query += ' ORDER BY average_rating DESC';
          break;
      }
    }

    const request = pool.request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }

    const result = await request.query(query);
    return result.recordset;
  }

  static async delete(id) {
    const pool = await db.getConnection();
    await pool.request()
      .input('id', id)
      .query('DELETE FROM services WHERE id = @id');
  }

  static async getCategories() {
    const pool = await db.getConnection();
    const result = await pool.request()
      .query('SELECT * FROM categories ORDER BY name');
    return result.recordset;
  }

  static async getZones() {
    const pool = await db.getConnection();
    const result = await pool.request()
      .query('SELECT * FROM zones ORDER BY name');
    return result.recordset;
  }

  static async getDurations() {
    const pool = await db.getConnection();
    const result = await pool.request()
      .query('SELECT * FROM allowed_durations ORDER BY minutes');
    return result.recordset;
  }
}

module.exports = Service; 