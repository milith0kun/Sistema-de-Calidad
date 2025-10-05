// Endpoint para fecha y hora en tiempo real - HACCP System
// Proporciona información de tiempo actualizada para el frontend

const express = require('express');
const { getTimeInfo, getCurrentPeruDate, formatDateForDB, formatTimeForDB, formatDateForDisplay, formatTimeFor12Hour, getPeruTimestamp } = require('../utils/timeUtils');
const router = express.Router();

// GET /api/tiempo-real/ahora - Obtener fecha y hora actual del servidor
router.get('/ahora', (req, res) => {
    try {
        // Usar utilidades centralizadas para obtener información de tiempo en zona horaria de Perú
        const tiempoInfo = getTimeInfo();

        res.json({
            success: true,
            data: tiempoInfo
        });

    } catch (error) {
        console.error('Error obteniendo tiempo real:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/tiempo-real/formato - Obtener fecha y hora en formato específico
router.get('/formato', (req, res) => {
    try {
        const { formato = 'completo' } = req.query;
        const ahora = getCurrentPeruDate();
        
        let resultado;
        
        switch (formato.toLowerCase()) {
            case 'fecha':
                resultado = formatDateForDB(ahora);
                break;
                
            case 'hora':
                resultado = formatTimeForDB(ahora);
                break;
                
            case 'timestamp':
                resultado = getPeruTimestamp(ahora);
                break;
                
            case 'unix':
                resultado = Math.floor(ahora.getTime() / 1000);
                break;
                
            case 'español':
                resultado = {
                    fecha: formatDateForDisplay(ahora),
                    hora: formatTimeFor12Hour(ahora),
                    completo: `${formatDateForDisplay(ahora)} ${formatTimeFor12Hour(ahora)}`
                };
                break;
                
            case 'dashboard':
                resultado = {
                    fecha_actual: formatDateForDB(ahora),
                    hora_actual: formatTimeForDB(ahora),
                    fecha_completa: formatDateForDisplay(ahora),
                    dia_semana: ahora.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'America/Lima' }),
                    timestamp: getPeruTimestamp(ahora)
                };
                break;
                
            default: // 'completo'
                resultado = {
                    timestamp: getPeruTimestamp(ahora),
                    fecha: formatDateForDB(ahora),
                    hora: formatTimeForDB(ahora),
                    fecha_completa: formatDateForDisplay(ahora)
                };
        }

        res.json({
            success: true,
            formato: formato,
            data: resultado,
            server_time: getPeruTimestamp(ahora)
        });

    } catch (error) {
        console.error('Error en formato de tiempo:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/tiempo-real/zona-trabajo - Información de tiempo para zona de trabajo
router.get('/zona-trabajo', (req, res) => {
    try {
        const ahora = getCurrentPeruDate();
        
        // Determinar turno de trabajo usando zona horaria de Perú
        const hora = ahora.getHours();
        let turno;
        
        if (hora >= 6 && hora < 14) {
            turno = 'mañana';
        } else if (hora >= 14 && hora < 22) {
            turno = 'tarde';
        } else {
            turno = 'noche';
        }
        
        // Información específica para zona de trabajo
        const zonaTrabajoInfo = {
            timestamp: getPeruTimestamp(ahora),
            fecha_trabajo: formatDateForDB(ahora),
            hora_actual: formatTimeForDB(ahora),
            
            turno_actual: turno,
            es_dia_laboral: ahora.getDay() >= 1 && ahora.getDay() <= 5, // Lunes a Viernes
            
            fecha_legible: formatDateForDisplay(ahora),
            
            hora_legible: ahora.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Lima'
            }),
            
            // Información para fichado
            puede_fichar: true, // Siempre se puede fichar
            mensaje_turno: `Turno de ${turno} - ${ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' })}`
        };

        res.json({
            success: true,
            data: zonaTrabajoInfo
        });

    } catch (error) {
        console.error('Error en zona de trabajo:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;