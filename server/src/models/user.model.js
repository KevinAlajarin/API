const { poolPromise } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  static async create({ firstName, lastName, email, password, birthDate, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('firstName', firstName)
      .input('lastName', lastName)
      .input('email', email)
      .input('password', hashedPassword)
      .input('birthDate', birthDate)
      .input('role', role)
      .query(`
        INSERT INTO Users (firstName, lastName, email, password, birthDate, role)
        OUTPUT INSERTED.id, INSERTED.email, INSERTED.role
        VALUES (@firstName, @lastName, @email, @password, @birthDate, @role)
      `);

    return result.recordset[0];
  }

  static async findByEmail(email) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE email = @email');
    
    return result.recordset[0];
  }

  static async findById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM Users WHERE id = @id');
    
    return result.recordset[0];
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