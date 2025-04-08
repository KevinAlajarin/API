-- Tabla de categorías
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Insertar categorías predefinidas
INSERT INTO categories (name) VALUES
('Yoga'),
('Pilates'),
('Running'),
('Gimnasio'),
('Nutrición');

-- Tabla de zonas
CREATE TABLE zones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Insertar zonas predefinidas
INSERT INTO zones (name) VALUES
('Palermo'),
('Recoleta'),
('Belgrano'),
('Puerto Madero'),
('Caballito'),
('Flores'),
('Nuñez'),
('Almagro');

-- Tabla de duraciones permitidas
CREATE TABLE allowed_durations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    minutes INT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETDATE()
);

-- Insertar duraciones permitidas
INSERT INTO allowed_durations (minutes) VALUES
(15),
(30),
(60),
(90);

-- Modificar tabla de servicios para incluir categoría y duración
ALTER TABLE services
ADD category_id INT,
    duration_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (duration_id) REFERENCES allowed_durations(id);

-- Tabla para relación muchos a muchos entre servicios y zonas
CREATE TABLE service_zones (
    service_id INT,
    zone_id INT,
    PRIMARY KEY (service_id, zone_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- Trigger para limitar a 3 zonas por servicio
CREATE TRIGGER limit_service_zones
ON service_zones
AFTER INSERT
AS
BEGIN
    IF (SELECT COUNT(*) FROM service_zones WHERE service_id IN (SELECT service_id FROM inserted)) > 3
    BEGIN
        RAISERROR('No se pueden asignar más de 3 zonas por servicio', 16, 1);
        ROLLBACK TRANSACTION;
    END
END; 