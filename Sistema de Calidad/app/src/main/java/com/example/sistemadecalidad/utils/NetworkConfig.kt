package com.example.sistemadecalidad.utils

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.example.sistemadecalidad.data.api.NetworkModule
import com.example.sistemadecalidad.data.api.AutoNetworkDetector
import com.example.sistemadecalidad.data.api.ConnectionType

/**
 * Utilidad para gestionar la configuración de red de la aplicación
 * Permite cambiar dinámicamente la URL del servidor según el entorno
 * Sincronizado con especificaciones del backend HACCP
 */
object NetworkConfig {
    
    private const val PREFS_NAME = "network_config"
    private const val KEY_SERVER_URL = "server_url"
    private const val KEY_ENVIRONMENT = "environment"
    
    val ENVIRONMENTS = mapOf(
        "aws_production" to "http://18.216.180.19:3000/api/", // AWS Producción (EC2)
        "local_development" to "http://localhost:3000/api/" // Servidor local
    )
    
    // URL por defecto: AWS Producción (EC2)
    const val DEFAULT_BASE_URL = "http://18.216.180.19:3000/api/"
    
    // Endpoints principales del backend HACCP según especificaciones
    object Endpoints {
        // Autenticación
        const val AUTH_LOGIN = "auth/login"
        const val AUTH_VERIFY = "auth/verify"
        
        // Fichado
        const val FICHADO_ENTRADA = "fichado/entrada"
        const val FICHADO_SALIDA = "fichado/salida"
        const val FICHADO_HISTORIAL = "fichado/historial"
        
        // Dashboard
        const val DASHBOARD_HOY = "dashboard/hoy"
        const val DASHBOARD_RESUMEN = "dashboard/resumen"
        const val TIEMPO_REAL = "tiempo-real"
        const val HEALTH_CHECK = "health"
        
        // Proveedores
        const val PROVEEDORES_LIST = "proveedores"
        const val PROVEEDORES_CREATE = "proveedores/crear"
        const val PROVEEDORES_UPDATE = "proveedores/actualizar"
        const val PROVEEDORES_DELETE = "proveedores/eliminar"
        
        // Productos
        const val PRODUCTOS_LIST = "productos"
        const val PRODUCTOS_CREATE = "productos/crear"
        const val PRODUCTOS_UPDATE = "productos/actualizar"
        const val PRODUCTOS_DELETE = "productos/eliminar"
        
        // Recepción de Mercadería
        const val RECEPCION_LIST = "recepcion/lista"
        const val RECEPCION_CREATE = "recepcion/registrar"
        const val RECEPCION_UPDATE = "recepcion/actualizar"
        const val RECEPCION_DELETE = "recepcion/eliminar"
        
        // Control de Cocción
        const val COCCION_LIST = "coccion/lista"
        const val COCCION_CREATE = "coccion/registrar"
        const val COCCION_UPDATE = "coccion/actualizar"
        const val COCCION_DELETE = "coccion/eliminar"
        
        // Lavado y Desinfección de Frutas
        const val LAVADO_FRUTAS_LIST = "lavado-frutas/lista"
        const val LAVADO_FRUTAS_CREATE = "lavado-frutas/registrar"
        const val LAVADO_FRUTAS_UPDATE = "lavado-frutas/actualizar"
        const val LAVADO_FRUTAS_DELETE = "lavado-frutas/eliminar"
        
        // Lavado de Manos
        const val LAVADO_MANOS_LIST = "lavado-manos/lista"
        const val LAVADO_MANOS_CREATE = "lavado-manos/registrar"
        const val LAVADO_MANOS_UPDATE = "lavado-manos/actualizar"
        const val LAVADO_MANOS_DELETE = "lavado-manos/eliminar"
        
        // Control de Temperatura - Cámaras
        const val CAMARAS_LIST = "camaras/lista"
        const val CAMARAS_CREATE = "camaras/crear"
        const val TEMP_CAMARAS_LIST = "temperatura-camaras/lista"
        const val TEMP_CAMARAS_CREATE = "temperatura-camaras/registrar"
        
        // Control de Temperatura - Alimentos
        const val TEMP_ALIMENTOS_LIST = "temperatura-alimentos/lista"
        const val TEMP_ALIMENTOS_CREATE = "temperatura-alimentos/registrar"
    }
    
