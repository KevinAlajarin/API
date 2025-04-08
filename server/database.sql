-- Crear base de datos
CREATE DATABASE TrainerMarketplace;
GO

USE TrainerMarketplace;
GO

-- Tabla de Usuarios
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    firstName NVARCHAR(50) NOT NULL,
    lastName NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    birthDate DATE NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('client', 'trainer')),
    resetPasswordToken NVARCHAR(255),
    resetPasswordExpires DATETIME,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Tabla de Servicios
CREATE TABLE Services (
    id INT IDENTITY(1,1) PRIMARY KEY,
    trainerId INT NOT NULL,
    category NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    duration INT NOT NULL, -- en minutos
    price DECIMAL(10,2) NOT NULL,
    zone NVARCHAR(100),
    language NVARCHAR(50),
    isVirtual BIT NOT NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (trainerId) REFERENCES Users(id)
);

-- Tabla de Disponibilidad
CREATE TABLE Availability (
    id INT IDENTITY(1,1) PRIMARY KEY,
    trainerId INT NOT NULL,
    dayOfWeek INT NOT NULL, -- 1-7 (Lunes-Domingo)
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    FOREIGN KEY (trainerId) REFERENCES Users(id)
);

-- Tabla de Contrataciones
CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clientId INT NOT NULL,
    serviceId INT NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    scheduledDate DATETIME NOT NULL,
    paymentStatus NVARCHAR(20) NOT NULL CHECK (paymentStatus IN ('pending', 'paid', 'refunded')),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (clientId) REFERENCES Users(id),
    FOREIGN KEY (serviceId) REFERENCES Services(id)
);

-- Tabla de Comentarios
CREATE TABLE Reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bookingId INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    trainerReply NVARCHAR(MAX),
    createdAt DATETIME DEFAULT GETDATE(),
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

-- Tabla de Archivos Compartidos
CREATE TABLE SharedFiles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bookingId INT NOT NULL,
    fileName NVARCHAR(255) NOT NULL,
    filePath NVARCHAR(MAX) NOT NULL,
    uploadedBy INT NOT NULL,
    uploadedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (bookingId) REFERENCES Bookings(id),
    FOREIGN KEY (uploadedBy) REFERENCES Users(id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_services_trainer ON Services(trainerId);
CREATE INDEX idx_bookings_client ON Bookings(clientId);
CREATE INDEX idx_bookings_service ON Bookings(serviceId);
CREATE INDEX idx_reviews_booking ON Reviews(bookingId);
CREATE INDEX idx_views_service ON Views(serviceId); 