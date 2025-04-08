const Service = require('../models/service.model');
const { validateService } = require('../middleware/validation');

class ServiceController {
  static async create(req, res) {
    try {
      const { title, description, price, categoryId, durationId, zones, isVirtual } = req.body;
      const trainerId = req.user.id;

      // Validar que no se excedan las 3 zonas
      if (zones.length > 3) {
        return res.status(400).json({ message: 'No se pueden seleccionar más de 3 zonas' });
      }

      const service = await Service.create({
        trainerId,
        title,
        description,
        price,
        categoryId,
        durationId,
        zones,
        isVirtual
      });

      res.status(201).json({ message: 'Servicio creado exitosamente', service });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, price, categoryId, durationId, zones, isVirtual } = req.body;

      // Validar que no se excedan las 3 zonas
      if (zones.length > 3) {
        return res.status(400).json({ message: 'No se pueden seleccionar más de 3 zonas' });
      }

      const service = await Service.update(id, {
        title,
        description,
        price,
        categoryId,
        durationId,
        zones,
        isVirtual
      });

      res.json({ message: 'Servicio actualizado exitosamente', service });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await Service.delete(id);
      res.json({ message: 'Servicio eliminado exitosamente' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({ message: 'Servicio no encontrado' });
      }
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const filters = {
        categoryId: req.query.categoryId,
        zoneId: req.query.zoneId,
        durationId: req.query.durationId,
        isVirtual: req.query.isVirtual ? req.query.isVirtual === 'true' : undefined,
        orderBy: req.query.orderBy
      };

      const services = await Service.findAll(filters);
      res.json(services);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await Service.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getZones(req, res) {
    try {
      const zones = await Service.getZones();
      res.json(zones);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getDurations(req, res) {
    try {
      const durations = await Service.getDurations();
      res.json(durations);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = ServiceController; 