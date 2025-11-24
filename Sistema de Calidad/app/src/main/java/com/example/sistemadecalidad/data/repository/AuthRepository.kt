package com.example.sistemadecalidad.data.repository

import com.example.sistemadecalidad.data.api.ApiService
import com.example.sistemadecalidad.data.model.ForgotPasswordRequest
import com.example.sistemadecalidad.data.model.LoginRequest
import com.example.sistemadecalidad.data.model.LoginResponse
import com.example.sistemadecalidad.data.model.RegisterRequest
import com.example.sistemadecalidad.data.model.RegisterResponse
import com.example.sistemadecalidad.data.model.User
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
// import javax.inject.Inject
// import javax.inject.Singleton

/**
 * Repositorio para manejar la autenticación
 * Temporalmente sin Hilt para pruebas de compilación
 */
// @Singleton
class AuthRepository /* @Inject constructor */ (
    private val apiService: ApiService
) {
    
    /**
     * Realizar login con email y contraseña
     */
    suspend fun login(email: String, password: String): Flow<Result<LoginResponse>> = flow {
        try {
            val request = LoginRequest(email = email, password = password)
            val response = apiService.login(request)
            
            if (response.isSuccessful) {
                val loginResponse = response.body()
                if (loginResponse != null) {
                    if (loginResponse.success && loginResponse.token != null) {
                        emit(Result.success(loginResponse))
                    } else {
                        emit(Result.failure(Exception(loginResponse.error ?: "Error desconocido en login")))
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
     * Verificar si el token JWT sigue siendo válido
     */
    suspend fun verifyToken(token: String): Flow<Result<User>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val response = apiService.verifyToken(bearerToken)
            
            if (response.isSuccessful) {
                val verifyResponse = response.body()
                if (verifyResponse != null) {
                    if (verifyResponse.success && verifyResponse.user != null) {
                        emit(Result.success(verifyResponse.user))
                    } else {
                        emit(Result.failure(Exception(verifyResponse.error ?: "Token inválido")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Token expirado o inválido")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Renovar token JWT
     */
    suspend fun refreshToken(token: String): Flow<Result<LoginResponse>> = flow {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val response = apiService.refreshToken(bearerToken)
            
            if (response.isSuccessful) {
                val refreshResponse = response.body()
                if (refreshResponse != null) {
                    if (refreshResponse.success && refreshResponse.token != null) {
                        emit(Result.success(refreshResponse))
                    } else {
                        emit(Result.failure(Exception(refreshResponse.error ?: "Error al renovar token")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                emit(Result.failure(Exception("Error al renovar token: ${response.code()} - ${response.message()}")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Login con Google - Envía ID token al backend para validación
     */
    suspend fun loginWithGoogle(idToken: String): Flow<Result<LoginResponse>> = flow {
        try {
            val request = mapOf("idToken" to idToken)
            val response = apiService.loginWithGoogle(request)
            
            if (response.isSuccessful) {
                val loginResponse = response.body()
                if (loginResponse != null) {
                    if (loginResponse.success && loginResponse.token != null) {
                        emit(Result.success(loginResponse))
                    } else {
                        emit(Result.failure(Exception(loginResponse.error ?: "Error en autenticación con Google")))
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
     * Registrar nuevo usuario
     */
    suspend fun register(
        nombre: String,
        apellido: String,
        email: String,
        password: String,
        cargo: String?,
        area: String?
    ): Flow<Result<RegisterResponse>> = flow {
        try {
            val request = RegisterRequest(
                nombre = nombre,
                apellido = apellido,
                email = email,
                password = password,
                cargo = cargo ?: "",
                area = area ?: ""
            )
            val response = apiService.register(request)
            
            if (response.isSuccessful) {
                val registerResponse = response.body()
                if (registerResponse != null) {
                    if (registerResponse.success) {
                        emit(Result.success(registerResponse))
                    } else {
                        emit(Result.failure(Exception(registerResponse.error ?: registerResponse.message ?: "Error en registro")))
                    }
                } else {
                    emit(Result.failure(Exception("Respuesta vacía del servidor")))
                }
            } else {
                // Intentar parsear el error del servidor
                try {
                    val errorBody = response.errorBody()?.string()
                    emit(Result.failure(Exception(errorBody ?: "Error HTTP: ${response.code()}")))
                } catch (e: Exception) {
                    emit(Result.failure(Exception("Error HTTP: ${response.code()} - ${response.message()}")))
                }
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    /**
     * Solicitar recuperación de contraseña
     */
    suspend fun forgotPassword(email: String): Flow<Result<String>> = flow {
        try {
            val request = ForgotPasswordRequest(email = email)
            val response = apiService.forgotPassword(request)
            
            if (response.isSuccessful) {
                val forgotResponse = response.body()
                if (forgotResponse != null) {
                    if (forgotResponse.success) {
                        emit(Result.success(forgotResponse.message ?: "Instrucciones enviadas"))
                    } else {
                        emit(Result.failure(Exception(forgotResponse.error ?: "Error en solicitud")))
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
     * Verificar conectividad con el servidor
     */
    suspend fun checkServerHealth(): Flow<Result<Boolean>> = flow {
        try {
            val response = apiService.healthCheck()
            if (response.isSuccessful) {
                val healthResponse = response.body()
                if (healthResponse != null && healthResponse.status == "OK") {
                    emit(Result.success(true))
                } else {
                    emit(Result.failure(Exception("Servidor no disponible")))
                }
            } else {
                emit(Result.failure(Exception("No se puede conectar al servidor")))
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
}