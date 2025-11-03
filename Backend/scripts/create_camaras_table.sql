-- Script para crear la tabla camaras_frigorificas con rangos HACCP correctos
-- Ejecutar en el servidor de base de datos

CREATE TABLE IF NOT EXISTS camaras_frigorificas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('REFRIGERACION', 'CONGELACION')),
    temperatura_minima REAL NOT NULL,
    temperatura_maxima REAL NOT NULL,
    ubicacion TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar las cámaras con rangos de temperatura según estándares HACCP
-- REFRIGERACIÓN: 0°C a 4°C (32°F a 39°F)
-- CONGELACIÓN: -18°C a -15°C (0°F a 5°F)

INSERT INTO camaras_frigorificas (id, nombre, tipo, temperatura_minima, temperatura_maxima, ubicacion, descripcion) VALUES
(1, 'REFRIGERACIÓN 1', 'REFRIGERACION', 0.0, 4.0, 'Área de almacenamiento principal', 'Cámara de refrigeración para productos frescos'),
(2, 'CONGELACIÓN 1', 'CONGELACION', -18.0, -15.0, 'Área de congelados', 'Cámara de congelación para productos congelados'),
(3, 'REFRIGERACIÓN 2', 'REFRIGERACION', 0.0, 4.0, 'Área de almacenamiento secundaria', 'Cámara de refrigeración adicional');

-- Verificar que los datos se insertaron correctamente
SELECT * FROM camaras_frigorificas WHERE activo = 1;