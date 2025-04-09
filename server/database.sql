-- Crear base de datos
CREATE DATABASE TrainerMarketplace;
GO

USE TrainerMarketplace;
GO

-- Tabla de Usuarios
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    firstName NVARCHAR(50) NOT NULL,
    lastName NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    birthDate DATE NOT NULL,
    gender NVARCHAR(20) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('client', 'trainer')),
    profilePicture NVARCHAR(MAX),
    phoneNumber NVARCHAR(20),
    bio NVARCHAR(MAX),
    experienceYears INT,
    certifications NVARCHAR(MAX),
    resetPasswordToken NVARCHAR(255),
    resetPasswordExpires DATETIME,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Tabla de Categorías
CREATE TABLE Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX),
    icon NVARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE()
);

-- Tabla de Zonas
CREATE TABLE Zones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    createdAt DATETIME DEFAULT GETDATE()
);

-- Tabla de Duración Permitida
CREATE TABLE AllowedDurations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    minutes INT NOT NULL,
    description NVARCHAR(100),
    createdAt DATETIME DEFAULT GETDATE()
);

-- Tabla de Servicios
CREATE TABLE Services (
    id INT IDENTITY(1,1) PRIMARY KEY,
    trainerId INT NOT NULL,
    categoryId INT NOT NULL,
    title NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    durationId INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    isVirtual BIT NOT NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (trainerId) REFERENCES Users(id),
    FOREIGN KEY (categoryId) REFERENCES Categories(id),
    FOREIGN KEY (durationId) REFERENCES AllowedDurations(id)
);

-- Tabla de Relación Servicio-Zona
CREATE TABLE ServiceZones (
    serviceId INT NOT NULL,
    zoneId INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (serviceId, zoneId),
    FOREIGN KEY (serviceId) REFERENCES Services(id),
    FOREIGN KEY (zoneId) REFERENCES Zones(id)
);

-- Tabla de Horarios de Trabajo
CREATE TABLE WorkSchedules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    trainerId INT NOT NULL,
    dayOfWeek INT NOT NULL,
    isAvailable BIT DEFAULT 1,
    startTime TIME,
    endTime TIME,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (trainerId) REFERENCES Users(id)
);

-- Tabla de Contrataciones
CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clientId INT NOT NULL,
    serviceId INT NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    scheduledDate DATETIME NOT NULL,
    notes NVARCHAR(MAX),
    paymentStatus NVARCHAR(20) NOT NULL CHECK (paymentStatus IN ('pending', 'paid', 'refunded')),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (clientId) REFERENCES Users(id),
    FOREIGN KEY (serviceId) REFERENCES Services(id)
);

-- Tabla de Pagos
CREATE TABLE Payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bookingId INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paymentMethod NVARCHAR(50) NOT NULL,
    transactionId NVARCHAR(100),
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (bookingId) REFERENCES Bookings(id)
);

-- Tabla de Comentarios
CREATE TABLE Reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bookingId INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    trainerReply NVARCHAR(MAX),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (bookingId) REFERENCES Bookings(id)
);

-- Tabla de Visualizaciones
CREATE TABLE Views (
    id INT IDENTITY(1,1) PRIMARY KEY,
    serviceId INT NOT NULL,
    clientId INT,
    viewedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (serviceId) REFERENCES Services(id),
    FOREIGN KEY (clientId) REFERENCES Users(id)
);

-- Tabla de Favoritos
CREATE TABLE Favorites (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    serviceId INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (serviceId) REFERENCES Services(id),
    UNIQUE (userId, serviceId)
);

-- Tabla de Mensajes
CREATE TABLE Messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    bookingId INT NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    isRead BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (senderId) REFERENCES Users(id),
    FOREIGN KEY (receiverId) REFERENCES Users(id),
    FOREIGN KEY (bookingId) REFERENCES Bookings(id)
);

-- Tabla de Notificaciones
CREATE TABLE Notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    type NVARCHAR(50) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    isRead BIT DEFAULT 0,
    relatedId INT,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Tabla de Métricas de Servicio
CREATE TABLE ServiceMetrics (
    id INT IDENTITY(1,1) PRIMARY KEY,
    serviceId INT NOT NULL,
    totalBookings INT DEFAULT 0,
    averageRating DECIMAL(3,2),
    totalReviews INT DEFAULT 0,
    totalViews INT DEFAULT 0,
    lastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (serviceId) REFERENCES Services(id)
);

