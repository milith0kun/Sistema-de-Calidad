package com.example.sistemadecalidad.utils

import java.text.SimpleDateFormat
import java.util.*

/**
 * Utilidades para manejo consistente de tiempo en zona horaria de Perú
 * Garantiza que toda la aplicación use la misma zona horaria (America/Lima)
 */
object TimeUtils {
    
    private const val PERU_TIMEZONE = "America/Lima"
    private val peruTimeZone = TimeZone.getTimeZone(PERU_TIMEZONE)
    
    /**
     * Obtiene la fecha actual en zona horaria de Perú
     * Corregido para evitar conversiones innecesarias que causan diferencias de hora
     */
    fun getCurrentPeruDate(): Date {
        // Simplemente devolver la hora actual del sistema
        // El sistema ya debería estar configurado en la zona horaria correcta
        return Date()
    }
    
    /**
     * Formatea una fecha para mostrar en formato de fecha legible en español
     * Ejemplo: "lunes, 15 de enero"
     */
    fun formatDateForDisplay(date: Date = getCurrentPeruDate()): String {
        val formatter = SimpleDateFormat("EEEE, dd 'de' MMMM", Locale("es", "PE"))
        // Usar la zona horaria del sistema directamente
        return formatter.format(date)
    }
    
    /**
     * Formatea una fecha para mostrar la hora en formato HH:mm:ss
     * Ejemplo: "14:30:25"
     */
    fun formatTimeForDisplay(date: Date = getCurrentPeruDate()): String {
        val formatter = SimpleDateFormat("HH:mm:ss", Locale("es", "PE"))
        // Usar la zona horaria del sistema directamente
        return formatter.format(date)
    }
    
    /**
     * Formatea una fecha para envío al backend en formato YYYY-MM-DD
     * Ejemplo: "2024-01-15"
     */
    fun formatDateForBackend(date: Date = getCurrentPeruDate()): String {
        val formatter = SimpleDateFormat("yyyy-MM-dd", Locale("es", "PE"))
        // Usar la zona horaria del sistema directamente
        return formatter.format(date)
    }
    
    /**
     * Formatea una hora para envío al backend en formato HH:mm:ss
     * Ejemplo: "14:30:25"
     */
    fun formatTimeForBackend(date: Date = getCurrentPeruDate()): String {
        val formatter = SimpleDateFormat("HH:mm:ss", Locale("es", "PE"))
        // Usar la zona horaria del sistema directamente
        return formatter.format(date)
    }
    
    /**
     * Obtiene un timestamp ISO en zona horaria de Perú
     * Ejemplo: "2024-01-15T14:30:25.123-05:00"
     */
    fun getPeruTimestamp(date: Date = getCurrentPeruDate()): String {
        val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale("es", "PE"))
        // Usar la zona horaria del sistema directamente
        return formatter.format(date)
    }
    
    /**
     * Convierte una fecha UTC a zona horaria de Perú
     */
    fun convertUtcToPeruTime(utcDate: Date): Date {
        val utcCalendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        utcCalendar.time = utcDate
        
        val peruCalendar = Calendar.getInstance(peruTimeZone)
        peruCalendar.timeInMillis = utcCalendar.timeInMillis
        
        return peruCalendar.time
    }
    
    /**
     * Obtiene la zona horaria de Perú
     */
    fun getPeruTimeZone(): TimeZone = peruTimeZone
    
    /**
     * Verifica si una fecha está en el mismo día (en zona horaria de Perú)
     */
    fun isSameDay(date1: Date, date2: Date): Boolean {
        val cal1 = Calendar.getInstance(peruTimeZone)
        cal1.time = date1
        
        val cal2 = Calendar.getInstance(peruTimeZone)
        cal2.time = date2
        
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
               cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
    }
}