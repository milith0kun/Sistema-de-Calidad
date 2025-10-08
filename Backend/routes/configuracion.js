// Rutas para configuración del sistema - HACCP Wino
// Solo accesible para Admin y Supervisor

const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * Middleware para verificar que el usuario sea Supervisor
 */
function requireAdminOrSupervisor(req, res, next) {
    if (req.user.rol !== 'supervisor') {
        return res.status(403).json({
            success: false,
            error: 'ACCESO_DENEGADO',
            message: 'Solo supervisores pueden acceder a la configuración'
        });
    }
    next();
}

/**
 * GET /api/configuracion/gps
 * Obtiene la configuración GPS actual para fichado
 */
router.get('/gps', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM configuracion_gps WHERE id = 1';
    
    db.get(query, (err, row) => {
        if (err) {
            console.error('Error al obtener configuración GPS:', err);
            return res.status(500).json({
                success: false,
                error: 'DATABASE_ERROR',
                message: 'Error al obtener la configuración GPS'
            });
        }

        if (!row) {
            // Si no existe configuración, devolver valores por defecto
            return res.json({
                success: true,
                data: {
                    id: null,
                    latitud: null,
                    longitud: null,
                    radio_metros: 100,
                    nombre: 'Sin configurar'
                },
                message: 'No hay configuración GPS. Por favor, configure la ubicación.'
            });
        }

        res.json({
            success: true,
            data: {
                id: row.id,
                latitud: row.latitud,
                longitud: row.longitud,
                radio_metros: row.radio_metros,
                nombre: row.nombre
            }
        });
    });
});

/**
 * POST /api/configuracion/gps
 * Actualiza la configuración GPS para fichado
 * Solo Admin y Supervisor pueden modificar
 */
router.post('/gps', authenticateToken, requireAdminOrSupervisor, (req, res) => {
    const { latitud, longitud, radio_metros, nombre } = req.body;

    // Validar datos requeridos
    if (latitud === undefined || longitud === undefined) {
        return res.status(400).json({
            success: false,
            error: 'DATOS_INVALIDOS',
            message: 'Latitud y longitud son requeridas'
        });
    }

    // Validar rangos
    if (latitud < -90 || latitud > 90) {
        return res.status(400).json({
            success: false,
            error: 'LATITUD_INVALIDA',
            message: 'La latitud debe estar entre -90 y 90'
        });
    }

    if (longitud < -180 || longitud > 180) {
        return res.status(400).json({
            success: false,
            error: 'LONGITUD_INVALIDA',
            message: 'La longitud debe estar entre -180 y 180'
        });
    }

    const radioMetros = radio_metros || 100;
    if (radioMetros < 10 || radioMetros > 10000) {
        return res.status(400).json({
            success: false,
            error: 'RADIO_INVALIDO',
            message: 'El radio debe estar entre 10 y 10000 metros'
        });
    }

    const nombreUbicacion = nombre || 'Ubicación de trabajo';

    // Crear tabla si no existe
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS configuracion_gps (
            id INTEGER PRIMARY KEY,
            latitud REAL NOT NULL,
            longitud REAL NOT NULL,
            radio_metros INTEGER NOT NULL DEFAULT 100,
            nombre TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error al crear tabla configuracion_gps:', err);
            return res.status(500).json({
                success: false,
                error: 'DATABASE_ERROR',
                message: 'Error al preparar la base de datos'
            });
        }

        // Insertar o actualizar configuración (sin updated_at para compatibilidad)
        const upsertQuery = `
            INSERT INTO configuracion_gps (id, latitud, longitud, radio_metros, nombre)
            VALUES (1, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                latitud = excluded.latitud,
                longitud = excluded.longitud,
                radio_metros = excluded.radio_metros,
                nombre = excluded.nombre
        `;

        db.run(upsertQuery, [latitud, longitud, radioMetros, nombreUbicacion], function(err) {
            if (err) {
                console.error('Error al actualizar configuración GPS:', err);
                return res.status(500).json({
                    success: false,
                    error: 'DATABASE_ERROR',
                    message: 'Error al guardar la configuración GPS',
                    details: err.message
                });
            }

            // Registrar en log de auditoría
            const logQuery = `
                INSERT INTO auditoria_logs (usuario_id, accion, detalles, ip_address, user_agent, timestamp)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;

            const detalles = JSON.stringify({
                latitud,
                longitud,
                radio_metros: radioMetros,
                nombre: nombreUbicacion,
                accion: 'Actualización de configuración GPS'
            });

            db.run(logQuery, [
                req.user.id,
                'ACTUALIZAR_CONFIG_GPS',
                detalles,
                req.ip || 'unknown',
                req.headers['user-agent'] || 'unknown'
            ], (logErr) => {
                if (logErr) {
                    console.error('Error al registrar log de auditoría:', logErr);
                }
            });

            // Devolver configuración actualizada
            res.json({
                success: true,
                message: 'Configuración GPS actualizada correctamente',
                data: {
                    id: 1,
                    latitud,
                    longitud,
                    radio_metros: radioMetros,
                    nombre: nombreUbicacion
                }
            });
        });
    });
});

/**
 * GET /api/configuracion/roles
 * Obtiene la configuración de roles del sistema
 */
router.get('/roles', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            roles_disponibles: ['colaborador', 'supervisor'],
            acceso_webpanel: ['supervisor'],
            acceso_app_movil: ['colaborador', 'supervisor'],
            puede_configurar_gps: ['supervisor'],
            puede_gestionar_usuarios: ['supervisor'],
            puede_ver_reportes: ['supervisor'],
            puede_firmar_haccp: ['supervisor']
        }
    });
});

module.exports = router;
