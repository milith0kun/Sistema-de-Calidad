package com.example.sistemadecalidad.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.model.*
import com.example.sistemadecalidad.data.repository.FichadoRepository
import com.example.sistemadecalidad.data.auth.AuthStateManager
import com.example.sistemadecalidad.utils.LocationManager
// import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
// import javax.inject.Inject

/**
 * ViewModel para manejar las operaciones de fichado
 * Temporalmente sin Hilt para pruebas de compilación
 */
// @HiltViewModel
class FichadoViewModel /* @Inject constructor( */ (
    private val fichadoRepository: FichadoRepository,
    private val preferencesManager: PreferencesManager,
    private val locationManager: LocationManager,
    val authStateManager: AuthStateManager // Hacer público para acceso desde las pantallas
) : ViewModel() {
    
    // Estado de la UI
    private val _uiState = MutableStateFlow(FichadoUiState())
    val uiState: StateFlow<FichadoUiState> = _uiState.asStateFlow()
    
    // Dashboard del día actual
    private val _dashboardHoy = MutableStateFlow<DashboardHoyResponse?>(null)
    val dashboardHoy: StateFlow<DashboardHoyResponse?> = _dashboardHoy.asStateFlow()
    
    // Historial de fichados
    private val _historial = MutableStateFlow<List<FichadoHistorial>>(emptyList())
    val historial: StateFlow<List<FichadoHistorial>> = _historial.asStateFlow()
    
    // Resumen para analítica
    private val _resumen = MutableStateFlow<ResumenResponse?>(null)
    val resumen: StateFlow<ResumenResponse?> = _resumen.asStateFlow()
    
    init {
        // Observar eventos de token expirado
        observeTokenExpiredEvents()
        
        // Sincronizar configuración GPS al inicializar
        android.util.Log.i("FichadoViewModel", "Inicializando ViewModel - Sincronizando GPS automáticamente")
        sincronizarConfiguracionGPS()
    }
    
    /**
     * Observa eventos de token expirado y maneja logout automático
     */
    private fun observeTokenExpiredEvents() {
        viewModelScope.launch {
            authStateManager.tokenExpiredEvent.collect { timestamp ->
                if (timestamp != null) {
                    android.util.Log.w("FichadoViewModel", "🚫 Token expirado detectado - actualizando UI")
                    
                    // Actualizar UI para mostrar que la sesión expiró
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                        isEntradaExitosa = false,
                        isSalidaExitosa = false
                    )
                    
                    // Limpiar datos locales
                    _dashboardHoy.value = null
                    _historial.value = emptyList()
                    _resumen.value = null
                    
                    // Marcar evento como manejado
                    authStateManager.clearTokenExpiredEvent()
                }
            }
        }
    }
    
    /**
     * Obtener token del usuario actual
     */
    private suspend fun getAuthToken(): String? {
        return preferencesManager.getToken().first()
    }
    
    /**
     * Registrar entrada (fichado de entrada)
     */
    fun registrarEntrada(
        metodo: String = "MANUAL",
        latitud: Double? = null,
        longitud: Double? = null,
        codigoQr: String? = null
    ) {
        viewModelScope.launch {
            android.util.Log.d("FichadoViewModel", "registrarEntrada llamado: metodo=$metodo, lat=$latitud, lon=$longitud")
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            val token = getAuthToken()
            if (token == null) {
                android.util.Log.e("FichadoViewModel", "No hay token de sesión")
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "No hay sesión activa"
                )
                return@launch
            }
            
            android.util.Log.d("FichadoViewModel", "Token obtenido, llamando a repository")
            fichadoRepository.registrarEntrada(token, metodo, latitud, longitud, codigoQr)
                .collect { result ->
                    result.fold(
                        onSuccess = { response ->
                            android.util.Log.d("FichadoViewModel", "Entrada registrada exitosamente: ${response.message}")
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                isEntradaExitosa = true,
                                ultimaHoraEntrada = response.hora
                            )
                            // Actualizar dashboard después de registrar entrada con un pequeño delay
                            // para asegurar que el backend haya procesado completamente
                            viewModelScope.launch {
                                kotlinx.coroutines.delay(1000) // 1 segundo de delay
                                android.util.Log.d("FichadoViewModel", "Actualizando dashboard después de entrada exitosa")
                                obtenerDashboardHoy()
                            }
                        },
                        onFailure = { exception ->
                            android.util.Log.e("FichadoViewModel", "Error al registrar entrada: ${exception.message}")
                            
                            // Si es error 403, el token expiró
                            val errorMsg = if (exception.message?.contains("403") == true) {
                                // Limpiar token expirado
                                viewModelScope.launch {
                                    preferencesManager.clearToken()
                                }
                                "Token expirado. Por favor, cierra sesión y vuelve a iniciar sesión"
                            } else {
                                exception.message ?: "Error al registrar entrada"
                            }
                            
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                errorMessage = errorMsg
                            )
                        }
                    )
                }
        }
    }
    
    /**
     * Registrar salida (fichado de salida)
     */
    fun registrarSalida(
        metodo: String = "MANUAL",
        latitud: Double? = null,
        longitud: Double? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            val token = getAuthToken()
            if (token == null) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "No hay sesión activa"
                )
                return@launch
            }
            
            fichadoRepository.registrarSalida(token, metodo, latitud, longitud)
                .collect { result ->
                    result.fold(
                        onSuccess = { response ->
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                isSalidaExitosa = true,
                                ultimaHoraSalida = response.hora,
                                horasTrabajadas = response.horasTrabajadas
                            )
                            // Actualizar dashboard después de registrar salida con un pequeño delay
                            // para asegurar que el backend haya procesado completamente
                            viewModelScope.launch {
                                kotlinx.coroutines.delay(1000) // 1 segundo de delay
                                android.util.Log.d("FichadoViewModel", "Actualizando dashboard después de salida exitosa")
                                obtenerDashboardHoy()
                            }
                        },
                        onFailure = { exception ->
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                errorMessage = exception.message ?: "Error al registrar salida"
                            )
                        }
                    )
                }
        }
    }
    
    /**
     * Obtener información del dashboard del día actual
     */
    fun obtenerDashboardHoy() {
        viewModelScope.launch {
            val token = getAuthToken()
            if (token == null) return@launch
            
            fichadoRepository.obtenerDashboardHoy(token).collect { result ->
                result.fold(
                    onSuccess = { dashboard ->
                        _dashboardHoy.value = dashboard
                    },
                    onFailure = { exception ->
                        _uiState.value = _uiState.value.copy(
                            errorMessage = "Error al obtener dashboard: ${exception.message}"
                        )
                    }
                )
            }
        }
    }
    
    /**
     * Obtener historial de fichados
     */
    fun obtenerHistorial() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingHistorial = true)
            
            val token = getAuthToken()
            if (token == null) {
                _uiState.value = _uiState.value.copy(isLoadingHistorial = false)
                return@launch
            }
            
            fichadoRepository.obtenerHistorial(token).collect { result ->
                result.fold(
                    onSuccess = { fichados ->
                        _historial.value = fichados
                        _uiState.value = _uiState.value.copy(isLoadingHistorial = false)
                    },
                    onFailure = { exception ->
                        _uiState.value = _uiState.value.copy(
                            isLoadingHistorial = false,
                            errorMessage = "Error al obtener historial: ${exception.message}"
                        )
                    }
                )
            }
        }
    }
    
    /**
     * Obtener resumen para analítica
     */
    fun obtenerResumen() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingResumen = true)
            
            val token = getAuthToken()
            if (token == null) {
                _uiState.value = _uiState.value.copy(isLoadingResumen = false)
                return@launch
            }
            
            fichadoRepository.obtenerResumen(token).collect { result ->
                result.fold(
                    onSuccess = { resumen ->
                        _resumen.value = resumen
                        _uiState.value = _uiState.value.copy(isLoadingResumen = false)
                    },
                    onFailure = { exception ->
                        _uiState.value = _uiState.value.copy(
                            isLoadingResumen = false,
                            errorMessage = "Error al obtener resumen: ${exception.message}"
                        )
                    }
                )
            }
        }
    }
    
    /**
     * Obtener y guardar configuración GPS del backend
     * Debe llamarse al iniciar la app para sincronizar la ubicación configurada por Admin
     */
    fun sincronizarConfiguracionGPS() {
        viewModelScope.launch {
            android.util.Log.i("FichadoViewModel", "Sincronizando configuración GPS del backend...")
            
            val token = getAuthToken()
            if (token == null) {
                android.util.Log.w("FichadoViewModel", "No hay token, no se puede sincronizar GPS")
                return@launch
            }
            
            try {
                fichadoRepository.obtenerConfiguracionGPS(token).collect { result ->
                    result.fold(
                        onSuccess = { response ->
                            if (response.success && response.data != null) {
                                val data = response.data
                                android.util.Log.i("FichadoViewModel", "Configuración GPS obtenida: lat=${data.latitud}, lon=${data.longitud}, radio=${data.radioMetros}")
                                
                                // Guardar en PreferencesManager si tenemos valores válidos
                                if (data.latitud != null && data.longitud != null && data.radioMetros != null) {
                                    preferencesManager.saveLocationConfig(
                                        latitude = data.latitud,
                                        longitude = data.longitud,
                                        radius = data.radioMetros,
                                        gpsEnabled = true // Siempre activado desde el backend
                                    )
                                    
                                    // Recargar configuración en LocationManager para aplicar cambios inmediatamente
                                    locationManager.reloadLocationConfig()
                                    
                                    android.util.Log.i("FichadoViewModel", "✅ Configuración GPS guardada localmente y recargada en LocationManager")
                                } else {
                                    android.util.Log.w("FichadoViewModel", "Configuración GPS incompleta, usando valores por defecto")
                                }
                            } else {
                                android.util.Log.w("FichadoViewModel", "No hay configuración GPS en el backend: ${response.message}")
                            }
                        },
                        onFailure = { exception ->
                            android.util.Log.e("FichadoViewModel", "Error al obtener configuración GPS: ${exception.message}")
                        }
                    )
                }
            } catch (e: Exception) {
                android.util.Log.e("FichadoViewModel", "Excepción al sincronizar GPS: ${e.message}")
            }
        }
    }

    /**
     * Limpiar mensajes de error
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    /**
     * Reset de estados de éxito
     */
    fun resetSuccessStates() {
        _uiState.value = _uiState.value.copy(
            isEntradaExitosa = false,
            isSalidaExitosa = false
        )
    }
    
    /**
     * Inicializar datos (llamar al entrar a las pantallas)
     */
    fun inicializarDatos() {
        obtenerDashboardHoy()
    }
}

/**
 * Estado de la UI para fichado
 */
data class FichadoUiState(
    val isLoading: Boolean = false,
    val isLoadingHistorial: Boolean = false,
    val isLoadingResumen: Boolean = false,
    val isEntradaExitosa: Boolean = false,
    val isSalidaExitosa: Boolean = false,
    val ultimaHoraEntrada: String? = null,
    val ultimaHoraSalida: String? = null,
    val horasTrabajadas: String? = null,
    val errorMessage: String? = null
)