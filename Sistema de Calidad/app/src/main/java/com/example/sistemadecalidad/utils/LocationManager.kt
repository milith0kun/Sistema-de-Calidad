package com.example.sistemadecalidad.utils

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager as AndroidLocationManager
import android.os.Bundle
import androidx.core.app.ActivityCompat
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.utils.NetworkConfig
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlin.math.*

/**
 * Manager para manejar la ubicación GPS y validar si el usuario está en el rango permitido
 * para realizar fichado según las especificaciones del sistema HACCP
 */
class LocationManager(private val context: Context) {
    
    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as AndroidLocationManager
    private val preferencesManager = PreferencesManager(context, Gson())
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    // Coordenadas de la cocina del hotel (se cargan desde PreferencesManager)
    private var KITCHEN_LATITUDE = NetworkConfig.GPSConfig.KITCHEN_LATITUDE
    private var KITCHEN_LONGITUDE = NetworkConfig.GPSConfig.KITCHEN_LONGITUDE
    private var GPS_RADIUS_METERS = NetworkConfig.GPSConfig.GPS_RADIUS_METERS.toInt()
    
    // Estado de la ubicación actual
    private val _currentLocation = MutableStateFlow<Location?>(null)
    val currentLocation: StateFlow<Location?> = _currentLocation.asStateFlow()
    
    // Estado de validación de ubicación
    private val _isLocationValid = MutableStateFlow(false)
    val isLocationValid: StateFlow<Boolean> = _isLocationValid.asStateFlow()
    
    // Estado de disponibilidad GPS
    private val _isGpsEnabled = MutableStateFlow(false)
    val isGpsEnabled: StateFlow<Boolean> = _isGpsEnabled.asStateFlow()
    
    // Estado de permisos
    private val _hasLocationPermission = MutableStateFlow(false)
    val hasLocationPermission: StateFlow<Boolean> = _hasLocationPermission.asStateFlow()
    
    // Distancia actual a la cocina
    private val _distanceToKitchen = MutableStateFlow<Double?>(null)
    val distanceToKitchen: StateFlow<Double?> = _distanceToKitchen.asStateFlow()
    
    private var locationListener: LocationListener? = null
    
    init {
        android.util.Log.e("LOCATION_DEBUG", "🏗️ CONSTRUCTOR - Inicializando LocationManager")
        android.util.Log.e("LOCATION_DEBUG", "🏗️ CONSTRUCTOR - Context: $context")
        checkGpsStatus()
        checkLocationPermissions()
        loadLocationConfig()
        android.util.Log.e("LOCATION_DEBUG", "🏗️ CONSTRUCTOR - LocationManager inicializado. GPS: ${_isGpsEnabled.value}, Permisos: ${_hasLocationPermission.value}")
    }
    
    /**
     * Cargar configuración de ubicación desde PreferencesManager
     */
    private fun loadLocationConfig() {
        android.util.Log.i("LocationManager", "🔧 CONFIGURACIÓN GPS - Cargando configuración inicial...")
        android.util.Log.i("LocationManager", "🔧 CONFIGURACIÓN GPS - Valores iniciales: lat=${KITCHEN_LATITUDE}, lon=${KITCHEN_LONGITUDE}, radio=${GPS_RADIUS_METERS}")
        
        coroutineScope.launch {
            try {
                val config = preferencesManager.getLocationConfig().first()
                if (config != null && config.latitude != 0.0 && config.longitude != 0.0) {
                    KITCHEN_LATITUDE = config.latitude
                    KITCHEN_LONGITUDE = config.longitude
                    GPS_RADIUS_METERS = config.radius
                    android.util.Log.i("LocationManager", "🔧 CONFIGURACIÓN GPS - Valores actualizados desde PreferencesManager: lat=${KITCHEN_LATITUDE}, lon=${KITCHEN_LONGITUDE}, radio=${GPS_RADIUS_METERS}")
                    
                    // Validar ubicación actual si está disponible
                    _currentLocation.value?.let { location ->
                        validateLocation(location.latitude, location.longitude)
                    }
                } else {
                    android.util.Log.i("LocationManager", "🔧 CONFIGURACIÓN GPS - Usando valores por defecto de NetworkConfig")
                }
            } catch (e: Exception) {
                android.util.Log.e("LocationManager", "❌ Error al cargar configuración GPS: ${e.message}")
                android.util.Log.i("LocationManager", "🔧 CONFIGURACIÓN GPS - Usando valores por defecto de NetworkConfig")
            }
        }
    }
    
