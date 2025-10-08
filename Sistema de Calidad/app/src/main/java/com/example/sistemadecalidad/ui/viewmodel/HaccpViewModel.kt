package com.example.sistemadecalidad.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.sistemadecalidad.data.api.Camara
import com.example.sistemadecalidad.data.api.Empleado
import com.example.sistemadecalidad.data.repository.HaccpRepository
import com.example.sistemadecalidad.data.local.PreferencesManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

import android.util.Log

/**
 * ViewModel para formularios HACCP
 */
class HaccpViewModel(
    private val haccpRepository: HaccpRepository,
    private val preferencesManager: PreferencesManager
) : ViewModel() {

    companion object {
        private const val TAG = "HaccpViewModel"
    }

    private val _uiState = MutableStateFlow(HaccpUiState())
    val uiState: StateFlow<HaccpUiState> = _uiState.asStateFlow()

    private val _camaras = MutableStateFlow<List<Camara>>(emptyList())
    val camaras: StateFlow<List<Camara>> = _camaras.asStateFlow()

    private val _empleados = MutableStateFlow<List<Empleado>>(emptyList())
    val empleados: StateFlow<List<Empleado>> = _empleados.asStateFlow()

    /**
     * Cargar cámaras frigoríficas
     */
    fun cargarCamaras() {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
                
                val token = preferencesManager.getToken().first() ?: run {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "No hay sesión activa"
                    )
                    return@launch
                }

                val result = haccpRepository.obtenerCamaras(token)
                
                result.onSuccess { camarasList ->
                    _camaras.value = camarasList
                    _uiState.value = _uiState.value.copy(isLoading = false)
                    Log.d(TAG, "✅ ${camarasList.size} cámaras cargadas")
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error cargando cámaras"
                    )
                    Log.e(TAG, "❌ Error cargando cámaras", error)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Error inesperado"
                )
                Log.e(TAG, "❌ Excepción cargando cámaras", e)
            }
        }
    }

    /**
     * Cargar empleados (opcionalmente filtrados por área)
     */
    fun cargarEmpleados(area: String? = null) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
                
                val token = preferencesManager.getToken().first() ?: run {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "No hay sesión activa"
                    )
                    return@launch
                }

                val result = haccpRepository.obtenerEmpleados(token, area)
                
                result.onSuccess { empleadosList ->
                    _empleados.value = empleadosList
                    _uiState.value = _uiState.value.copy(isLoading = false)
                    Log.d(TAG, "✅ ${empleadosList.size} empleados cargados")
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error cargando empleados"
                    )
                    Log.e(TAG, "❌ Error cargando empleados", error)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Error inesperado"
                )
                Log.e(TAG, "❌ Excepción cargando empleados", e)
            }
        }
    }

    /**
     * Registrar lavado de frutas
     */
    fun registrarLavadoFrutas(
        mes: Int,
        anio: Int,
        productoQuimico: String,
        concentracion: Double,
        nombreFruta: String,
        lavadoAgua: String,
        desinfeccion: String,
        concentracionCorrecta: String,
        tiempoDesinfeccion: Int,
        accionesCorrectivas: String?
    ) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null, successMessage = null)
                
                val token = preferencesManager.getToken().first() ?: run {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "No hay sesión activa"
                    )
                    return@launch
                }

                val result = haccpRepository.registrarLavadoFrutas(
                    token = token,
                    mes = mes,
                    anio = anio,
                    productoQuimico = productoQuimico,
                    concentracion = concentracion,
                    nombreFruta = nombreFruta,
                    lavadoAgua = lavadoAgua,
                    desinfeccion = desinfeccion,
                    concentracionCorrecta = concentracionCorrecta,
                    tiempoDesinfeccion = tiempoDesinfeccion,
                    accionesCorrectivas = accionesCorrectivas
                )
                
                result.onSuccess { response ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = response.message ?: "Registro guardado exitosamente",
                        isFormSuccess = true
                    )
                    Log.d(TAG, "✅ Lavado de frutas registrado")
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error guardando registro"
                    )
                    Log.e(TAG, "❌ Error en lavado de frutas", error)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Error inesperado"
                )
                Log.e(TAG, "❌ Excepción en lavado de frutas", e)
            }
        }
    }

    private val _supervisores = MutableStateFlow<List<Empleado>>(emptyList())
    val supervisores: StateFlow<List<Empleado>> = _supervisores.asStateFlow()
    
    /**
     * Cargar supervisores
     */
    fun cargarSupervisores(area: String? = null) {
        viewModelScope.launch {
            try {
                val token = preferencesManager.getToken().first() ?: return@launch
                val result = haccpRepository.obtenerSupervisores(token, area)
                
                result.onSuccess { supervisoresList ->
                    _supervisores.value = supervisoresList
                    Log.d(TAG, "✅ ${supervisoresList.size} supervisores cargados")
                }.onFailure { error ->
                    Log.e(TAG, "❌ Error cargando supervisores", error)
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Excepción cargando supervisores", e)
            }
        }
    }

    /**
     * Registrar control de cocción
     * El responsable se obtiene automáticamente del usuario logueado
     */
    fun registrarControlCoccion(
        productoCocinar: String,
        procesoCoccion: String,
        temperatura: Double,
        tiempoCoccion: Int,
        accionCorrectiva: String?
    ) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null, successMessage = null)
                
                val token = preferencesManager.getToken().first() ?: run {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "No hay sesión activa"
                    )
                    return@launch
                }

                val result = haccpRepository.registrarControlCoccion(
                    token = token,
                    productoCocinar = productoCocinar,
                    procesoCoccion = procesoCoccion,
                    temperatura = temperatura,
                    tiempoCoccion = tiempoCoccion,
                    accionCorrectiva = accionCorrectiva
                )
                
                result.onSuccess { response ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = response.message ?: "Control de cocción registrado exitosamente",
                        isFormSuccess = true
                    )
                    Log.d(TAG, "✅ Control de cocción registrado")
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error registrando control de cocción"
                    )
                    Log.e(TAG, "❌ Error en control de cocción", error)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Error: ${e.message}"
                )
                Log.e(TAG, "❌ Excepción en control de cocción", e)
            }
        }
    }

    /**
     * Registrar lavado de manos
     * El empleado_id debe ser pasado desde el screen (empleado seleccionado del área)
     */
    fun registrarLavadoManos(
        empleadoId: Int,
        area: String,
        turno: String?,
        firma: String?,
        procedimientoCorrecto: String,
        accionCorrectiva: String?,
        supervisorId: Int?
    ) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null, successMessage = null)
                
                val token = preferencesManager.getToken().first() ?: run {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "No hay sesión activa"
                    )
                    return@launch
                }

                val result = haccpRepository.registrarLavadoManos(
                    token = token,
                    empleadoId = empleadoId,
                    area = area,
                    turno = turno,
                    firma = firma,
                    procedimientoCorrecto = procedimientoCorrecto,
                    accionCorrectiva = accionCorrectiva,
                    supervisorId = supervisorId
                )
                
                result.onSuccess { response ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = response.message ?: "Registro guardado exitosamente",
                        isFormSuccess = true
                    )
                    Log.d(TAG, "✅ Lavado de manos registrado")
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error guardando registro"
                    )
                    Log.e(TAG, "❌ Error en lavado de manos", error)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Error inesperado"
                )
                Log.e(TAG, "❌ Excepción en lavado de manos", e)
            }
        }
    }

    /**
     * Registrar temperatura de cámaras
     */
    fun registrarTemperaturaCamaras(
        camaraId: Int,
        fecha: String,
        temperaturaManana: Double?,
        temperaturaTarde: Double?,
        accionesCorrectivas: String?
    ) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null, successMessage = null)
                
                val token = preferencesManager.getToken().first() ?: run {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "No hay sesión activa"
                    )
                    return@launch
                }

                val result = haccpRepository.registrarTemperaturaCamaras(
                    token = token,
                    camaraId = camaraId,
                    fecha = fecha,
                    temperaturaManana = temperaturaManana,
                    temperaturaTarde = temperaturaTarde,
                    accionesCorrectivas = accionesCorrectivas
                )
                
                result.onSuccess { response ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = response.message ?: "Registro guardado exitosamente",
                        isFormSuccess = true
                    )
                    Log.d(TAG, "✅ Temperatura cámara registrada")
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error guardando registro"
                    )
                    Log.e(TAG, "❌ Error en temperatura cámara", error)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Error inesperado"
                )
                Log.e(TAG, "❌ Excepción en temperatura cámara", e)
            }
        }
    }

    /**
     * Registrar recepción de abarrotes
     */
    fun registrarRecepcionAbarrotes(
        mes: Int,
        anio: Int,
        fecha: String,
        hora: String,
        nombreProveedor: String,
        nombreProducto: String,
        cantidadSolicitada: String,
        registroSanitarioVigente: Boolean,
        evaluacionVencimiento: String,
        conformidadEmpaque: String,
        uniformeCompleto: String,
        transporteAdecuado: String,
        puntualidad: String,
        observaciones: String?,
        accionCorrectiva: String?,
        supervisorId: Int
    ) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null, successMessage = null)
                
                val token = preferencesManager.getToken().first() ?: run {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "No hay sesión activa"
                    )
                    return@launch
                }

                val result = haccpRepository.registrarRecepcionAbarrotes(
                    token = token,
                    mes = mes,
                    anio = anio,
                    fecha = fecha,
                    hora = hora,
                    nombreProveedor = nombreProveedor,
                    nombreProducto = nombreProducto,
                    cantidadSolicitada = cantidadSolicitada,
                    registroSanitarioVigente = registroSanitarioVigente,
                    evaluacionVencimiento = evaluacionVencimiento,
                    conformidadEmpaque = conformidadEmpaque,
                    uniformeCompleto = uniformeCompleto,
                    transporteAdecuado = transporteAdecuado,
                    puntualidad = puntualidad,
                    observaciones = observaciones,
                    accionCorrectiva = accionCorrectiva,
                    supervisorId = supervisorId
                )
                
                result.onSuccess { response ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = response.message ?: "Recepción de abarrotes registrada correctamente",
                        isFormSuccess = true
                    )
                    Log.d(TAG, "✅ Recepción de abarrotes registrada")
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Error guardando registro"
                    )
                    Log.e(TAG, "❌ Error en recepción de abarrotes", error)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Error inesperado"
                )
                Log.e(TAG, "❌ Excepción en recepción de abarrotes", e)
            }
        }
    }
    
    /**
     * Registrar recepción de frutas y verduras
     */
    fun registrarRecepcionFrutasVerduras(
        mes: Int,
        anio: Int,
        fecha: String,
        hora: String,
        tipoControl: String,
        nombreProveedor: String,
        nombreProducto: String,
        cantidadSolicitada: String,
        pesoUnidadRecibido: Double,
        unidadMedida: String,
        estadoProducto: String,
        conformidadIntegridad: String,
        uniformeCompleto: String,
        transporteAdecuado: String,
        puntualidad: String,
        observaciones: String?,
        accionCorrectiva: String?,
        productoRechazado: Boolean,
        supervisorId: Int?
    ) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null, successMessage = null)
                
                val token = preferencesManager.getToken().first() ?: run {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "No hay sesión activa"
                    )
                    return@launch
                }

                val result = haccpRepository.registrarRecepcionMercaderia(
                    token = token,
                    mes = mes,
                    anio = anio,
                    fecha = fecha,
                    hora = hora,
                    tipoControl = tipoControl,
                    nombreProveedor = nombreProveedor,
                    nombreProducto = nombreProducto,
                    cantidadSolicitada = cantidadSolicitada,
                    pesoUnidadRecibido = pesoUnidadRecibido,
                    unidadMedida = unidadMedida,
                    estadoProducto = estadoProducto,
                    conformidadIntegridad = conformidadIntegridad,
                    uniformeCompleto = uniformeCompleto,
                    transporteAdecuado = transporteAdecuado,
                    puntualidad = puntualidad,
                    observaciones = observaciones,
                    accionCorrectiva = accionCorrectiva,
                    productoRechazado = productoRechazado,
                    supervisorId = supervisorId
                )
                
                result.onSuccess { response ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = response.message ?: "Recepción de frutas/verduras registrada correctamente",
                        isFormSuccess = true
                    )
                    Log.d(TAG, "✅ Recepción de frutas/verduras registrada")
                }.onFailure { error ->
                    val errorMessage = when {
                        error.message?.contains("network", ignoreCase = true) == true -> 
                            "Error de conexión. Verifique su conexión a internet."
                        error.message?.contains("timeout", ignoreCase = true) == true -> 
                            "Tiempo de espera agotado. Intente nuevamente."
                        error.message?.contains("unauthorized", ignoreCase = true) == true -> 
                            "Sesión expirada. Por favor inicie sesión nuevamente."
                        error.message?.contains("validation", ignoreCase = true) == true -> 
                            "Datos inválidos. Verifique la información ingresada."
                        error.message?.contains("server", ignoreCase = true) == true -> 
                            "Error del servidor. Intente más tarde."
                        error.message?.isNotBlank() == true -> error.message
                        else -> "Error al guardar el registro. Intente nuevamente."
                    }
                    
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = errorMessage
                    )
                    Log.e(TAG, "❌ Error en recepción de frutas/verduras: $errorMessage", error)
                }
            } catch (e: Exception) {
                val exceptionMessage = when (e) {
                    is java.net.UnknownHostException -> 
                        "Sin conexión a internet. Verifique su conexión."
                    is java.net.SocketTimeoutException -> 
                        "Tiempo de espera agotado. Intente nuevamente."
                    is java.net.ConnectException -> 
                        "No se puede conectar al servidor. Verifique su conexión."
                    is IllegalArgumentException -> 
                        "Error en el formato de datos. Contacte al administrador."
                    else -> e.message ?: "Error inesperado. Intente nuevamente."
                }
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = exceptionMessage
                )
                Log.e(TAG, "❌ Excepción en recepción de frutas/verduras: $exceptionMessage", e)
            }
        }
    }

    /**
     * Resetear estado de éxito del formulario
     */
    fun resetFormSuccess() {
        _uiState.value = _uiState.value.copy(isFormSuccess = false, successMessage = null, error = null)
    }

    /**
     * Limpiar mensajes de error y éxito
     */
    fun clearMessages() {
        _uiState.value = _uiState.value.copy(
            error = null,
            successMessage = null,
            isFormSuccess = false
        )
    }
}

/**
 * Estado UI para formularios HACCP
 */
data class HaccpUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,
    val isFormSuccess: Boolean = false
)