    // Configuración GPS - SOLO VALORES DE FALLBACK
    // IMPORTANTE: La configuración GPS se gestiona ÚNICAMENTE desde el WebPanel
    // Estos valores solo se usan si el backend no responde o no tiene configuración guardada
    // Los Admins/Supervisores deben configurar la ubicación desde http://18.118.212.247/configuracion
    object GPSConfig {
        const val KITCHEN_LATITUDE = -12.0464  // Fallback: Lima, Perú
        const val KITCHEN_LONGITUDE = -77.0428  // Fallback: Lima, Perú
        const val GPS_RADIUS_METERS = 100.0    // Fallback: 100 metros
    }
    
    /**
     * Inicializa la configuración de red
     * Por defecto usa AWS Production en dispositivos reales
     */
    fun initialize(context: Context) {
        // Limpiar cualquier configuración obsoleta
        clearSavedConfiguration(context)
        
        // Siempre usar la configuración por defecto actualizada: AWS Producción
        val awsUrl = ENVIRONMENTS["aws_production"] ?: DEFAULT_BASE_URL
        setEnvironment(context, "aws_production")
        Log.d("NetworkConfig", "Usando servidor AWS por defecto: $awsUrl")
    }
    
    /**
     * Configura el entorno del servidor
     */
    fun setEnvironment(context: Context, environment: String) {
        val prefs = getPreferences(context)
        prefs.edit()
            .putString(KEY_ENVIRONMENT, environment)
            .remove(KEY_SERVER_URL) // Limpiar URL personalizada
            .apply()
        
        Log.d("NetworkConfig", "🌐 Entorno establecido: $environment")
    }
    
    /**
     * Configura una URL personalizada
     */
    fun setCustomUrl(context: Context, url: String) {
        val prefs = getPreferences(context)
        prefs.edit()
            .putString(KEY_SERVER_URL, url)
            .remove(KEY_ENVIRONMENT) // Limpiar entorno predefinido
            .apply()
        
        Log.d("NetworkConfig", "🔧 URL personalizada establecida: $url")
    }
    
    /**
     * Obtiene la URL actual del servidor
     */
    fun getCurrentUrl(context: Context): String {
        val customUrl = getCustomUrl(context)
        if (!customUrl.isNullOrEmpty()) {
            return customUrl
        }
        
        val environment = getCurrentEnvironment(context)
        return ENVIRONMENTS[environment] ?: DEFAULT_BASE_URL
    }
    
    /**
     * Obtiene el entorno actual
     */
    fun getCurrentEnvironment(context: Context): String? {
        return getPreferences(context).getString(KEY_ENVIRONMENT, null)
    }
    
    /**
     * Obtiene la URL personalizada actual
     */
    fun getCustomUrl(context: Context): String? {
        return getPreferences(context).getString(KEY_SERVER_URL, null)
    }
    
    /**
     * Detección automática del entorno según la conectividad
     * Simplificado: siempre AWS
     */
    @Suppress("UNUSED_PARAMETER")
    fun autoDetectEnvironment(context: Context): String {
        return "aws_production"
    }
    
    /**
     * Configura una URL pública específica para datos móviles
     */
    fun setPublicTunnelUrl(context: Context, publicUrl: String) {
        val prefs = getPreferences(context)
        prefs.edit()
            .putString("public_tunnel_url", publicUrl)
            .apply()
        
        Log.d("NetworkConfig", "📱 URL pública configurada: $publicUrl")
    }
    
    /**
     * Obtiene la URL pública configurada para datos móviles
     */
    fun getPublicTunnelUrl(context: Context): String? {
        return getPreferences(context).getString("public_tunnel_url", null)
    }
    
    /**
     * Verifica si hay una URL pública configurada
     */
    fun hasPublicTunnelUrl(context: Context): Boolean {
        return !getPublicTunnelUrl(context).isNullOrEmpty()
    }
    
    /**
      * Guarda la URL detectada automáticamente
      */
     fun saveDetectedUrl(context: Context, url: String) {
         val prefs = getPreferences(context)
         prefs.edit()
             .putString(KEY_SERVER_URL, url)
             .apply()
     }
    
    /**
      * Obtiene la última URL detectada
      */
     fun getLastDetectedUrl(context: Context): String? {
         return getPreferences(context).getString(KEY_SERVER_URL, null)
     }
    
    /**
      * Limpia la configuración guardada
      */
     fun clearSavedConfiguration(context: Context) {
         val prefs = getPreferences(context)
         prefs.edit().clear().apply()
     }
    
    /**
      * Obtiene las preferencias compartidas
      */
     private fun getPreferences(context: Context): SharedPreferences {
         return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
     }
     
     /**
      * URLs de respaldo para información (solo lectura)
      */
     val FALLBACK_URLS = listOf(
        DEFAULT_BASE_URL
    )
}