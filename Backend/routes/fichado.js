const express = require('express');
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const { requireGPSValidation, validateGPSLocation } = require('../utils/gpsValidation');
const { formatDateForDB, formatTimeForDB } = require('../utils/timeUtils');

const router = express.Router();

// POST /api/fichado/entrada - Registrar entrada con validación GPS
router.post('/entrada', authenticateToken, requireGPSValidation(true), (req, res) => {
    try {
        const { metodo = 'GPS', latitud, longitud, codigo_qr, observaciones, fecha: fechaApp, hora: horaApp, timestamp } = req.body;
        const usuarioId = req.user.id;
        
        // Usar fecha/hora enviada por la aplicación (ya en zona horaria de Perú) o generar si no se envía
        const fecha = fechaApp || formatDateForDB();
        const horaEntrada = horaApp || formatTimeForDB();
        
        console.log(`📅 Datos recibidos - Fecha: ${fechaApp}, Hora: ${horaApp}, Timestamp: ${timestamp}`);
        console.log(`📅 Datos a usar - Fecha: ${fecha}, Hora: ${horaEntrada}`);

        // Verificar si ya tiene entrada SIN SALIDA (no completada)
        db.get(
            'SELECT id FROM asistencia WHERE usuario_id = ? AND fecha = ? AND hora_entrada IS NOT NULL AND hora_salida IS NULL',
            [usuarioId, fecha],
            (err, entradaAbierta) => {
                if (err) {
                    console.error('Error verificando entrada abierta:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Error interno del servidor'
                    });
                }

                if (entradaAbierta) {
                    console.log(`⚠️ Ya existe entrada sin salida para usuario ${usuarioId} en fecha ${fecha}`);
                    return res.status(400).json({
                        success: false,
                        error: 'Entrada pendiente',
                        message: 'Debes marcar salida antes de registrar nueva entrada'
                    });
                }

                // Registrar nueva entrada - PERMITIR MÚLTIPLES ENTRADAS/SALIDAS EN EL MISMO DÍA
                console.log(`📝 Registrando nueva entrada: Usuario ${usuarioId}, Fecha ${fecha}, Hora ${horaEntrada}`);
                const insertQuery = `
                    INSERT INTO asistencia 
                    (usuario_id, fecha, hora_entrada, latitud, longitud, codigo_qr, metodo_fichado, observaciones)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const observacionesCompletas = [
                    observaciones,
                    req.gpsValidation ? `GPS validado - Distancia: ${req.gpsValidation.distance}m` : null
                ].filter(Boolean).join(' | ');

                console.log(`📌 Datos a insertar:`, { usuarioId, fecha, horaEntrada, latitud, longitud, metodo, observacionesCompletas });

                db.run(
                    insertQuery,
                    [usuarioId, fecha, horaEntrada, latitud, longitud, codigo_qr, metodo, observacionesCompletas],
                    function(err) {
                        if (err) {
                            console.error('❌ Error registrando entrada:', err);
                            return res.status(500).json({
                                success: false,
                                error: 'Error registrando entrada'
                            });
                        }

                        console.log(`✅ Entrada registrada exitosamente! ID: ${this.lastID}`);
                        res.json({
                            success: true,
                            message: 'Entrada registrada correctamente',
                            hora: horaEntrada, // Campo que espera la aplicación móvil
                            data: {
                                id: this.lastID,
                                fecha,
                                hora_entrada: horaEntrada,
                                metodo,
                                usuario: req.user.nombre,
                                gps_validation: req.gpsValidation ? {
                                    distance: req.gpsValidation.distance,
                                    max_distance: req.gpsValidation.maxDistance,
                                    location_valid: req.gpsValidation.isValid
                                } : null
                            }
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error('Error en fichado entrada:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/fichado/salida - Registrar salida con validación GPS opcional
router.post('/salida', authenticateToken, requireGPSValidation(false), (req, res) => {
    try {
        const { latitud, longitud, observaciones, fecha: fechaApp, hora: horaApp, timestamp } = req.body;
        const usuarioId = req.user.id;
        
        // Usar fecha/hora enviada por la aplicación (ya en zona horaria de Perú) o generar si no se envía
        const fecha = fechaApp || formatDateForDB();
        const horaSalida = horaApp || formatTimeForDB();
        
        console.log(`📅 Datos recibidos - Fecha: ${fechaApp}, Hora: ${horaApp}, Timestamp: ${timestamp}`);
        console.log(`📅 Datos a usar - Fecha: ${fecha}, Hora: ${horaSalida}`);

        // Buscar la ÚLTIMA entrada sin salida del día (para soportar múltiples turnos)
        db.get(
            'SELECT * FROM asistencia WHERE usuario_id = ? AND fecha = ? AND hora_entrada IS NOT NULL AND hora_salida IS NULL ORDER BY hora_entrada DESC LIMIT 1',
            [usuarioId, fecha],
            (err, entry) => {
                if (err) {
                    console.error('Error buscando entrada:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Error interno del servidor'
                    });
                }

                if (!entry) {
                    return res.status(400).json({
                        success: false,
                        error: 'Sin entrada registrada',
                        message: 'No tienes una entrada sin salida para hoy'
                    });
                }

                if (entry.hora_salida) {
                    // Esto no debería pasar por la query, pero por seguridad
                    return res.status(400).json({
                        success: false,
                        error: 'Salida ya registrada',
                        message: 'Esta entrada ya tiene salida registrada'
                    });
                }

                // Calcular horas trabajadas
                const horaEntrada = new Date(`${fecha}T${entry.hora_entrada}`);
                const horaSalidaDate = new Date(`${fecha}T${horaSalida}`);
                const horasTrabajadas = ((horaSalidaDate - horaEntrada) / (1000 * 60 * 60)).toFixed(2);

                // Preparar observaciones con información GPS si está disponible
                const observacionesCompletas = [
                    observaciones || 'Salida registrada',
                    req.gpsValidation ? `GPS validado - Distancia: ${req.gpsValidation.distance}m` : null
                ].filter(Boolean).join(' | ');

                // Actualizar registro con salida y coordenadas GPS si están disponibles
                const updateQuery = `
                    UPDATE asistencia 
                    SET hora_salida = ?, 
                        observaciones = COALESCE(observaciones || ' | ', '') || ?,
                        latitud_salida = ?,
                        longitud_salida = ?
                    WHERE id = ?
                `;

                db.run(
                    updateQuery,
                    [horaSalida, observacionesCompletas, latitud || null, longitud || null, entry.id],
                    function(err) {
                        if (err) {
                            console.error('Error registrando salida:', err);
                            return res.status(500).json({
                                success: false,
                                error: 'Error registrando salida'
                            });
                        }

                        res.json({
                            success: true,
                            message: 'Salida registrada correctamente',
                            hora: horaSalida, // Campo que espera la aplicación móvil
                            horasTrabajadas: horasTrabajadas, // Campo adicional para horas trabajadas
                            data: {
                                id: entry.id,
                                fecha,
                                hora_entrada: entry.hora_entrada,
                                hora_salida: horaSalida,
                                horas_trabajadas: parseFloat(horasTrabajadas),
                                usuario: req.user.nombre,
                                gps_validation: req.gpsValidation ? {
                                    distance: req.gpsValidation.distance,
                                    max_distance: req.gpsValidation.maxDistance,
                                    location_valid: req.gpsValidation.isValid
                                } : null
                            }
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error('Error en fichado salida:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/fichado/historial - Obtener historial de fichados con información GPS
router.get('/historial', authenticateToken, (req, res) => {
    try {
        const usuarioId = req.user.id;
        const usuarioRol = req.user.rol;
        const { limite = 30, pagina = 1, fecha_inicio, fecha_fin, mes, anio } = req.query;
        const offset = (pagina - 1) * limite;

        // Construir filtros según el rol del usuario
        let whereClause = '';
        let queryParams = [];

        // Si es Supervisor o Empleador, puede ver todas las asistencias
        // Si es Empleado, solo ve sus propias asistencias
        if (usuarioRol !== 'Supervisor' && usuarioRol !== 'Empleador') {
            whereClause = 'WHERE a.usuario_id = ?';
            queryParams.push(usuarioId);
        } else {
            whereClause = 'WHERE 1=1'; // Condición siempre verdadera para supervisores
        }

        // Filtros de fecha
        if (fecha_inicio) {
            whereClause += ' AND a.fecha >= ?';
            queryParams.push(fecha_inicio);
        }

        if (fecha_fin) {
            whereClause += ' AND a.fecha <= ?';
            queryParams.push(fecha_fin);
        }

        // Filtros por mes y año (para compatibilidad con web panel)
        if (mes && anio) {
            whereClause += ' AND strftime("%m", a.fecha) = ? AND strftime("%Y", a.fecha) = ?';
            queryParams.push(String(mes).padStart(2, '0'), String(anio));
        }

        const query = `
            SELECT
                a.id,
                a.fecha,
                a.hora_entrada,
                a.hora_salida,
                CASE
                    WHEN a.hora_entrada IS NOT NULL AND a.hora_salida IS NOT NULL
                    THEN ROUND((julianday(a.fecha || ' ' || a.hora_salida) - julianday(a.fecha || ' ' || a.hora_entrada)) * 24, 2)
                    ELSE NULL
                END as horas_trabajadas,
                a.latitud,
                a.longitud,
                a.latitud_salida,
                a.longitud_salida,
                a.metodo_fichado,
                a.observaciones,
                a.timestamp_creacion,
                CASE
                    WHEN a.latitud IS NOT NULL AND a.longitud IS NOT NULL
                    THEN 'GPS_DISPONIBLE'
                    ELSE 'SIN_GPS'
                END as estado_gps,
                CASE
                    WHEN TIME(a.hora_entrada) <= '08:00:00' THEN 'PUNTUAL'
                    WHEN TIME(a.hora_entrada) > '08:00:00' AND TIME(a.hora_entrada) <= '08:15:00' THEN 'TARDANZA'
                    WHEN a.hora_entrada IS NULL THEN 'FALTA'
                    ELSE 'TARDANZA'
                END as estado,
                u.nombre,
                u.apellido,
                u.cargo,
                u.area,
                u.email
            FROM asistencia a
            INNER JOIN usuarios u ON a.usuario_id = u.id
            ${whereClause}
            ORDER BY a.fecha DESC, a.hora_entrada DESC
            LIMIT ? OFFSET ?
        `;

        queryParams.push(parseInt(limite), offset);

        db.all(query, queryParams, (err, rows) => {
            if (err) {
                console.error('Error obteniendo historial:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error obteniendo historial'
                });
            }

            // Obtener total de registros para paginación
            const countQuery = `SELECT COUNT(*) as total FROM asistencia a INNER JOIN usuarios u ON a.usuario_id = u.id ${whereClause}`;
            const countParams = queryParams.slice(0, -2); // Remover limite y offset

            db.get(countQuery, countParams, (err, countResult) => {
                if (err) {
                    console.error('Error contando registros:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Error obteniendo historial'
                    });
                }

                // Calcular estadísticas del período
                const totalHoras = rows.reduce((sum, row) => sum + (row.horas_trabajadas || 0), 0);
                const diasTrabajados = rows.filter(row => row.hora_entrada && row.hora_salida).length;
                const registrosIncompletos = rows.filter(row => row.hora_entrada && !row.hora_salida).length;

                res.json({
                    success: true,
                    data: rows,
                    pagination: {
                        total: countResult.total,
                        pagina: parseInt(pagina),
                        limite: parseInt(limite),
                        total_paginas: Math.ceil(countResult.total / limite)
                    },
                    estadisticas: {
                        total_horas_trabajadas: Math.round(totalHoras * 100) / 100,
                        dias_trabajados: diasTrabajados,
                        registros_incompletos: registrosIncompletos,
                        promedio_horas_dia: diasTrabajados > 0 ? Math.round((totalHoras / diasTrabajados) * 100) / 100 : 0
                    }
                });
            });
        });

    } catch (error) {
        console.error('Error en historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/fichado/estado-hoy - Estado del fichado de hoy
router.get('/estado-hoy', authenticateToken, (req, res) => {
    try {
        const usuarioId = req.user.id;
        const fecha = formatDateForDB(); // Usar zona horaria de Perú

        db.get(
            `SELECT 
                id,
                fecha,
                hora_entrada,
                hora_salida,
                CASE 
                    WHEN hora_entrada IS NOT NULL AND hora_salida IS NOT NULL 
                    THEN ROUND((julianday(fecha || ' ' || hora_salida) - julianday(fecha || ' ' || hora_entrada)) * 24, 2)
                    ELSE NULL 
                END as horas_trabajadas,
                metodo_fichado,
                observaciones
            FROM asistencia 
            WHERE usuario_id = ? AND fecha = ?`,
            [usuarioId, fecha],
            (err, row) => {
                if (err) {
                    console.error('Error obteniendo estado de hoy:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Error obteniendo estado'
                    });
                }

                const estado = {
                    fecha,
                    tiene_entrada: false,
                    tiene_salida: false,
                    puede_marcar_entrada: true,
                    puede_marcar_salida: false,
                    horas_trabajadas: 0,
                    registro: null
                };

                if (row) {
                    estado.tiene_entrada = !!row.hora_entrada;
                    estado.tiene_salida = !!row.hora_salida;
                    estado.puede_marcar_entrada = !row.hora_entrada;
                    estado.puede_marcar_salida = !!row.hora_entrada && !row.hora_salida;
                    estado.horas_trabajadas = row.horas_trabajadas || 0;
                    estado.registro = row;
                }

                res.json({
                    success: true,
                    data: estado
                });
            }
        );

    } catch (error) {
        console.error('Error en estado-hoy:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;