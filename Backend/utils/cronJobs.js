const cron = require('node-cron');
const { db } = require('./database');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

// Función para cerrar formularios del día anterior
const cerrarFormulariosDiarios = async () => {
    try {
        const fechaAyer = new Date();
        fechaAyer.setDate(fechaAyer.getDate() - 1);
        const fechaFormateada = format(fechaAyer, 'yyyy-MM-dd');
        
        console.log(`🔒 Iniciando cierre automático de formularios para la fecha: ${fechaFormateada}`);
        
        // Obtener estadísticas de formularios del día anterior
        const estadisticas = await obtenerEstadisticasDia(fechaFormateada);
        
        // Registrar el cierre en la tabla de auditoría
        await registrarCierreAutomatico(fechaFormateada, estadisticas);
        
        console.log(`✅ Cierre automático completado para ${fechaFormateada}`);
        console.log(`📊 Estadísticas: ${JSON.stringify(estadisticas, null, 2)}`);
        
    } catch (error) {
        console.error('❌ Error en cierre automático de formularios:', error);
    }
};

// Función para obtener estadísticas del día
const obtenerEstadisticasDia = async (fecha) => {
    try {
        const estadisticas = {
            fecha: fecha,
            recepcion_abarrotes: 0,
            recepcion_frutas_verduras: 0,
            control_coccion: 0,
            lavado_frutas: 0,
            lavado_manos: 0,
            temperatura_camaras: 0,
            total_registros: 0,
            no_conformidades: 0
        };

        // Contar registros de recepción de mercadería (abarrotes)
        const rows = await db.all(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado_producto = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados
            FROM control_recepcion_mercaderia 
            WHERE DATE(fecha_hora) = ? AND tipo_producto = 'ABARROTES'
        `, [fecha]);
        
        if (rows && rows[0]) {
            estadisticas.recepcion_abarrotes = rows[0].total || 0;
            estadisticas.no_conformidades += rows[0].rechazados || 0;
            estadisticas.total_registros += rows[0].total || 0;
        }

        // Contar registros de recepción de mercadería (frutas y verduras)
        const rows2 = await db.all(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado_producto = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados
            FROM control_recepcion_mercaderia 
            WHERE DATE(fecha_hora) = ? AND tipo_producto = 'FRUTAS_VERDURAS'
        `, [fecha]);
        
        if (rows2 && rows2[0]) {
            estadisticas.recepcion_frutas_verduras = rows2[0].total || 0;
            estadisticas.no_conformidades += rows2[0].rechazados || 0;
            estadisticas.total_registros += rows2[0].total || 0;
        }

        // Contar registros de control de cocción
        const rows3 = await db.all(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN temperatura_alcanzada < temperatura_requerida THEN 1 ELSE 0 END) as no_conformes
            FROM control_coccion 
            WHERE DATE(fecha_hora) = ?
        `, [fecha]);
        
        if (rows3 && rows3[0]) {
            estadisticas.control_coccion = rows3[0].total || 0;
            estadisticas.no_conformidades += rows3[0].no_conformes || 0;
            estadisticas.total_registros += rows3[0].total || 0;
        }

        // Contar registros de lavado de frutas
        const rows4 = await db.all(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado_final != 'CONFORME' THEN 1 ELSE 0 END) as no_conformes
            FROM control_lavado_frutas 
            WHERE DATE(fecha_hora) = ?
        `, [fecha]);
        
        if (rows4 && rows4[0]) {
            estadisticas.lavado_frutas = rows4[0].total || 0;
            estadisticas.no_conformidades += rows4[0].no_conformes || 0;
            estadisticas.total_registros += rows4[0].total || 0;
        }

        // Contar registros de lavado de manos
        const rows5 = await db.all(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN cumple_protocolo = 0 THEN 1 ELSE 0 END) as no_conformes
            FROM control_lavado_manos 
            WHERE DATE(fecha_hora) = ?
        `, [fecha]);
        
        if (rows5 && rows5[0]) {
            estadisticas.lavado_manos = rows5[0].total || 0;
            estadisticas.no_conformidades += rows5[0].no_conformes || 0;
            estadisticas.total_registros += rows5[0].total || 0;
        }

        // Contar registros de temperatura de cámaras
        const rows6 = await db.all(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN temperatura_conforme = 0 THEN 1 ELSE 0 END) as no_conformes
            FROM control_temperatura_camaras 
            WHERE DATE(fecha_hora) = ?
        `, [fecha]);
        
        if (rows6 && rows6[0]) {
            estadisticas.temperatura_camaras = rows6[0].total || 0;
            estadisticas.no_conformidades += rows6[0].no_conformes || 0;
            estadisticas.total_registros += rows6[0].total || 0;
        }

        return estadisticas;
    } catch (error) {
        console.error('Error obteniendo estadísticas del día:', error);
        throw error;
    }
};

// Función para registrar el cierre automático en auditoría
const registrarCierreAutomatico = async (fecha, estadisticas) => {
    return new Promise((resolve, reject) => {
        const accion = 'CIERRE_AUTOMATICO_FORMULARIOS';
        const detalles = JSON.stringify({
            fecha_cerrada: fecha,
            estadisticas: estadisticas,
            timestamp: new Date().toISOString()
        });

        db.run(`
            INSERT INTO auditoria (
                usuario_id, 
                accion, 
                tabla_afectada, 
                detalles, 
                fecha_hora
            ) VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
        `, [
            null, // Sistema automático
            accion,
            'FORMULARIOS_HACCP',
            detalles
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Configurar cron job para ejecutar todos los días a las 00:00
const iniciarCronJobs = () => {
    console.log('🕐 Configurando cron jobs para cierre automático de formularios HACCP...');
    
    // Ejecutar todos los días a las 00:00 (medianoche)
    cron.schedule('0 0 * * *', () => {
        console.log('⏰ Ejecutando cierre automático programado...');
        cerrarFormulariosDiarios();
    }, {
        scheduled: true,
        timezone: "America/Lima" // Zona horaria de Perú
    });

    // Para pruebas: ejecutar cada minuto (comentar en producción)
    // cron.schedule('* * * * *', () => {
    //     console.log('🧪 Prueba de cierre automático...');
    //     cerrarFormulariosDiarios();
    // });

    console.log('✅ Cron jobs configurados correctamente');
    console.log('📅 Cierre automático programado para las 00:00 todos los días');
};

// Función para ejecutar cierre manual (para pruebas)
const ejecutarCierreManual = async (fecha = null) => {
    if (!fecha) {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        fecha = format(ayer, 'yyyy-MM-dd');
    }
    
    console.log(`🔧 Ejecutando cierre manual para la fecha: ${fecha}`);
    await cerrarFormulariosDiarios();
};

module.exports = {
    iniciarCronJobs,
    ejecutarCierreManual,
    cerrarFormulariosDiarios,
    obtenerEstadisticasDia
};