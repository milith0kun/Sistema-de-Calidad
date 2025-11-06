package com.example.sistemadecalidad.utils

/**
 * Configuración de red de la aplicación
 * URL fija del servidor AWS EC2 en producción
 */
object NetworkConfig {
    
    // URL del servidor AWS EC2 - Producción
    const val AWS_PRODUCTION_URL = "http://18.216.180.19:3000/api/"

    // URL por defecto
    const val DEFAULT_BASE_URL = AWS_PRODUCTION_URL
    
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
     * Obtiene la URL actual del servidor - siempre AWS Production
     */
    fun getCurrentUrl(): String {
        return DEFAULT_BASE_URL
    }
}