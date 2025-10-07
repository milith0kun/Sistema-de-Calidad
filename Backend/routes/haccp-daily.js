// =====================================================
// RUTAS HACCP DIARIAS - Sistema de Calidad
// Endpoints para obtener datos específicos por día (00:00 a 00:00)
// =====================================================

const express = require('express');
const router = express.Router();
const { db } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const { 
    getCurrentPeruDate, 
    formatDateForDB, 
    getDayRange, 
    getCustomDateRange, 
    getDayFilterSQL,
    isToday 
} = require('../utils/timeUtils');

// =====================================================
// ENDPOINT PRINCIPAL - DATOS DEL DÍA ACTUAL
// =====================================================

/**
 * Obtiene todos los datos HACCP del día actual (00:00 a 00:00)
 * GET /api/haccp-daily/today
 */
router.get('/today', authenticateToken, async (req, res) => {
    console.log('=== OBTENIENDO DATOS DEL DÍA ACTUAL ===');
    
    try {
        const { fecha } = req.query; // Opcional: fecha específica en formato YYYY-MM-DD
        const fechaConsulta = fecha || formatDateForDB();
        
        console.log('Fecha de consulta:', fechaConsulta);

        // Obtener datos de cada tabla para la fecha especificada
        const recepcionMercaderia = await db.all(`
            SELECT * FROM control_recepcion_mercaderia 
            WHERE DATE(timestamp_creacion) = ?
            ORDER BY timestamp_creacion DESC
        `, [fechaConsulta]);

        const controlCoccion = await db.all(`
            SELECT * FROM control_coccion 
            WHERE DATE(timestamp_creacion) = ?
            ORDER BY timestamp_creacion DESC
        `, [fechaConsulta]);

        const lavadoFrutas = await db.all(`
            SELECT * FROM control_lavado_desinfeccion_frutas 
            WHERE DATE(timestamp_creacion) = ?
            ORDER BY timestamp_creacion DESC
        `, [fechaConsulta]);

        const lavadoManos = await db.all(`
            SELECT * FROM control_lavado_manos 
            WHERE DATE(timestamp_creacion) = ?
            ORDER BY timestamp_creacion DESC
        `, [fechaConsulta]);

        const temperaturaCamaras = await db.all(`
            SELECT * FROM control_temperatura_camaras 
            WHERE DATE(timestamp_creacion) = ?
            ORDER BY timestamp_creacion DESC
        `, [fechaConsulta]);

        const resultado = {
            success: true,
            fecha: fechaConsulta,
            es_hoy: isToday(fechaConsulta),
            data: {
                recepcion_mercaderia: {
                    total: recepcionMercaderia.length,
                    registros: recepcionMercaderia
                },
                control_coccion: {
                    total: controlCoccion.length,
                    registros: controlCoccion
                },
                lavado_frutas: {
                    total: lavadoFrutas.length,
                    registros: lavadoFrutas
                },
                lavado_manos: {
                    total: lavadoManos.length,
                    registros: lavadoManos
                },
                temperatura_camaras: {
                    total: temperaturaCamaras.length,
                    registros: temperaturaCamaras
                }
            },
            resumen: {
                total_registros: recepcionMercaderia.length + controlCoccion.length + 
                               lavadoFrutas.length + lavadoManos.length + temperaturaCamaras.length,
                ultima_actualizacion: new Date().toISOString()
            }
        };

        console.log('✅ Datos del día obtenidos exitosamente');
        console.log('Total de registros:', resultado.resumen.total_registros);

        res.json(resultado);

    } catch (error) {
        console.error('❌ Error al obtener datos del día:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener datos del día actual',
            details: error.message
        });
    }
});

// =====================================================
// ENDPOINTS ESPECÍFICOS POR FORMULARIO
// =====================================================

/**
 * Obtiene datos de recepción de mercadería del día actual
 * GET /api/haccp-daily/recepcion-mercaderia
 */
router.get('/recepcion-mercaderia', authenticateToken, async (req, res) => {
    try {
        const { fecha, tipo_control } = req.query;
        const fechaConsulta = fecha || formatDateForDB();
        
        let query = `SELECT * FROM control_recepcion_mercaderia WHERE fecha = ?`;
        let params = [fechaConsulta];

        if (tipo_control) {
            query += ` AND tipo_control = ?`;
            params.push(tipo_control);
        }

        query += ` ORDER BY timestamp_creacion DESC`;

        const registros = await db.all(query, params);

        res.json({
            success: true,
            fecha: fechaConsulta,
            tipo_control: tipo_control || 'TODOS',
            data: registros,
            total: registros.length
        });

    } catch (error) {
        console.error('Error al obtener recepción de mercadería del día:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener datos de recepción de mercadería'
        });
    }
});

/**
 * Obtiene datos de control de cocción del día actual
 * GET /api/haccp-daily/control-coccion
 */
