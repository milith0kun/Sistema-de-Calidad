package com.example.sistemadecalidad.utils

/**
 * Configuración de producción para el despliegue
 * Aquí puedes cambiar fácilmente la IP y puerto del servidor
 */
object ProductionConfig {
    
    // CONFIGURACIÓN DEL SERVIDOR - CAMBIAR AQUÍ PARA DESPLIEGUE
    const val SERVER_IP = "10.0.2.2"                  // IP especial para emulador Android (apunta a localhost del host)
    const val SERVER_PORT = "3000"                     // Puerto del backend local
    const val USE_HTTPS = false                        // Servidor usa HTTP
    
    /**
     * Obtiene la URL completa del servidor de producción (incluye /api/)
     */
    fun getServerUrl(): String {
        val protocol = if (USE_HTTPS) "https" else "http"
        val baseUrl = if (SERVER_PORT.isNotBlank()) {
            "$protocol://$SERVER_IP:$SERVER_PORT/"
        } else {
            "$protocol://$SERVER_IP/"
        }
        // Agregar /api/ al final para que coincida con las rutas del backend
        return baseUrl + "api/"
    }
    
    /**
     * Obtiene solo la dirección base (sin protocolo)
     */
    fun getServerAddress(): String {
        return if (SERVER_PORT.isNotBlank()) {
            "$SERVER_IP:$SERVER_PORT"
        } else {
            SERVER_IP
        }
    }
    
    /**
     * Verifica si la configuración es válida
     */
    fun isConfigurationValid(): Boolean {
        return SERVER_IP.isNotBlank() && 
               SERVER_IP != "your-server-ip" &&
               (SERVER_PORT.isBlank() || SERVER_PORT.toIntOrNull() != null)
    }
}