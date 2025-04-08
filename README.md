# Trainer Marketplace

Marketplace para entrenadores personales donde pueden ofrecer sus servicios y los clientes pueden contratarlos.

## Características Principales

- Registro y autenticación de usuarios (clientes y entrenadores)
- Búsqueda de servicios con múltiples filtros
- Sistema de contratación y pagos
- Sistema de calificaciones y comentarios
- Gestión de horarios y disponibilidad
- Compartición de archivos entre entrenadores y clientes
- Estadísticas para entrenadores

## Tecnologías Utilizadas

### Backend
- Node.js
- Express
- SQL Server
- JWT para autenticación
- Swagger para documentación de API

### Frontend (Próximamente)
- React
- HTML/CSS
- JavaScript

## Requisitos Previos

- Node.js (v14 o superior)
- SQL Server
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone [url-del-repositorio]
cd trainer-marketplace
```

2. Instalar dependencias del servidor:
```bash
cd server
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la carpeta `server` con las siguientes variables:
```
PORT=3000
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_SERVER=localhost
DB_NAME=TrainerMarketplace
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=24h
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_email
STRIPE_SECRET_KEY=tu_clave_stripe
```

4. Configurar la base de datos:
- Ejecutar el script `database.sql` en SQL Server
- Asegurarse de que el servidor SQL esté corriendo

5. Iniciar el servidor:
```bash
npm run dev
```

## Documentación de la API

La documentación de la API está disponible en:
```
http://localhost:3000/api-docs
```

## Estructura del Proyecto

```
trainer-marketplace/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── index.js
│   ├── database.sql
│   ├── package.json
│   └── .env
└── client/
    └── (próximamente)
```

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 