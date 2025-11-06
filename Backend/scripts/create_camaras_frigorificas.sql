-- Script para crear la tabla camaras_frigorificas y poblarla con 3 cámaras
-- Ejecutar en el servidor (sqlite3 database.db < create_camaras_frigorificas.sql)

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS camaras_frigorificas (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    temperatura_minima REAL,
    temperatura_maxima REAL,
    ubicacion TEXT,
    activo INTEGER DEFAULT 1
);

-- Insertar 3 cámaras: 2 refrigeración (IDs 1 y 3) y 1 congelación (ID 2)
INSERT OR REPLACE INTO camaras_frigorificas (id, nombre, tipo, temperatura_minima, temperatura_maxima, ubicacion, activo) VALUES
(1, 'REFRIGERACIÓN 1', 'REFRIGERACION', 0.0, 4.0, 'Área de almacenamiento principal', 1),
(2, 'CONGELACIÓN 1', 'CONGELACION', -25.0, -18.0, 'Área de congelados', 1),
(3, 'REFRIGERACIÓN 2', 'REFRIGERACION', 0.0, 4.0, 'Área de almacenamiento secundaria', 1);

COMMIT;

-- Fin del script