-- Tabla de Archivos Compartidos
CREATE TABLE SharedFiles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bookingId INT NOT NULL,
    fileName NVARCHAR(255) NOT NULL,
    filePath NVARCHAR(MAX) NOT NULL,
    fileType NVARCHAR(50) NOT NULL,
    fileSize INT NOT NULL, -- en bytes
    uploadedBy INT NOT NULL,
    uploadedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (bookingId) REFERENCES Bookings(id),
    FOREIGN KEY (uploadedBy) REFERENCES Users(id)
);

-- Triggers para actualizar updatedAt
CREATE TRIGGER trg_Users_Update
ON Users
AFTER UPDATE
AS
BEGIN
    UPDATE Users
    SET updatedAt = GETDATE()
    FROM Users
    INNER JOIN inserted ON Users.id = inserted.id;
END;

CREATE TRIGGER trg_Services_Update
ON Services
AFTER UPDATE
AS
BEGIN
    UPDATE Services
    SET updatedAt = GETDATE()
    FROM Services
    INNER JOIN inserted ON Services.id = inserted.id;
END;

CREATE TRIGGER trg_WorkSchedules_Update
ON WorkSchedules
AFTER UPDATE
AS
BEGIN
    UPDATE WorkSchedules
    SET updatedAt = GETDATE()
    FROM WorkSchedules
    INNER JOIN inserted ON WorkSchedules.id = inserted.id;
END;

CREATE TRIGGER trg_Bookings_Update
ON Bookings
AFTER UPDATE
AS
BEGIN
    UPDATE Bookings
    SET updatedAt = GETDATE()
    FROM Bookings
    INNER JOIN inserted ON Bookings.id = inserted.id;
END;

CREATE TRIGGER trg_Reviews_Update
ON Reviews
AFTER UPDATE
AS
BEGIN
    UPDATE Reviews
    SET updatedAt = GETDATE()
    FROM Reviews
    INNER JOIN inserted ON Reviews.id = inserted.id;
END;

CREATE TRIGGER trg_Payments_Update
ON Payments
AFTER UPDATE
AS
BEGIN
    UPDATE Payments
    SET updatedAt = GETDATE()
    FROM Payments
    INNER JOIN inserted ON Payments.id = inserted.id;
END;

-- Trigger para actualizar métricas de servicio
CREATE TRIGGER trg_Reviews_ServiceMetrics
ON Reviews
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- Actualizar métricas del servicio
    UPDATE ServiceMetrics
    SET totalReviews = (
        SELECT COUNT(*) 
        FROM Reviews r
        JOIN Bookings b ON r.bookingId = b.id
        WHERE b.serviceId = ServiceMetrics.serviceId
    ),
    averageRating = (
        SELECT AVG(CAST(rating AS FLOAT))
        FROM Reviews r
        JOIN Bookings b ON r.bookingId = b.id
        WHERE b.serviceId = ServiceMetrics.serviceId
    ),
    lastUpdated = GETDATE()
    FROM ServiceMetrics
    JOIN inserted i ON ServiceMetrics.serviceId = i.serviceId;
END;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_services_trainer ON Services(trainerId);
CREATE INDEX idx_services_category ON Services(categoryId);
CREATE INDEX idx_services_active ON Services(isActive);
CREATE INDEX idx_service_zones_service ON ServiceZones(serviceId);
CREATE INDEX idx_service_zones_zone ON ServiceZones(zoneId);
CREATE INDEX idx_allowed_durations_minutes ON AllowedDurations(minutes);
CREATE INDEX idx_workschedules_trainer ON WorkSchedules(trainerId);
CREATE INDEX idx_bookings_client ON Bookings(clientId);
CREATE INDEX idx_bookings_service ON Bookings(serviceId);
CREATE INDEX idx_bookings_status ON Bookings(status);
CREATE INDEX idx_bookings_date ON Bookings(scheduledDate);
CREATE INDEX idx_payments_booking ON Payments(bookingId);
CREATE INDEX idx_payments_status ON Payments(status);
CREATE INDEX idx_reviews_booking ON Reviews(bookingId);
CREATE INDEX idx_reviews_rating ON Reviews(rating);
CREATE INDEX idx_views_service ON Views(serviceId);
CREATE INDEX idx_views_date ON Views(viewedAt);
CREATE INDEX idx_favorites_user ON Favorites(userId);
CREATE INDEX idx_messages_booking ON Messages(bookingId);
CREATE INDEX idx_messages_sender ON Messages(senderId);
CREATE INDEX idx_messages_receiver ON Messages(receiverId);
CREATE INDEX idx_notifications_user ON Notifications(userId);
CREATE INDEX idx_notifications_type ON Notifications(type);
CREATE INDEX idx_servicemetrics_service ON ServiceMetrics(serviceId);
CREATE INDEX idx_sharedfiles_booking ON SharedFiles(bookingId); 