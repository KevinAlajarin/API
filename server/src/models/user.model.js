const { poolPromise } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

class User {
  static async create({ firstName, lastName, email, password, birthDate, gender, role }) {
    const pool = await db.getConnection();
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Verificar si el email ya existe
      const emailExists = await transaction.request()
        .input('email', email)
        .query('SELECT id FROM users WHERE email = @email');

      if (emailExists.recordset.length > 0) {
        throw new Error('El email ya está registrado');
      }

      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insertar usuario
      const result = await transaction.request()
        .input('firstName', firstName)
        .input('lastName', lastName)
        .input('email', email)
        .input('password', hashedPassword)
        .input('birthDate', birthDate)
        .input('gender', gender)
        .input('role', role)
        .query(`
          INSERT INTO users (first_name, last_name, email, password, birth_date, gender, role)
          VALUES (@firstName, @lastName, @email, @password, @birthDate, @gender, @role);
          SELECT SCOPE_IDENTITY() as id;
        `);

      const userId = result.recordset[0].id;

      await transaction.commit();
      
      // Retornar usuario sin la contraseña
      return {
        id: userId,
        firstName,
        lastName,
        email,
        birthDate,
        gender,
        role
      };
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
        SELECT id, first_name, last_name, email, birth_date, gender, role, profile_image, created_at
        FROM users 
        WHERE id = @id
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
  }

  static async findByEmail(email) {
    const pool = await db.getConnection();
    const result = await pool.request()
      .input('email', email)
      .query('SELECT * FROM users WHERE email = @email');
    
    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
  }

  static async update(id, { firstName, lastName, birthDate, gender, profileImage }) {
    const pool = await db.getConnection();
    const result = await pool.request()
      .input('id', id)
      .input('firstName', firstName)
      .input('lastName', lastName)
      .input('birthDate', birthDate)
      .input('gender', gender)
      .input('profileImage', profileImage)
      .query(`
        UPDATE users
        SET first_name = @firstName,
            last_name = @lastName,
            birth_date = @birthDate,
            gender = @gender,
            profile_image = @profileImage,
            updated_at = GETDATE()
        WHERE id = @id;
        
        SELECT id, first_name, last_name, email, birth_date, gender, role, profile_image, created_at
        FROM users
        WHERE id = @id;
      `);
    
    return result.recordset[0];
  }

  static async changePassword(id, newPassword) {
    const pool = await db.getConnection();
    
    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await pool.request()
      .input('id', id)
      .input('password', hashedPassword)
      .query(`
        UPDATE users
        SET password = @password,
            updated_at = GETDATE()
        WHERE id = @id
      `);
    
    return true;
  }

  static async verifyPassword(id, password) {
    const pool = await db.getConnection();
    const result = await pool.request()
      .input('id', id)
      .query('SELECT password FROM users WHERE id = @id');
    
    if (result.recordset.length === 0) {
      return false;
    }

    const hashedPassword = result.recordset[0].password;
    return bcrypt.compare(password, hashedPassword);
  }

  static async delete(id) {
    const pool = await db.getConnection();
    await pool.request()
      .input('id', id)
      .query('DELETE FROM users WHERE id = @id');
    
    return true;
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const pool = await poolPromise;
    
    await pool.request()
      .input('id', userId)
      .input('password', hashedPassword)
      .query('UPDATE Users SET password = @password WHERE id = @id');
  }
}

module.exports = User; 