router.get('/control-coccion', authenticateToken, async (req, res) => {
    try {
        const { fecha } = req.query;
        const fechaConsulta = fecha || formatDateForDB();
        
        const registros = await db.all(
            `SELECT * FROM control_coccion WHERE fecha = ? ORDER BY timestamp_creacion DESC`,
            [fechaConsulta]
        );

        res.json({
            success: true,
            fecha: fechaConsulta,
            data: registros,
            total: registros.length
        });

    } catch (error) {
        console.error('Error al obtener control de cocción del día:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener datos de control de cocción'
        });
    }
});

/**
 * Obtiene datos de lavado de frutas del día actual
 * GET /api/haccp-daily/lavado-frutas
 */
router.get('/lavado-frutas', authenticateToken, async (req, res) => {
    try {
        const { fecha } = req.query;
        const fechaConsulta = fecha || formatDateForDB();
        
        const registros = await db.all(
            `SELECT * FROM control_lavado_desinfeccion_frutas WHERE fecha = ? ORDER BY timestamp_creacion DESC`,
            [fechaConsulta]
        );

        res.json({
            success: true,
            fecha: fechaConsulta,
            data: registros,
            total: registros.length
        });

    } catch (error) {
        console.error('Error al obtener lavado de frutas del día:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener datos de lavado de frutas'
        });
    }
});

/**
 * Obtiene datos de lavado de manos del día actual
 * GET /api/haccp-daily/lavado-manos
 */
router.get('/lavado-manos', authenticateToken, async (req, res) => {
    try {
        const { fecha } = req.query;
        const fechaConsulta = fecha || formatDateForDB();
        
        const registros = await db.all(
            `SELECT * FROM control_lavado_manos WHERE fecha = ? ORDER BY timestamp_creacion DESC`,
            [fechaConsulta]
        );

        res.json({
            success: true,
            fecha: fechaConsulta,
            data: registros,
            total: registros.length
        });

    } catch (error) {
        console.error('Error al obtener lavado de manos del día:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener datos de lavado de manos'
        });
    }
});

/**
 * Obtiene datos de temperatura de cámaras del día actual
 * GET /api/haccp-daily/temperatura-camaras
 */
router.get('/temperatura-camaras', authenticateToken, async (req, res) => {
    try {
        const { fecha } = req.query;
        const fechaConsulta = fecha || formatDateForDB();
        
        const registros = await db.all(
            `SELECT * FROM control_temperatura_camaras WHERE fecha = ? ORDER BY timestamp_creacion DESC`,
            [fechaConsulta]
        );

        res.json({
            success: true,
            fecha: fechaConsulta,
            data: registros,
            total: registros.length
        });

    } catch (error) {
        console.error('Error al obtener temperatura de cámaras del día:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener datos de temperatura de cámaras'
        });
    }
});

// =====================================================
// ENDPOINTS DE RESUMEN Y ESTADÍSTICAS
// =====================================================

/**
 * Obtiene resumen estadístico del día actual
 * GET /api/haccp-daily/resumen
 */
router.get('/resumen', authenticateToken, async (req, res) => {
    try {
        const { fecha } = req.query;
        const fechaConsulta = fecha || formatDateForDB();
        
        // Contar registros por tabla
        const conteos = await Promise.all([
            db.get(`SELECT COUNT(*) as count FROM control_recepcion_mercaderia WHERE fecha = ?`, [fechaConsulta]),
            db.get(`SELECT COUNT(*) as count FROM control_coccion WHERE fecha = ?`, [fechaConsulta]),
            db.get(`SELECT COUNT(*) as count FROM control_lavado_desinfeccion_frutas WHERE fecha = ?`, [fechaConsulta]),
            db.get(`SELECT COUNT(*) as count FROM control_lavado_manos WHERE fecha = ?`, [fechaConsulta]),
            db.get(`SELECT COUNT(*) as count FROM control_temperatura_camaras WHERE fecha = ?`, [fechaConsulta])
        ]);

        const resumen = {
            success: true,
            fecha: fechaConsulta,
            es_hoy: isToday(fechaConsulta),
            estadisticas: {
                recepcion_mercaderia: conteos[0].count,
                control_coccion: conteos[1].count,
                lavado_frutas: conteos[2].count,
                lavado_manos: conteos[3].count,
                temperatura_camaras: conteos[4].count,
                total_registros: conteos.reduce((sum, item) => sum + item.count, 0)
            },
            ultima_consulta: new Date().toISOString()
        };

        res.json(resumen);

    } catch (error) {
        console.error('Error al obtener resumen del día:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener resumen del día'
        });
    }
});

// =====================================================
// ENDPOINT DE PRUEBA - SIN AUTENTICACIÓN
// =====================================================

/**
 * Endpoint temporal para obtener usuarios
 * GET /api/haccp-daily/usuarios
 */
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await db.all('SELECT id, email, nombre, apellido, cargo, area FROM usuarios');
        res.json({
            success: true,
            usuarios,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error obteniendo usuarios', details: error.message });
    }
});

/**
 * Endpoint para verificar estructura de tablas HACCP
 * GET /api/haccp-daily/estructura-tablas
 */
