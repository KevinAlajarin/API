const User = require('../models/user.model');
const { validateUser, validateLogin } = require('../middleware/validation');

class UserController {
  static async register(req, res) {
    try {
      const { firstName, lastName, email, password, birthDate, gender, role } = req.body;
      
      // Verificar que el rol sea válido
      if (role !== 'client' && role !== 'trainer') {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        birthDate,
        gender,
        role
      });

      const token = User.generateToken(user);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user,
        token
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }

      const validPassword = await User.verifyPassword(user.id, password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }

      const token = User.generateToken(user);

      res.json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, birthDate, gender } = req.body;
      let profileImage = req.body.profileImage || null;

      // Aquí podrías manejar la lógica para procesar una imagen subida

      const updatedUser = await User.update(req.user.id, {
        firstName,
        lastName,
        birthDate,
        gender,
        profileImage
      });

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: updatedUser
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verificar la contraseña actual
      const validPassword = await User.verifyPassword(req.user.id, currentPassword);
      if (!validPassword) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      }

      await User.changePassword(req.user.id, newPassword);

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteAccount(req, res) {
    try {
      await User.delete(req.user.id);
      res.json({ message: 'Cuenta eliminada exitosamente' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = UserController; 