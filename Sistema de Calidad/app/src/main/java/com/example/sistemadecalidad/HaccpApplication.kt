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
        
        // Inicializar configuración de red (AWS Production por defecto)
        initializeNetworkConfig()
        
        // Inicializar sistema de notificaciones
        initializeNotifications()
    }
    
    /**
     * Inicializa la configuración de red con AWS Production
     */
    private fun initializeNetworkConfig() {
        try {
            Log.d(TAG, "🔧 Inicializando configuración de red...")
            NetworkConfig.initialize(this)
            Log.d(TAG, "✅ Red configurada: ${NetworkConfig.getCurrentUrl(this)}")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error inicializando red: ${e.message}")
        }
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