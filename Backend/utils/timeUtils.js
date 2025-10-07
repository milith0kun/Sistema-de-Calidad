/**
 * Utilidades para manejo consistente de tiempo en zona horaria de Perú
 * Garantiza que todo el backend use la misma zona horaria (America/Lima)
 */

const PERU_TIMEZONE = 'America/Lima';

/**
 * Obtiene la fecha actual en zona horaria de Perú
 * @returns {Date} Fecha actual en zona horaria de Perú
 */
function getCurrentPeruDate() {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
}

/**
 * Formatea una fecha para la base de datos en formato YYYY-MM-DD
 * @param {Date} date - Fecha a formatear (opcional, usa fecha actual si no se proporciona)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function formatDateForDB(date = getCurrentPeruDate()) {
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
    return peruDate.toISOString().split('T')[0];
}

/**
 * Formatea una hora para la base de datos en formato HH:MM:SS
 * @param {Date} date - Fecha a formatear (opcional, usa fecha actual si no se proporciona)
 * @returns {string} Hora en formato HH:MM:SS
 */
function formatTimeForDB(date = getCurrentPeruDate()) {
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
    return peruDate.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false,
        timeZone: PERU_TIMEZONE
    });
}

/**
 * Formatea una fecha para mostrar en formato legible en español
 * @param {Date} date - Fecha a formatear (opcional, usa fecha actual si no se proporciona)
 * @returns {string} Fecha en formato legible
 */
function formatDateForDisplay(date = getCurrentPeruDate()) {
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
    return peruDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: PERU_TIMEZONE
    });
}

/**
 * Formatea una hora para mostrar en formato 12 horas
 * @param {Date} date - Fecha a formatear (opcional, usa fecha actual si no se proporciona)
 * @returns {string} Hora en formato 12 horas
 */
function formatTimeFor12Hour(date = getCurrentPeruDate()) {
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
    return peruDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: PERU_TIMEZONE
    });
}

/**
 * Obtiene un timestamp ISO en zona horaria de Perú
 * @param {Date} date - Fecha a formatear (opcional, usa fecha actual si no se proporciona)
 * @returns {string} Timestamp ISO
 */
function getPeruTimestamp(date = getCurrentPeruDate()) {
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
    return peruDate.toISOString();
}

/**
 * Obtiene información completa de tiempo para respuestas de API
 * @param {Date} date - Fecha a formatear (opcional, usa fecha actual si no se proporciona)
 * @returns {Object} Objeto con información completa de tiempo
 */
