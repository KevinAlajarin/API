const User = require('../models/user.model');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class AuthController {
  static async register(req, res) {
    try {
      const { firstName, lastName, email, password, birthDate, role } = req.body;

      // Validar que el email no exista
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Validar contraseña
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial'
        });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        birthDate,
        role
      });

      const token = User.generateToken(user);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = User.generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hora

      // Guardar token en la base de datos
      const pool = await poolPromise;
      await pool.request()
        .input('userId', user.id)
        .input('resetToken', resetToken)
        .input('resetExpires', resetExpires)
        .query(`
          UPDATE Users 
          SET resetPasswordToken = @resetToken,
              resetPasswordExpires = @resetExpires
          WHERE id = @userId
        `);

      // Enviar email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await transporter.sendMail({
        to: user.email,
        subject: 'Recuperación de contraseña',
        html: `
          <p>Hola ${user.firstName},</p>
          <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Este enlace expirará en 1 hora.</p>
        `
      });

      res.json({ message: 'Email de recuperación enviado' });
    } catch (error) {
      res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      const pool = await poolPromise;
      const result = await pool.request()
        .input('token', token)
        .query(`
          SELECT * FROM Users 
          WHERE resetPasswordToken = @token 
          AND resetPasswordExpires > GETDATE()
        `);

      const user = result.recordset[0];
      if (!user) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
      }

      await User.updatePassword(user.id, newPassword);

      // Limpiar tokens
      await pool.request()
        .input('userId', user.id)
        .query(`
          UPDATE Users 
          SET resetPasswordToken = NULL,
              resetPasswordExpires = NULL
          WHERE id = @userId
        `);

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
    }
  }
}

module.exports = AuthController; 