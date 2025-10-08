package com.example.sistemadecalidad.data.repository

import com.example.sistemadecalidad.data.api.ApiService
import com.example.sistemadecalidad.data.api.QRValidationResponse
import com.example.sistemadecalidad.data.model.*
import com.example.sistemadecalidad.utils.TimeUtils
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
// import javax.inject.Inject
// import javax.inject.Singleton

/**
 * Repositorio para manejar las operaciones de fichado
 * Temporalmente sin Hilt para pruebas de compilación
 */
// @Singleton
class FichadoRepository /* @Inject constructor */ (
    private val apiService: ApiService
) {
    
    /**
     * Registrar entrada (fichado de entrada)
     */
    suspend fun registrarEntrada(
        token: String,
        metodo: String = "MANUAL",
        latitud: Double? = null,
        longitud: Double? = null,
        codigoQr: String? = null
    ): Flow<Result<FichadoResponse>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            
            // Obtener fecha y hora actual en zona horaria de Lima, Perú
            val fechaActual = TimeUtils.getCurrentPeruDate()
            val fechaFormateada = TimeUtils.formatDateForBackend(fechaActual)
            val horaFormateada = TimeUtils.formatTimeForBackend(fechaActual)
            val timestampFormateado = TimeUtils.getPeruTimestamp(fechaActual)
            
            val request = FichadoEntradaRequest(
                metodo = metodo,
                latitud = latitud,
                longitud = longitud,
                codigoQr = codigoQr,
                fecha = fechaFormateada,
                hora = horaFormateada,
                timestamp = timestampFormateado
            )
            
            android.util.Log.d("FichadoRepository", "Enviando petición registrarEntrada")
            android.util.Log.d("FichadoRepository", "Token (primeros 20 chars): ${bearerToken.take(20)}...")
            android.util.Log.d("FichadoRepository", "Request: $request")
            
            val response = apiService.registrarEntrada(bearerToken, request)
            
            android.util.Log.d("FichadoRepository", "Response code: ${response.code()}")
            android.util.Log.d("FichadoRepository", "Response message: ${response.message()}")
            android.util.Log.d("FichadoRepository", "Response body: ${response.body()}")
            android.util.Log.d("FichadoRepository", "Response errorBody: ${response.errorBody()?.string()}")
            
            if (response.isSuccessful) {
                val fichadoResponse = response.body()
                if (fichadoResponse != null) {
                    if (fichadoResponse.success) {
                        emit(Result.success(fichadoResponse))
                    } else {
                        emit(Result.failure(Exception(fichadoResponse.error ?: "Error al registrar entrada")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Error HTTP: ${response.code()} - ${response.message()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Registrar salida (fichado de salida)
     */
    suspend fun registrarSalida(
        token: String,
        metodo: String = "MANUAL",
        latitud: Double? = null,
        longitud: Double? = null
    ): Flow<Result<FichadoResponse>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            
            // Obtener fecha y hora actual en zona horaria de Lima, Perú
            val fechaActual = TimeUtils.getCurrentPeruDate()
            val fechaFormateada = TimeUtils.formatDateForBackend(fechaActual)
            val horaFormateada = TimeUtils.formatTimeForBackend(fechaActual)
            val timestampFormateado = TimeUtils.getPeruTimestamp(fechaActual)
            
            val request = FichadoSalidaRequest(
                metodo = metodo,
                latitud = latitud,
                longitud = longitud,
                fecha = fechaFormateada,
                hora = horaFormateada,
                timestamp = timestampFormateado
            )
            
            val response = apiService.registrarSalida(bearerToken, request)
            
            if (response.isSuccessful) {
                val fichadoResponse = response.body()
                if (fichadoResponse != null) {
                    if (fichadoResponse.success) {
                        emit(Result.success(fichadoResponse))
                    } else {
                        emit(Result.failure(Exception(fichadoResponse.error ?: "Error al registrar salida")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Error HTTP: ${response.code()} - ${response.message()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Obtener historial de fichados
     */
    suspend fun obtenerHistorial(token: String): Flow<Result<List<FichadoHistorial>>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val response = apiService.obtenerHistorial(bearerToken)
            
            if (response.isSuccessful) {
                val historialResponse = response.body()
                if (historialResponse != null) {
                    if (historialResponse.success && historialResponse.data != null) {
                        emit(Result.success(historialResponse.data))
                    } else {
                        emit(Result.failure(Exception(historialResponse.error ?: "Error al obtener historial")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Error HTTP: ${response.code()} - ${response.message()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Obtener información del dashboard del día actual
     */
    suspend fun obtenerDashboardHoy(token: String): Flow<Result<DashboardHoyResponse>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val response = apiService.obtenerDashboardHoy(bearerToken)
            
            if (response.isSuccessful) {
                val dashboardResponse = response.body()
                if (dashboardResponse != null) {
                    if (dashboardResponse.success) {
                        emit(Result.success(dashboardResponse))
                    } else {
                        emit(Result.failure(Exception(dashboardResponse.error ?: "Error al obtener dashboard")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Error HTTP: ${response.code()} - ${response.message()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Obtener resumen para analítica
     */
    suspend fun obtenerResumen(token: String): Flow<Result<ResumenResponse>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val response = apiService.obtenerResumen(bearerToken)
            
            if (response.isSuccessful) {
                val resumenResponse = response.body()
                if (resumenResponse != null) {
                    if (resumenResponse.success) {
                        emit(Result.success(resumenResponse))
                    } else {
                        emit(Result.failure(Exception(resumenResponse.error ?: "Error al obtener resumen")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Error HTTP: ${response.code()} - ${response.message()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Validar código QR (para futuras implementaciones)
     */
    suspend fun validarCodigoQR(
        token: String,
        codigo: String
    ): Flow<Result<QRValidationResponse>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val response = apiService.validarCodigoQR(bearerToken, codigo)
            
            if (response.isSuccessful) {
                val qrResponse = response.body()
                if (qrResponse != null) {
                    if (qrResponse.success) {
                        emit(Result.success(qrResponse))
                    } else {
                        emit(Result.failure(Exception(qrResponse.error ?: "Código QR inválido")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Error HTTP: ${response.code()} - ${response.message()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Obtener configuración GPS del backend
     * La app debe llamar a este endpoint al iniciar para obtener la configuración actualizada
     */
    suspend fun obtenerConfiguracionGPS(
        token: String
    ): Flow<Result<com.example.sistemadecalidad.data.api.ConfiguracionGPSResponse>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            
            android.util.Log.d("FichadoRepository", "Obteniendo configuración GPS del backend...")
            val response = apiService.obtenerConfiguracionGPS(bearerToken)
            
            android.util.Log.d("FichadoRepository", "Response code GPS config: ${response.code()}")
            
            if (response.isSuccessful) {
                val gpsResponse = response.body()
                if (gpsResponse != null) {
                    emit(Result.success(gpsResponse))
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Error HTTP: ${response.code()} - ${response.message()}")))
            }
        } catch (e: Exception) {
            android.util.Log.e("FichadoRepository", "Excepción al obtener GPS config: ${e.message}")
            emit(Result.failure(e))
        }
    }
}