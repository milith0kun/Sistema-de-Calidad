package com.example.sistemadecalidad.utils

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import com.example.sistemadecalidad.data.api.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Gestor de conectividad para verificar conexión a internet y servidor
 */
class ConnectivityManager(
    private val context: Context,
    private val apiService: ApiService
) {
    
    /**
     * Verifica si hay conexión a internet
     */
    fun isNetworkAvailable(): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork ?: return false
            val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
            
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
        } else {
            // Para versiones anteriores a Android M, usar método deprecado con supresión
            @Suppress("DEPRECATION")
            val networkInfo = connectivityManager.activeNetworkInfo
            // Usar isConnectedOrConnecting en lugar de isConnected para mejor compatibilidad
            @Suppress("DEPRECATION")
            networkInfo?.isConnectedOrConnecting == true
        }
    }
    
    /**
     * Obtiene el tipo de conexión actual
     */
    fun getConnectionType(): ConnectionType {
        if (!isNetworkAvailable()) return ConnectionType.NONE
        
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork ?: return ConnectionType.NONE
            val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return ConnectionType.NONE
            
            when {
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> ConnectionType.WIFI
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> ConnectionType.MOBILE
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> ConnectionType.ETHERNET
                else -> ConnectionType.OTHER
            }
        } else {
            @Suppress("DEPRECATION")
            val networkInfo = connectivityManager.activeNetworkInfo
            @Suppress("DEPRECATION")
            when (networkInfo?.type) {
                @Suppress("DEPRECATION")
                ConnectivityManager.TYPE_WIFI -> ConnectionType.WIFI
                @Suppress("DEPRECATION")
                ConnectivityManager.TYPE_MOBILE -> ConnectionType.MOBILE
                @Suppress("DEPRECATION")
                ConnectivityManager.TYPE_ETHERNET -> ConnectionType.ETHERNET
                else -> ConnectionType.OTHER
            }
        }
    }
    
    /**
     * Verifica la conectividad con el servidor
     */
    suspend fun checkServerConnectivity(): Flow<ServerConnectivityResult> = flow {
        emit(ServerConnectivityResult.Checking)
        
        // Primero verificar conexión a internet
        if (!isNetworkAvailable()) {
            emit(ServerConnectivityResult.NoInternet)
            return@flow
        }
        
        // Luego verificar conectividad con el servidor con timeout reducido
        try {
            val result = withTimeoutOrNull(5000) { // Reducido de 10 a 5 segundos
                apiService.healthCheck()
            }
            
            if (result != null && result.isSuccessful) {
                val healthResponse = result.body()
                if (healthResponse != null && healthResponse.status == "OK") {
                    emit(ServerConnectivityResult.Connected(
                        serverUrl = NetworkConfig.AWS_PRODUCTION_URL,
                        connectionType = getConnectionType(),
                        responseTime = System.currentTimeMillis() // Simplificado
                    ))
                } else {
                    emit(ServerConnectivityResult.ServerError("Servidor no disponible"))
                }
            } else {
                emit(ServerConnectivityResult.ServerError(
                    result?.message() ?: "Error de conexión al servidor"
                ))
            }
        } catch (e: Exception) {
            when {
                e.message?.contains("timeout", ignoreCase = true) == true -> {
                    emit(ServerConnectivityResult.Timeout)
                }
                e.message?.contains("connection", ignoreCase = true) == true -> {
                    emit(ServerConnectivityResult.ConnectionError(e.message ?: "Error de conexión"))
                }
                else -> {
                    emit(ServerConnectivityResult.ServerError(e.message ?: "Error desconocido"))
                }
            }
        }
    }
    
    /**
     * Verifica la configuración de red AWS Production
     */
    suspend fun findBestConfiguration(): Flow<NetworkTestResult> = flow {
        emit(NetworkTestResult.Testing("aws_production"))

        try {
            val result = withTimeoutOrNull(5000) {
                apiService.healthCheck()
            }

            if (result?.isSuccessful == true) {
                emit(NetworkTestResult.Success("aws_production", NetworkConfig.AWS_PRODUCTION_URL))
            } else {
                emit(NetworkTestResult.Failed("aws_production", "No responde"))
            }
        } catch (e: Exception) {
            emit(NetworkTestResult.Failed("aws_production", e.message ?: "Error"))
        }
    }
}

/**
 * Tipos de conexión disponibles
 */
enum class ConnectionType {
    WIFI, MOBILE, ETHERNET, OTHER, NONE
}

/**
 * Resultado de la verificación de conectividad del servidor
 */
sealed class ServerConnectivityResult {
    object Checking : ServerConnectivityResult()
    object NoInternet : ServerConnectivityResult()
    object Timeout : ServerConnectivityResult()
    data class Connected(
        val serverUrl: String,
        val connectionType: ConnectionType,
        val responseTime: Long
    ) : ServerConnectivityResult()
    data class ConnectionError(val message: String) : ServerConnectivityResult()
    data class ServerError(val message: String) : ServerConnectivityResult()
}

/**
 * Resultado de las pruebas de configuración de red
 */
sealed class NetworkTestResult {
    data class Testing(val environment: String) : NetworkTestResult()
    data class Success(val environment: String, val url: String) : NetworkTestResult()
    data class Failed(val environment: String, val reason: String) : NetworkTestResult()
    object AllFailed : NetworkTestResult()
}