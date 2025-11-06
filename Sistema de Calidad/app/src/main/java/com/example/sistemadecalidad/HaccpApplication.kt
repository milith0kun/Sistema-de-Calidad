package com.example.sistemadecalidad

import android.app.Application
import android.util.Log
import com.example.sistemadecalidad.utils.NetworkConfig
import com.example.sistemadecalidad.utils.NotificationHelper
// import dagger.hilt.android.HiltAndroidApp

/**
 * Clase principal de la aplicación
 * Inicializa configuración de red con AWS Production y sistema de notificaciones
 */
// @HiltAndroidApp
class HaccpApplication : Application() {
    
    companion object {
        private const val TAG = "HaccpApplication"
    }
    
    override fun onCreate() {
        super.onCreate()

        // Log de configuración de red (URL fija en BuildConfig)
        Log.d(TAG, "🔧 Servidor configurado: ${NetworkConfig.AWS_PRODUCTION_URL}")

        // Inicializar sistema de notificaciones
        initializeNotifications()
    }
    
    /**
     * Inicializa el sistema de notificaciones
     */
    private fun initializeNotifications() {
        try {
            Log.d(TAG, "🔔 Inicializando sistema de notificaciones...")
            NotificationHelper.initializeNotifications(this)
            Log.d(TAG, "✅ Notificaciones configuradas correctamente")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error inicializando notificaciones: ${e.message}")
        }
    }
}