    /**
     * Verificar si GPS está habilitado
     */
    private fun checkGpsStatus() {
        val isEnabled = locationManager.isProviderEnabled(AndroidLocationManager.GPS_PROVIDER) ||
                       locationManager.isProviderEnabled(AndroidLocationManager.NETWORK_PROVIDER)
        _isGpsEnabled.value = isEnabled
    }
    
    /**
     * Verificar permisos de ubicación
     */
    private fun checkLocationPermissions() {
        val hasFineLocation = ActivityCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        
        val hasCoarseLocation = ActivityCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        
        _hasLocationPermission.value = hasFineLocation || hasCoarseLocation
    }
    
    /**
     * Iniciar seguimiento de ubicación
     */
    fun startLocationTracking() {
        android.util.Log.i("LocationManager", "🚀 INICIO TRACKING - Iniciando seguimiento de ubicación")
        android.util.Log.i("LocationManager", "🚀 INICIO TRACKING - Permisos: ${_hasLocationPermission.value}")
        
        if (!_hasLocationPermission.value) {
            android.util.Log.w("LocationManager", "❌ INICIO TRACKING - Sin permisos de ubicación")
            return
        }
        
        locationListener = object : LocationListener {
            override fun onLocationChanged(location: Location) {
                android.util.Log.i("LocationManager", "📍 UBICACIÓN CAMBIADA - Nueva ubicación recibida: lat=${location.latitude}, lon=${location.longitude}")
                _currentLocation.value = location
                validateLocation(location)
            }
            
            @Deprecated("Deprecated in Java")
            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {
                android.util.Log.i("LocationManager", "📡 ESTADO PROVEEDOR - Provider: $provider, Status: $status")
            }
            override fun onProviderEnabled(provider: String) {
                android.util.Log.i("LocationManager", "✅ PROVEEDOR HABILITADO - Provider: $provider")
                checkGpsStatus()
            }
            override fun onProviderDisabled(provider: String) {
                android.util.Log.w("LocationManager", "❌ PROVEEDOR DESHABILITADO - Provider: $provider")
                checkGpsStatus()
            }
        }
        
        try {
            // Intentar obtener ubicación del GPS primero
            if (locationManager.isProviderEnabled(AndroidLocationManager.GPS_PROVIDER)) {
                android.util.Log.i("LocationManager", "🛰️ GPS HABILITADO - Solicitando actualizaciones GPS")
                locationManager.requestLocationUpdates(
                    AndroidLocationManager.GPS_PROVIDER,
                    5000L, // 5 segundos
                    10f,   // 10 metros
                    locationListener!!
                )
            } else {
                android.util.Log.w("LocationManager", "❌ GPS DESHABILITADO - GPS provider no disponible")
            }
            
            // También usar red como respaldo
            if (locationManager.isProviderEnabled(AndroidLocationManager.NETWORK_PROVIDER)) {
                android.util.Log.i("LocationManager", "📶 NETWORK HABILITADO - Solicitando actualizaciones de red")
                locationManager.requestLocationUpdates(
                    AndroidLocationManager.NETWORK_PROVIDER,
                    5000L,
                    10f,
                    locationListener!!
                )
            } else {
                android.util.Log.w("LocationManager", "❌ NETWORK DESHABILITADO - Network provider no disponible")
            }
            
            // Obtener última ubicación conocida
            android.util.Log.i("LocationManager", "🔍 ÚLTIMA UBICACIÓN - Obteniendo última ubicación conocida")
            getLastKnownLocation()
            
        } catch (e: SecurityException) {
            android.util.Log.e("LocationManager", "❌ ERROR PERMISOS - SecurityException: ${e.message}")
            // Permisos no concedidos
            _hasLocationPermission.value = false
        }
    }
    
    /**
     * Detener seguimiento de ubicación
     */
    fun stopLocationTracking() {
        locationListener?.let { listener ->
            try {
                locationManager.removeUpdates(listener)
            } catch (e: SecurityException) {
                // Ignorar error de permisos al detener
            }
        }
        locationListener = null
    }
    