router.get('/estructura-tablas', async (req, res) => {
    try {
        const tablas = [
            'control_recepcion_mercaderia',
            'control_coccion', 
            'control_lavado_desinfeccion_frutas',
            'control_lavado_manos',
            'control_temperatura_camaras'
        ];
        
        const estructuras = {};
        
        for (const tabla of tablas) {
            try {
                const estructura = await db.all(`PRAGMA table_info(${tabla})`);
                const muestra = await db.all(`SELECT * FROM ${tabla} LIMIT 1`);
                estructuras[tabla] = {
                    columnas: estructura.map(col => ({
                        nombre: col.name,
                        tipo: col.type,
                        notnull: col.notnull,
                        pk: col.pk
                    })),
                    muestra: muestra[0] || null
                };
            } catch (error) {
                estructuras[tabla] = { error: error.message };
            }
        }
        
        res.json({
            success: true,
            estructuras,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error verificando estructura:', error);
        res.status(500).json({ error: 'Error verificando estructura', details: error.message });
    }
});

/**
 * Endpoint temporal sin autenticación para probar funcionalidad principal
 * GET /api/haccp-daily/today-test
 */
router.get('/today-test', async (req, res) => {
    console.log('=== ENDPOINT DE PRUEBA SIN AUTENTICACIÓN ===');
    
    try {
        const { fecha } = req.query;
        const fechaConsulta = fecha || formatDateForDB();
        
        console.log('Fecha de consulta (sin auth):', fechaConsulta);

        // Obtener datos de todas las tablas HACCP para el día especificado
        const dayFilter = getDayFilterSQL(fechaConsulta);
        
        // 1. Recepción de Mercadería
        const recepcionMercaderia = await db.all(
            `SELECT * FROM control_recepcion_mercaderia WHERE ${dayFilter.query} ORDER BY timestamp_creacion DESC`,
            dayFilter.params
        );

        // 2. Control de Cocción
        const controlCoccion = await db.all(
            `SELECT * FROM control_coccion WHERE ${dayFilter.query} ORDER BY timestamp_creacion DESC`,
            dayFilter.params
        );

        // 3. Lavado de Frutas
        const lavadoFrutas = await db.all(
            `SELECT * FROM control_lavado_desinfeccion_frutas WHERE ${dayFilter.query} ORDER BY timestamp_creacion DESC`,
            dayFilter.params
        );

        // 4. Lavado de Manos
        const lavadoManos = await db.all(
            `SELECT * FROM control_lavado_manos WHERE ${dayFilter.query} ORDER BY timestamp_creacion DESC`,
            dayFilter.params
        );

        // 5. Control de Temperatura de Cámaras
        const temperaturaCamaras = await db.all(
            `SELECT * FROM control_temperatura_camaras WHERE ${dayFilter.query} ORDER BY timestamp_creacion DESC`,
            dayFilter.params
        );

        const resultado = {
            success: true,
            fecha: fechaConsulta,
            es_hoy: isToday(fechaConsulta),
            data: {
                recepcion_mercaderia: {
                    total: recepcionMercaderia.length,
                    registros: recepcionMercaderia
                },
                control_coccion: {
                    total: controlCoccion.length,
                    registros: controlCoccion
                },
                lavado_frutas: {
                    total: lavadoFrutas.length,
                    registros: lavadoFrutas
                },
                lavado_manos: {
                    total: lavadoManos.length,
                    registros: lavadoManos
                },
                temperatura_camaras: {
                    total: temperaturaCamaras.length,
                    registros: temperaturaCamaras
                }
            },
            resumen: {
                total_registros: recepcionMercaderia.length + controlCoccion.length + 
                               lavadoFrutas.length + lavadoManos.length + temperaturaCamaras.length,
                ultima_actualizacion: new Date().toISOString()
            }
        };

        console.log('✅ Datos del día obtenidos exitosamente (sin auth)');
        console.log('Total de registros:', resultado.resumen.total_registros);

        res.json(resultado);

    } catch (error) {
        console.error('❌ Error al obtener datos del día (sin auth):', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener datos del día actual',
            details: error.message
        });
    }
});

/**
 * Endpoint de prueba para verificar que el sistema funciona
 * GET /api/haccp-daily/test
 */
router.get('/test', async (req, res) => {
    console.log('=== ENDPOINT DE PRUEBA - DATOS DIARIOS ===');
    
    try {
        const { fecha } = req.query; // Obtener fecha de la query
        const fechaConsulta = fecha || formatDateForDB();
        const dayFilter = getDayFilterSQL(fechaConsulta);
        
        // Obtener un conteo simple de registros del día actual
        const recepcionCount = await db.get(
            `SELECT COUNT(*) as count FROM control_recepcion_mercaderia WHERE ${dayFilter.query}`,
            dayFilter.params
        );

        const coccionCount = await db.get(
            `SELECT COUNT(*) as count FROM control_coccion WHERE ${dayFilter.query}`,
            dayFilter.params
        );

        res.json({
            success: true,
            message: 'Endpoint de datos diarios funcionando correctamente',
            fecha: fechaConsulta,
            conteos: {
                recepcion_mercaderia: recepcionCount.count,
                control_coccion: coccionCount.count
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error en endpoint de prueba:', error);
        res.status(500).json({
            success: false,
            error: 'Error en endpoint de prueba',
            message: error.message
        });
    }
});

module.exports = router;