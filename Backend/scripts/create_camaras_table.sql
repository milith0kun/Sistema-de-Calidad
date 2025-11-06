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

-- CONFIGURACIÓN: 3 CÁMARAS (2 Refrigeración + 1 Congelación)
-- Rangos según normas HACCP:
-- REFRIGERACIÓN: 1°C a 4°C (temperatura ideal para productos frescos)
-- CONGELACIÓN: menor a -18°C (temperatura ideal -25°C a -18°C para productos congelados)

INSERT INTO camaras_frigorificas (id, nombre, tipo, temperatura_minima, temperatura_maxima, ubicacion, descripcion) VALUES
(1, 'REFRIGERACIÓN 1', 'REFRIGERACION', 1.0, 4.0, 'Área de almacenamiento principal', 'Cámara de refrigeración para productos frescos'),
(2, 'CONGELACIÓN 1', 'CONGELACION', -25.0, -18.0, 'Área de congelados', 'Cámara de congelación para productos congelados'),
(3, 'REFRIGERACIÓN 2', 'REFRIGERACION', 1.0, 4.0, 'Área de almacenamiento secundaria', 'Cámara de refrigeración adicional');

-- Verificar que los datos se insertaron correctamente
SELECT * FROM camaras_frigorificas WHERE activo = 1;