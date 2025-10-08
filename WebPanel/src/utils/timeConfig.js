/**
 * Configuración de zona horaria para el WebPanel
 * Asegura consistencia con el backend (America/Lima)
 */

export const PERU_TIMEZONE = 'America/Lima';

/**
 * Convierte una fecha a la zona horaria de Perú
 * @param {Date|string} date - Fecha a convertir
 * @returns {Date} Fecha en zona horaria de Perú
 */
export function toPeruTime(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Date(dateObj.toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
}

/**
 * Formatea una fecha para mostrar en la zona horaria de Perú
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export function formatPeruDate(date, options = {}) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('es-PE', {
        timeZone: PERU_TIMEZONE,
        ...options
    });
}

/**
 * Obtiene la fecha actual en zona horaria de Perú
 * @returns {Date} Fecha actual en zona horaria de Perú
 */
export function getCurrentPeruDate() {
    return toPeruTime(new Date());
}

/**
 * Formatea una fecha para mostrar en formato corto (DD/MM/YYYY)
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha en formato DD/MM/YYYY
 */
export function formatShortDate(date) {
    return formatPeruDate(date, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formatea una fecha para mostrar con hora (DD/MM/YYYY HH:mm)
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha con hora
 */
export function formatDateTime(date) {
    return formatPeruDate(date, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}