function getTimeInfo(date = getCurrentPeruDate()) {
    const peruDate = new Date(date.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
    
    return {
        timestamp: getPeruTimestamp(peruDate),
        fecha: formatDateForDB(peruDate),
        hora: formatTimeForDB(peruDate),
        fecha_completa: formatDateForDisplay(peruDate),
        hora_12h: formatTimeFor12Hour(peruDate),
        dia_semana: peruDate.toLocaleDateString('es-ES', { weekday: 'long', timeZone: PERU_TIMEZONE }),
        mes: peruDate.toLocaleDateString('es-ES', { month: 'long', timeZone: PERU_TIMEZONE }),
        año: peruDate.getFullYear(),
        dia_numero: peruDate.getDate(),
        mes_numero: peruDate.getMonth() + 1,
        dia_semana_numero: peruDate.getDay(),
        timezone: PERU_TIMEZONE,
        timezone_offset: -5, // UTC-5 para Perú
        unix_timestamp: Math.floor(peruDate.getTime() / 1000),
        milliseconds: peruDate.getTime()
    };
}

/**
 * Verifica si dos fechas están en el mismo día (en zona horaria de Perú)
 * @param {Date} date1 - Primera fecha
 * @param {Date} date2 - Segunda fecha
 * @returns {boolean} True si están en el mismo día
 */
function isSameDay(date1, date2) {
    const peru1 = new Date(date1.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
    const peru2 = new Date(date2.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
    
    return peru1.toDateString() === peru2.toDateString();
}

/**
 * Obtiene la fecha de inicio de la semana actual en zona horaria de Perú
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getStartOfWeek() {
    const peruDate = getCurrentPeruDate();
    const dayOfWeek = peruDate.getDay(); // 0 = domingo, 1 = lunes, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes como inicio de semana
    peruDate.setDate(peruDate.getDate() - daysToSubtract);
    return formatDateForDB(peruDate);
}

/**
 * Obtiene la fecha de inicio del mes actual en zona horaria de Perú
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getStartOfMonth() {
    const peruDate = getCurrentPeruDate();
    peruDate.setDate(1);
    return formatDateForDB(peruDate);
}

/**
 * Obtiene la fecha de inicio del año actual en zona horaria de Perú
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getStartOfYear() {
    const peruDate = getCurrentPeruDate();
    peruDate.setMonth(0, 1);
    return formatDateForDB(peruDate);
}

/**
 * Obtiene la fecha hace N días en zona horaria de Perú
 * @param {number} days - Número de días hacia atrás
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getDateDaysAgo(days) {
    const peruDate = getCurrentPeruDate();
    peruDate.setDate(peruDate.getDate() - days);
    return formatDateForDB(peruDate);
}

/**
 * Obtiene el inicio del día actual (00:00:00) en zona horaria de Perú
 * @param {Date} date - Fecha específica (opcional, usa fecha actual si no se proporciona)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getStartOfDay(date = getCurrentPeruDate()) {
    return formatDateForDB(date);
}

/**
 * Obtiene el final del día actual (23:59:59) en zona horaria de Perú
 * @param {Date} date - Fecha específica (opcional, usa fecha actual si no se proporciona)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function getEndOfDay(date = getCurrentPeruDate()) {
    return formatDateForDB(date);
}

/**
 * Obtiene los parámetros para filtrar datos del día actual (00:00 a 00:00 del día siguiente)
 * @param {Date} date - Fecha específica (opcional, usa fecha actual si no se proporciona)
 * @returns {Object} Objeto con fecha_inicio y fecha_fin para consultas SQL
 */
function getDayRange(date = getCurrentPeruDate()) {
    const fechaActual = formatDateForDB(date);
    return {
        fecha_inicio: fechaActual,
        fecha_fin: fechaActual
    };
}

/**
 * Obtiene los parámetros para filtrar datos de un rango de fechas específico
 * @param {string} fechaInicio - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} fechaFin - Fecha de fin en formato YYYY-MM-DD (opcional, usa fechaInicio si no se proporciona)
 * @returns {Object} Objeto con fecha_inicio y fecha_fin para consultas SQL
 */
function getCustomDateRange(fechaInicio, fechaFin = null) {
    return {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || fechaInicio
    };
}

/**
 * Verifica si una fecha está dentro del día actual (00:00 a 23:59)
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {boolean} True si la fecha es del día actual
 */
function isToday(fecha) {
    const hoy = formatDateForDB();
    return fecha === hoy;
}

/**
 * Genera condiciones SQL para filtrar por día específico
 * @param {string} fecha - Fecha en formato YYYY-MM-DD (opcional, usa fecha actual si no se proporciona)
 * @returns {Object} Objeto con query y params para usar en consultas SQL
 */
function getDayFilterSQL(fecha = null) {
    const fechaFiltro = fecha || formatDateForDB();
    return {
        query: 'fecha = ?',
        params: [fechaFiltro]
    };
}

module.exports = {
    PERU_TIMEZONE,
    getCurrentPeruDate,
    formatDateForDB,
    formatTimeForDB,
    formatDateForDisplay,
    formatTimeFor12Hour,
    getPeruTimestamp,
    getTimeInfo,
    isSameDay,
    getStartOfWeek,
    getStartOfMonth,
    getStartOfYear,
    getDateDaysAgo,
    // Nuevas funciones para manejo de datos diarios
    getStartOfDay,
    getEndOfDay,
    getDayRange,
    getCustomDateRange,
    isToday,
    getDayFilterSQL
};