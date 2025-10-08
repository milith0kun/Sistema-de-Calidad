package com.example.sistemadecalidad.data.auth

import android.content.Context
import android.util.Log
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.repository.AuthRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

/**
 * Gestor global del estado de autenticación
 * Maneja eventos de tokens expirados y logout automático
 */
class AuthStateManager private constructor(
    private val context: Context,
    private val preferencesManager: PreferencesManager,
    private val authRepository: AuthRepository
) {
    companion object {
        private const val TAG = "AuthStateManager"
        
        @Volatile
        private var INSTANCE: AuthStateManager? = null
        
        fun getInstance(context: Context, preferencesManager: PreferencesManager, authRepository: AuthRepository): AuthStateManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: AuthStateManager(context, preferencesManager, authRepository).also { INSTANCE = it }
            }
        }
    }

    // Estados de autenticación
    private val _authState = MutableStateFlow(AuthState.UNKNOWN)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _tokenExpiredEvent = MutableStateFlow<Long?>(null)
    val tokenExpiredEvent: StateFlow<Long?> = _tokenExpiredEvent.asStateFlow()

    // Estado para mostrar el diálogo de token expirado
    private val _showTokenExpiredDialog = MutableStateFlow(false)
    val showTokenExpiredDialog: StateFlow<Boolean> = _showTokenExpiredDialog.asStateFlow()
    
    // Variables para renovación automática de tokens
    private val refreshScope = CoroutineScope(Dispatchers.IO)
    private var refreshJob: Job? = null
    private val TOKEN_REFRESH_INTERVAL_MINUTES = 50L // Renovar cada 50 minutos (tokens duran 60 min)

    /**
     * Notifica que el token ha expirado
     * Llamado desde el AuthInterceptor
     */
    suspend fun notifyTokenExpired() {
        Log.w(TAG, "🚫 Token expirado detectado - iniciando logout automático")
        
        try {
            // Mostrar diálogo de token expirado
            _showTokenExpiredDialog.value = true
            
            // Limpiar datos de autenticación
            preferencesManager.logout()
            
            // Actualizar estado
            _authState.value = AuthState.UNAUTHENTICATED
            _tokenExpiredEvent.value = System.currentTimeMillis()
            
            Log.i(TAG, "✅ Logout automático completado")
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error durante logout automático: ${e.message}")
        }
    }

    /**
     * Actualiza el estado de autenticación
     */
    fun updateAuthState(state: AuthState) {
        _authState.value = state
        Log.d(TAG, "🔄 Estado de autenticación actualizado: $state")
        
        // Manejar renovación automática según el estado
        when (state) {
            AuthState.AUTHENTICATED -> {
                startTokenRefresh()
            }
            AuthState.UNAUTHENTICATED, AuthState.TOKEN_EXPIRED -> {
                stopTokenRefresh()
            }
            AuthState.UNKNOWN -> {
                // No hacer nada en estado desconocido
            }
        }
    }

    /**
     * Limpia el evento de token expirado (después de ser manejado)
     */
    fun clearTokenExpiredEvent() {
        _tokenExpiredEvent.value = null
    }

    /**
     * Oculta el diálogo de token expirado
     */
    fun dismissTokenExpiredDialog() {
        _showTokenExpiredDialog.value = false
    }
    
    /**
     * Inicia la renovación automática de tokens
     */
    fun startTokenRefresh() {
        stopTokenRefresh() // Detener cualquier renovación anterior
        
        refreshJob = refreshScope.launch {
            while (isAuthenticated()) {
                try {
                    delay(TimeUnit.MINUTES.toMillis(TOKEN_REFRESH_INTERVAL_MINUTES))
                    
                    if (isAuthenticated()) {
                        val currentToken = preferencesManager.getToken().first()
                        if (currentToken != null) {
                            Log.d(TAG, "Iniciando renovación automática de token")
                            refreshTokenInternal(currentToken)
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error en renovación automática de token", e)
                    // Si hay error, esperar un poco antes de intentar de nuevo
                    delay(TimeUnit.MINUTES.toMillis(5))
                }
            }
        }
    }
    
    /**
     * Detiene la renovación automática de tokens
     */
    fun stopTokenRefresh() {
        refreshJob?.cancel()
        refreshJob = null
    }
    
    /**
     * Renueva el token manualmente
     */
    suspend fun refreshToken(): Boolean {
        val currentToken = preferencesManager.getToken().first()
        return if (currentToken != null) {
            refreshTokenInternal(currentToken)
        } else {
            false
        }
    }
    
    /**
     * Método interno para renovar el token
     */
    private suspend fun refreshTokenInternal(currentToken: String): Boolean {
        return try {
            authRepository.refreshToken(currentToken).collect { result ->
                result.fold(
                    onSuccess = { loginResponse ->
                        Log.d(TAG, "Token renovado exitosamente")
                        // Actualizar el token en las preferencias
                        preferencesManager.saveToken(loginResponse.token!!)
                        if (loginResponse.user != null) {
                            preferencesManager.saveUser(loginResponse.user)
                        }
                    },
                    onFailure = { exception ->
                        Log.e(TAG, "Error al renovar token: ${exception.message}")
                        // Si falla la renovación, notificar que el token expiró
                        notifyTokenExpired()
                    }
                )
            }
            true
        } catch (e: Exception) {
            Log.e(TAG, "Excepción al renovar token", e)
            notifyTokenExpired()
            false
        }
    }

    /**
     * Verifica si el usuario está autenticado
     */
    fun isAuthenticated(): Boolean {
        return _authState.value == AuthState.AUTHENTICATED
    }
}

/**
 * Estados posibles de autenticación
 */
enum class AuthState {
    UNKNOWN,           // Estado inicial
    AUTHENTICATED,     // Usuario autenticado
    UNAUTHENTICATED,   // Usuario no autenticado
    TOKEN_EXPIRED      // Token expirado (temporal)
}