    /**
     * Obtener última ubicación conocida
     */
    private fun getLastKnownLocation() {
        if (!_hasLocationPermission.value) return
        
        try {
            val gpsLocation = locationManager.getLastKnownLocation(AndroidLocationManager.GPS_PROVIDER)
            val networkLocation = locationManager.getLastKnownLocation(AndroidLocationManager.NETWORK_PROVIDER)
            
            // Usar la ubicación más reciente y precisa
            val bestLocation = when {
                gpsLocation != null && networkLocation != null -> {
                    if (gpsLocation.time > networkLocation.time) gpsLocation else networkLocation
                }
                gpsLocation != null -> gpsLocation
                networkLocation != null -> networkLocation
                else -> null
            }
            
            bestLocation?.let { location ->
                _currentLocation.value = location
                validateLocation(location)
            }
        } catch (e: SecurityException) {
            _hasLocationPermission.value = false
        }
    }
    
    /**
     * Validar si la ubicación actual está dentro del rango permitido
     */
    private fun validateLocation(location: Location) {
        val distance = calculateDistance(
            location.latitude,
            location.longitude,
            KITCHEN_LATITUDE,
            KITCHEN_LONGITUDE
        )
        
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - Ubicación actual: lat=${location.latitude}, lon=${location.longitude}")
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - Ubicación objetivo: lat=${KITCHEN_LATITUDE}, lon=${KITCHEN_LONGITUDE}")
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - Radio permitido: ${GPS_RADIUS_METERS} metros")
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - Distancia calculada: ${distance} metros")
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - ¿Dentro del rango?: ${distance <= GPS_RADIUS_METERS}")
        
        _distanceToKitchen.value = distance
        _isLocationValid.value = distance <= GPS_RADIUS_METERS
    }
    
    /**
     * Validar ubicación con coordenadas específicas
     */
    private fun validateLocation(latitude: Double, longitude: Double) {
        val distance = calculateDistance(
            latitude,
            longitude,
            KITCHEN_LATITUDE,
            KITCHEN_LONGITUDE
        )
        
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - Ubicación específica: lat=${latitude}, lon=${longitude}")
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - Ubicación objetivo: lat=${KITCHEN_LATITUDE}, lon=${KITCHEN_LONGITUDE}")
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - Radio permitido: ${GPS_RADIUS_METERS} metros")
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - Distancia calculada: ${distance} metros")
        android.util.Log.i("LocationManager", "🎯 VALIDACIÓN GPS - ¿Dentro del rango?: ${distance <= GPS_RADIUS_METERS}")
        
        _distanceToKitchen.value = distance
        _isLocationValid.value = distance <= GPS_RADIUS_METERS
    }
    
    /**
     * Calcular distancia entre dos puntos GPS usando la fórmula de Haversine
     */
    private fun calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val earthRadius = 6371000.0 // Radio de la Tierra en metros
        
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        
        val a = sin(dLat / 2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return earthRadius * c
    }
    
    /**
     * Obtener ubicación actual de forma síncrona para fichado
     */
    fun getCurrentLocationForFichado(): LocationData? {
        val location = _currentLocation.value ?: return null
        val distance = _distanceToKitchen.value ?: return null
        
        return LocationData(
            latitude = location.latitude,
            longitude = location.longitude,
            isValid = _isLocationValid.value,
            distanceToKitchen = distance,
            accuracy = location.accuracy
        )
    }
    
    /**
     * Verificar si se puede realizar fichado (GPS activo y ubicación válida)
     */
    fun canPerformFichado(): Boolean {
        return _hasLocationPermission.value && 
               _isGpsEnabled.value && 
               _isLocationValid.value &&
               _currentLocation.value != null
    }
    
    /**
     * Obtener mensaje de estado para mostrar al usuario
     */
    fun getLocationStatusMessage(): String {
        return when {
            !_hasLocationPermission.value -> "Permisos de ubicación requeridos"
            !_isGpsEnabled.value -> "GPS deshabilitado. Active la ubicación"
            _currentLocation.value == null -> "Obteniendo ubicación..."
            !_isLocationValid.value -> {
                val distance = _distanceToKitchen.value?.toInt() ?: 0
                "Fuera del rango permitido (${distance}m de la cocina)"
            }
            else -> "Ubicación válida para fichado"
        }
    }
    
    /**
     * Actualizar permisos después de que el usuario los conceda
     */
    fun updatePermissions() {
        checkLocationPermissions()
        if (_hasLocationPermission.value) {
            startLocationTracking()
        }
    }
    
    /**
     * Recargar configuración GPS desde PreferencesManager
     * Útil cuando se actualiza la configuración desde el WebPanel
     */
    fun reloadLocationConfig() {
        loadLocationConfig()
    }
}

/**
 * Datos de ubicación para fichado
 */
data class LocationData(
    val latitude: Double,
    val longitude: Double,
    val isValid: Boolean,
    val distanceToKitchen: Double,
    val accuracy: Float
)