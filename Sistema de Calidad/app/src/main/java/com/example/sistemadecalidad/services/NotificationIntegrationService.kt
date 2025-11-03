package com.example.sistemadecalidad.services

import android.content.Context
import android.util.Log
import com.example.sistemadecalidad.utils.NotificationHelper

/**
 * Servicio para integrar notificaciones con el ciclo de vida de la aplicación
 */
object NotificationIntegrationService {
    
    private const val TAG = "NotificationIntegration"
    
    /**
     * Inicia las notificaciones cuando el usuario se autentica
     */
    fun startNotificationsForUser(context: Context) {
        try {
            Log.d(TAG, "🔔 Iniciando notificaciones para usuario autenticado")
            NotificationHelper.scheduleWorkTimeCheck(context)
            NotificationHelper.scheduleHaccpReminders(context)
            Log.d(TAG, "✅ Notificaciones programadas correctamente")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error programando notificaciones: ${e.message}")
        }
    }
    
    /**
     * Detiene las notificaciones cuando el usuario cierra sesión
     */
    fun stopNotificationsForUser(context: Context) {
        try {
            Log.d(TAG, "🔕 Deteniendo notificaciones para usuario")
            NotificationHelper.cancelAllNotifications(context)
            Log.d(TAG, "✅ Notificaciones canceladas correctamente")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error cancelando notificaciones: ${e.message}")
        }
    }
    
    /**
     * Verifica si el usuario está autenticado y programa notificaciones si es necesario
     */
    fun checkAndScheduleNotifications(context: Context) {
        try {
            Log.d(TAG, "🔍 Verificando estado de autenticación para notificaciones")
            // Por ahora, simplemente programamos las notificaciones
            // En el futuro se puede integrar con el sistema de autenticación
            startNotificationsForUser(context)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error verificando autenticación: ${e.message}")
        }
    }
}