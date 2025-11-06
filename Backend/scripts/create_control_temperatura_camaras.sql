-- Script para crear la tabla control_temperatura_camaras
-- Esta tabla almacena los registros de temperatura de cámaras frigoríficas
-- Soporta 2 turnos diarios (mañana y tarde) con registros separados por turno

CREATE TABLE IF NOT EXISTS control_temperatura_camaras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Información temporal
    mes INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    dia INTEGER NOT NULL,
    fecha DATE NOT NULL,
    
    -- Referencia a la cámara
    camara_id INTEGER NOT NULL,
    
    -- TURNO MAÑANA (08:00)
    hora_manana TIME DEFAULT '08:00',
    temperatura_manana REAL,
    responsable_manana_id INTEGER,
    responsable_manana_nombre TEXT,
    conformidad_manana TEXT CHECK(conformidad_manana IN ('C', 'NC')),
    
    -- TURNO TARDE (16:00)
    hora_tarde TIME DEFAULT '16:00',
    temperatura_tarde REAL,
    responsable_tarde_id INTEGER,
    responsable_tarde_nombre TEXT,
    conformidad_tarde TEXT CHECK(conformidad_tarde IN ('C', 'NC')),
    
    -- Campos comunes
    acciones_correctivas TEXT,
    supervisor_id INTEGER,
    supervisor_nombre TEXT,
    
    -- Auditoría
    timestamp_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    timestamp_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones
    FOREIGN KEY (camara_id) REFERENCES camaras_frigorificas(id),
    FOREIGN KEY (responsable_manana_id) REFERENCES usuarios(id),
    FOREIGN KEY (responsable_tarde_id) REFERENCES usuarios(id),
    FOREIGN KEY (supervisor_id) REFERENCES usuarios(id),
    
    -- Constraint: Una cámara solo puede tener un registro por día
    UNIQUE(camara_id, fecha)
);

-- Índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_control_temp_camaras_fecha ON control_temperatura_camaras(fecha);
CREATE INDEX IF NOT EXISTS idx_control_temp_camaras_camara ON control_temperatura_camaras(camara_id);
CREATE INDEX IF NOT EXISTS idx_control_temp_camaras_camara_fecha ON control_temperatura_camaras(camara_id, fecha);

-- Trigger para actualizar timestamp_actualizacion
CREATE TRIGGER IF NOT EXISTS update_control_temp_camaras_timestamp
AFTER UPDATE ON control_temperatura_camaras
FOR EACH ROW
BEGIN
    UPDATE control_temperatura_camaras
    SET timestamp_actualizacion = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- Verificar estructura de la tabla
PRAGMA table_info(control_temperatura_camaras);
