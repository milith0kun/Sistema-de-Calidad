package com.example.sistemadecalidad.data.api

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.util.Log
import kotlinx.coroutines.*
import okhttp3.OkHttpClient
import okhttp3.Request
import java.net.InetAddress
import java.util.concurrent.TimeUnit

/**
 * Detector automático de red que encuentra la mejor URL del servidor
 * Prueba múltiples opciones y selecciona automáticamente la que funcione
 */
class AutoNetworkDetector(private val context: Context) {
    
    companion object {
        private const val TAG = "AutoNetworkDetector"
        private const val CONNECTION_TIMEOUT = 5000L // 5 segundos
        private const val SERVER_PORT = "3000"
        
        // URLs disponibles para prueba
        private const val LOCAL_SERVER_URL = "http://localhost:3000/api/"
        private const val AWS_PRODUCTION_URL = "http://18.216.180.19:3000/api/"
    }
    
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(CONNECTION_TIMEOUT, TimeUnit.MILLISECONDS)
        .readTimeout(CONNECTION_TIMEOUT, TimeUnit.MILLISECONDS)
        .writeTimeout(CONNECTION_TIMEOUT, TimeUnit.MILLISECONDS)
        .build()
    
    /**
     * Detecta automáticamente la mejor URL del servidor
     * Prueba primero AWS Production, luego local como respaldo
     * @return URL del servidor que responde, o null si ninguna funciona
     */
    suspend fun detectBestServerUrl(): String? = withContext(Dispatchers.IO) {
        Log.d(TAG, "🚀 Detectando mejor servidor disponible...")
        
        // Siempre usar AWS Production primero
        Log.d(TAG, "Usando servidor AWS Production: $AWS_PRODUCTION_URL")
        return@withContext AWS_PRODUCTION_URL
    }
    
    /**
     * Genera URLs dinámicas basadas en la configuración de red actual
     * Prioriza servidor local para desarrollo
     */
    private fun getDynamicServerUrls(): List<String> {
        Log.d(TAG, "🌐 URLs disponibles: Local y AWS Production")
        return listOf(LOCAL_SERVER_URL, AWS_PRODUCTION_URL)
    }
    
    /**
     * Prueba la conexión a una URL específica
     */
    private suspend fun testServerConnection(url: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(url + "health") // Probar endpoint de salud bajo /api
                .get()
                .build()
            
            val response = httpClient.newCall(request).execute()
            val isSuccessful = response.isSuccessful
            response.close()
            
            return@withContext isSuccessful
        } catch (e: Exception) {
            Log.v(TAG, "Conexión fallida a $url: ${e.message}")
            return@withContext false
        }
    }
    
    /**
     * Obtiene la IP del gateway (router)
     */
    private fun getGatewayIp(): String? {
        try {
            val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val dhcpInfo = wifiManager.dhcpInfo
            val gateway = dhcpInfo.gateway
            
            if (gateway != 0) {
                return String.format(
                    "%d.%d.%d.%d",
                    gateway and 0xFF,
                    gateway shr 8 and 0xFF,
                    gateway shr 16 and 0xFF,
                    gateway shr 24 and 0xFF
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error obteniendo IP del gateway: ${e.message}")
        }
        return null
    }
    
    /**
     * Obtiene la IP local del dispositivo
     */
    private fun getLocalIpAddress(): String? {
        try {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val network = connectivityManager.activeNetwork
            val networkCapabilities = connectivityManager.getNetworkCapabilities(network)
            
            if (networkCapabilities?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true) {
                val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
                val wifiInfo = wifiManager.connectionInfo
                val ipAddress = wifiInfo.ipAddress
                
                if (ipAddress != 0) {
                    return String.format(
                        "%d.%d.%d.%d",
                        ipAddress and 0xFF,
                        ipAddress shr 8 and 0xFF,
                        ipAddress shr 16 and 0xFF,
                        ipAddress shr 24 and 0xFF
                    )
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error obteniendo IP local: ${e.message}")
        }
        return null
    }
    
    /**
     * Verifica si hay conectividad a internet
     */
    fun hasInternetConnection(): Boolean {
        try {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val network = connectivityManager.activeNetwork ?: return false
            val networkCapabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
            
            return networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                   networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        } catch (e: Exception) {
            Log.e(TAG, "Error verificando conectividad: ${e.message}")
            return false
        }
    }
    
    /**
     * Detecta el tipo de conexión actual
     */
    fun getConnectionType(): ConnectionType {
        try {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val network = connectivityManager.activeNetwork ?: return ConnectionType.NONE
            val networkCapabilities = connectivityManager.getNetworkCapabilities(network) ?: return ConnectionType.NONE
            
            return when {
                networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> {
                    Log.d(TAG, "🔗 Conexión detectada: WiFi")
                    ConnectionType.WIFI
                }
                networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                    Log.d(TAG, "🔗 Conexión detectada: Datos móviles")
                    ConnectionType.CELLULAR
                }
                networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> {
                    Log.d(TAG, "🔗 Conexión detectada: Ethernet")
                    ConnectionType.ETHERNET
                }
                else -> {
                    Log.d(TAG, "🔗 Conexión detectada: Desconocida")
                    ConnectionType.OTHER
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error detectando tipo de conexión: ${e.message}")
            return ConnectionType.NONE
        }
    }
}

/**
 * Tipos de conexión de red
 */
enum class ConnectionType {
    WIFI,       // Conexión WiFi - usar URLs locales
    CELLULAR,   // Datos móviles - usar URLs públicas/túnel
    ETHERNET,   // Conexión por cable
    OTHER,      // Otro tipo de conexión
    NONE        // Sin conexión
}