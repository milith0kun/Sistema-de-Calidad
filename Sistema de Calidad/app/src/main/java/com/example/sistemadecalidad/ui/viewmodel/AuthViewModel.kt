package com.example.sistemadecalidad.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.model.User
import com.example.sistemadecalidad.data.repository.AuthRepository
import com.example.sistemadecalidad.data.auth.AuthStateManager
import com.example.sistemadecalidad.data.auth.AuthState
// import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
// import javax.inject.Inject

/**
 * ViewModel para manejar la autenticación y estado del usuario
 * Temporalmente sin Hilt para pruebas de compilación
 */
// @HiltViewModel
class AuthViewModel /* @Inject constructor( */ (
    private val authRepository: AuthRepository,
    private val preferencesManager: PreferencesManager,
    private val authStateManager: AuthStateManager
) : ViewModel() {
    
    // Estado de la UI
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    // Usuario actual
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()
    
    // Estado de autenticación
    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()
    
    // Flag para evitar verificaciones múltiples
    private var isVerifying = false
    private var hasInitialized = false
    
    init {
        // Verificar si hay una sesión activa al inicializar
        checkAuthenticationStatus()
    }
    
    /**
     * Verificar el estado de autenticación al iniciar la app
     */
    private fun checkAuthenticationStatus() {
        if (hasInitialized || isVerifying) return
        
        viewModelScope.launch {
            isVerifying = true
            try {
                // Obtener valores únicos sin usar collect anidado
                val isLoggedIn = preferencesManager.isLoggedIn().first()
                if (isLoggedIn) {
                    val token = preferencesManager.getToken().first()
                    if (token != null) {
                        verifyTokenSilently(token)
                    } else {
                        _isAuthenticated.value = false
                    }
                } else {
                    _isAuthenticated.value = false
                }
                hasInitialized = true
            } finally {
                isVerifying = false
            }
        }
    }
    
    /**
     * Realizar login
     */
    fun login(email: String, password: String) {
        viewModelScope.launch {
            android.util.Log.d("AuthViewModel", "=== INICIANDO LOGIN ===")
            android.util.Log.d("AuthViewModel", "Email: $email")
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            authRepository.login(email, password).collect { result ->
                result.fold(
                    onSuccess = { loginResponse ->
                        android.util.Log.d("AuthViewModel", "✅ Login exitoso desde API")
                        android.util.Log.d("AuthViewModel", "Token recibido: ${loginResponse.token?.take(20)}...")
                        android.util.Log.d("AuthViewModel", "Usuario recibido: ${loginResponse.user}")
                        android.util.Log.d("AuthViewModel", "Nombre completo: ${loginResponse.user?.nombreCompleto}")
                        android.util.Log.d("AuthViewModel", "Cargo: ${loginResponse.user?.cargo}")
                        
                        try {
                            // Guardar token y datos del usuario - ESPERAR a que termine
                            loginResponse.token?.let { token ->
                                android.util.Log.d("AuthViewModel", "Guardando token...")
                                preferencesManager.saveToken(token)
                                android.util.Log.d("AuthViewModel", "Token guardado en DataStore")
                            }
                            
                            loginResponse.user?.let { user ->
                                android.util.Log.d("AuthViewModel", "Guardando datos de usuario...")
                                android.util.Log.d("AuthViewModel", "Usuario a guardar: ID=${user.id}, Nombre=${user.nombre}, Apellido=${user.apellido}, Cargo=${user.cargo}")
                                preferencesManager.saveUser(user)
                                _currentUser.value = user
                                android.util.Log.d("AuthViewModel", "Usuario guardado en DataStore y actualizado en currentUser")
                            }
                            
                            // Verificar que se guardó correctamente
                            val isLoggedIn = preferencesManager.isLoggedIn().first()
                            val savedToken = preferencesManager.getToken().first()
                            val savedUser = preferencesManager.getUser().first()
                            android.util.Log.d("AuthViewModel", "=== VERIFICACIÓN POST-GUARDADO ===")
                            android.util.Log.d("AuthViewModel", "isLoggedIn: $isLoggedIn")
                            android.util.Log.d("AuthViewModel", "Token guardado: ${savedToken?.take(20)}...")
                            android.util.Log.d("AuthViewModel", "Usuario guardado: $savedUser")
                            android.util.Log.d("AuthViewModel", "================================")
                            
                            // Actualizar estado de autenticación
                            _isAuthenticated.value = true
                            authStateManager.updateAuthState(AuthState.AUTHENTICATED)
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                isLoginSuccessful = true
                            )
                            android.util.Log.d("AuthViewModel", "✅ Login completado exitosamente - Estado de autenticación: isAuthenticated=true")
                            android.util.Log.d("AuthViewModel", "======================")
                        } catch (e: Exception) {
                            android.util.Log.e("AuthViewModel", "❌ Error al guardar datos de sesión: ${e.message}", e)
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                errorMessage = "Error al guardar sesión: ${e.message}"
                            )
                        }
                    },
                    onFailure = { exception ->
                        android.util.Log.e("AuthViewModel", "❌ Error en login: ${exception.message}")
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = exception.message ?: "Error desconocido"
                        )
                    }
                )
            }
        }
    }
    
    /**
     * Verificar token JWT (silenciosamente, sin logout automático)
     */
    private fun verifyTokenSilently(token: String) {
        viewModelScope.launch {
            authRepository.verifyToken(token).collect { result ->
                result.fold(
                    onSuccess = { user ->
                        _currentUser.value = user
                        _isAuthenticated.value = true
                    },
                    onFailure = {
                        // Token inválido, solo limpiar estado sin logout forzado
                        _currentUser.value = null
                        _isAuthenticated.value = false
                    }
                )
            }
        }
    }
    
    /**
     * Verificar token JWT (con logout explícito si falla)
     */
    private fun verifyToken(token: String) {
        viewModelScope.launch {
            authRepository.verifyToken(token).collect { result ->
                result.fold(
                    onSuccess = { user ->
                        _currentUser.value = user
                        _isAuthenticated.value = true
                    },
                    onFailure = {
                        // Token inválido, limpiar sesión
                        logout()
                    }
                )
            }
        }
    }
    
    /**
     * Cerrar sesión
     */
    fun logout() {
        viewModelScope.launch {
            android.util.Log.d("AuthViewModel", "Cerrando sesión...")
            
            // Primero cambiar el estado en memoria
            _isAuthenticated.value = false
            _currentUser.value = null
            _uiState.value = AuthUiState() // Reset UI state
            authStateManager.updateAuthState(AuthState.UNAUTHENTICATED)
            
            // Luego limpiar DataStore (operación suspendible)
            preferencesManager.logout()
            
            android.util.Log.d("AuthViewModel", "Sesión cerrada exitosamente")
        }
    }
    
    /**
     * Limpiar mensajes de error
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    /**
     * Reset del estado de login exitoso
     */
    fun resetLoginSuccess() {
        _uiState.value = _uiState.value.copy(isLoginSuccessful = false)
    }
    
    /**
     * Verificar conectividad con el servidor
     */
    fun checkServerConnection() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCheckingConnection = true)
            
            authRepository.checkServerHealth().collect { result ->
                result.fold(
                    onSuccess = {
                        _uiState.value = _uiState.value.copy(
                            isCheckingConnection = false,
                            isServerConnected = true
                        )
                    },
                    onFailure = { exception ->
                        _uiState.value = _uiState.value.copy(
                            isCheckingConnection = false,
                            isServerConnected = false,
                            errorMessage = "No se puede conectar al servidor: ${exception.message}"
                        )
                    }
                )
            }
        }
    }
}

/**
 * Estado de la UI para autenticación
 */
data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoginSuccessful: Boolean = false,
    val errorMessage: String? = null,
    val isCheckingConnection: Boolean = false,
    val isServerConnected: Boolean? = null
)