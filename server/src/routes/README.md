# API Routes

Este directorio contiene todas las rutas de la API, organizadas de la siguiente manera:

## Estructura de archivos

- `auth.routes.js`: Rutas para autenticación y registro de usuarios
- `users.routes.js`: Rutas para gestión de usuarios (información de perfil, etc.)
- `services.routes.js`: Rutas para gestión de servicios ofrecidos por entrenadores
- `bookings.routes.js`: Rutas para gestión de reservas entre clientes y entrenadores
- `reviews.routes.js`: Rutas para gestión de reseñas de servicios

## Convenciones

### Nomenclatura
- Los nombres de archivos de rutas están en plural (ej: services, bookings, users)
- Se utiliza el formato `resource.routes.js` para todos los archivos

### Middleware de autenticación y autorización
- `authenticate`: Verifica que el usuario esté autenticado
- `authorizeTrainer`: Verifica que el usuario tenga rol de entrenador
- `authorizeClient`: Verifica que el usuario tenga rol de cliente
- `authorizeAdmin`: Verifica que el usuario tenga rol de administrador

### Estructura interna
Cada archivo de rutas sigue esta estructura:
1. Rutas públicas (sin autenticación)
2. Rutas protegidas (requieren autenticación)
3. Rutas con permisos específicos (requieren rol específico)

## Ejemplo de uso

```javascript
const router = require('express').Router();
const Controller = require('../controllers/example.controller');
const { authenticate, authorizeTrainer } = require('../middleware/auth');

// Rutas públicas
router.get('/', Controller.getAll);

// Rutas protegidas (requieren autenticación)
router.get('/my-resources', authenticate, Controller.getMyResources);

// Rutas con permisos específicos
router.post('/', authenticate, authorizeTrainer, Controller.create);

module.exports = router; 