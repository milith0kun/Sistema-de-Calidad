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
    
    // Entornos predefinidos con sus URLs - Optimizado para producción
    val ENVIRONMENTS = mapOf(
        "aws_production" to "http://ec2-18-188-209-94.us-east-2.compute.amazonaws.com/api/", // AWS Producción (PRINCIPAL - SIEMPRE)
        "local_ngrok" to "https://kickless-anamaria-nonwaxing.ngrok-free.dev/api/", // Servidor local con ngrok
        "emulator" to "http://10.0.2.2:3000/" // Solo para desarrollo en emulador
    )
    
    // URL por defecto para pruebas (servidor local con ngrok)
    const val DEFAULT_BASE_URL = "https://kickless-anamaria-nonwaxing.ngrok-free.dev/api/"
    
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
    // Los Admins/Supervisores deben configurar la ubicación desde http://18.188.209.94/configuracion
    object GPSConfig {
        const val KITCHEN_LATITUDE = -12.0464  // Fallback: Lima, Perú
        const val KITCHEN_LONGITUDE = -77.0428  // Fallback: Lima, Perú
        const val GPS_RADIUS_METERS = 100.0    // Fallback: 100 metros
    }
    
    // Credenciales por defecto según especificaciones del backend
    object DefaultCredentials {
        object Admin {
            const val EMAIL = "admin@hotel.com"
            const val PASSWORD = "admin123"
            const val ROLE = "ADMIN"
        }
        
        object Employee {
            const val EMAIL = "empleado@hotel.com"
            const val PASSWORD = "empleado123"
            const val ROLE = "EMPLEADO"
        }
    }
    
    /**
     * Inicializa la configuración de red
     * Por defecto usa AWS Production en dispositivos reales
     */
    fun initialize(context: Context) {
        val prefs = getPreferences(context)
        val savedEnvironment = prefs.getString(KEY_ENVIRONMENT, null)
        val savedUrl = prefs.getString(KEY_SERVER_URL, null)
        
        when {
            !savedUrl.isNullOrEmpty() -> {
                // Usar URL personalizada guardada
                NetworkModule.setCustomBaseUrl(savedUrl)
                Log.d("NetworkConfig", "Using custom URL: $savedUrl")
            }
            !savedEnvironment.isNullOrEmpty() -> {
                // Usar entorno guardado
                val environmentUrl = ENVIRONMENTS[savedEnvironment]
                if (environmentUrl != null) {
                    NetworkModule.setCustomBaseUrl(environmentUrl)
                    Log.d("NetworkConfig", "Using saved environment: $savedEnvironment -> $environmentUrl")
                }
            }
            else -> {
                // Configuración por defecto: Servidor local para pruebas
                NetworkModule.setCustomBaseUrl(DEFAULT_BASE_URL)
                setEnvironment(context, "local_ngrok")
                Log.d("NetworkConfig", "Using default local server: $DEFAULT_BASE_URL")
            }
        }
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
        
        val environmentUrl = ENVIRONMENTS[environment]
        if (environmentUrl != null) {
            NetworkModule.setCustomBaseUrl(environmentUrl)
        }
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
        
        NetworkModule.setCustomBaseUrl(url)
    }
    
    /**
     * Obtiene la URL actual del servidor
     */
    fun getCurrentUrl(): String {
        return NetworkModule.getCurrentBaseUrl()
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
     * Usa datos móviles para URLs públicas, WiFi para red local
     */
    fun autoDetectEnvironment(context: Context): String {
        try {
            val detector = AutoNetworkDetector(context)
            val connectionType = detector.getConnectionType()
            
            return when (connectionType) {
                ConnectionType.WIFI -> {
                    Log.d("NetworkConfig", "🔗 WiFi detectado - usando localhost")
                    "localhost" // Localhost para WiFi según backend
                }
                ConnectionType.CELLULAR -> {
                    Log.d("NetworkConfig", "📱 Datos móviles detectados - usando túnel público")
                    "public_tunnel" // URL pública para datos móviles
                }
                ConnectionType.ETHERNET -> {
                    Log.d("NetworkConfig", "🔌 Ethernet detectado - usando localhost")
                    "localhost" // Localhost para ethernet según backend
                }
                else -> {
                    Log.d("NetworkConfig", "❓ Conexión desconocida - usando localhost por defecto")
                    "localhost" // Por defecto según backend
                }
            }
        } catch (e: Exception) {
            Log.e("NetworkConfig", "Error detectando entorno: ${e.message}")
            return "local_network" // Fallback seguro
        }
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
         "http://localhost:3000/",
         "http://10.0.2.2:3000/", 
         "http://127.0.0.1:3000/",
         "http://192.168.1.98:3000/"
     )
}