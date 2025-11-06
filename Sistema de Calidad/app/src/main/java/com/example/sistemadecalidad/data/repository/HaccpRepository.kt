package com.example.sistemadecalidad.data.repository

import com.example.sistemadecalidad.data.api.*
import com.example.sistemadecalidad.data.model.ControlCoccionRequest
import com.example.sistemadecalidad.data.exceptions.RegistroDuplicadoException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import android.util.Log

/**
 * Repositorio para operaciones HACCP
 * Maneja las llamadas a la API de formularios de control HACCP
 */
class HaccpRepository(
    private val apiService: ApiService
) {
    companion object {
        private const val TAG = "HaccpRepository"
    }

    /**
     * Registrar control de lavado de frutas
     */
    suspend fun registrarLavadoFrutas(
        token: String,
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
    ): Result<HaccpResponse> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val request = LavadoFrutasRequest(
                mes,
                anio,
                productoQuimico,
                concentracion,
                nombreFruta,
                lavadoAgua,
                desinfeccion,
                concentracionCorrecta,
                tiempoDesinfeccion,
                accionesCorrectivas
            )
            
            Log.d(TAG, "Registrando lavado de frutas: $request")
            val response = apiService.registrarLavadoFrutas(bearerToken, request)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success) {
                    Log.d(TAG, "✅ Lavado de frutas registrado exitosamente")
                    Result.success(body)
                } else {
                    Log.e(TAG, "❌ Error en lavado de frutas: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                // Manejo específico para diferentes códigos de error HTTP
                when (response.code()) {
                    409 -> {
                        // Registro duplicado - parsear el mensaje específico del backend
                        try {
                            val errorBody = response.errorBody()?.string()
                            if (errorBody != null) {
                                val gson = com.google.gson.Gson()
                                val errorResponse = gson.fromJson(errorBody, HaccpResponse::class.java)
                                val mensaje = errorResponse.message ?: errorResponse.error ?: "Ya existe un registro para esta cámara hoy"
                                Log.w(TAG, "⚠️ Registro duplicado: $mensaje")
                                Result.failure(RegistroDuplicadoException(mensaje))
                            } else {
                                Log.w(TAG, "⚠️ Registro duplicado sin detalles")
                                Result.failure(RegistroDuplicadoException("Ya existe un registro de temperatura para esta cámara en el día de hoy"))
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "⚠️ Error parseando respuesta de registro duplicado")
                            Result.failure(RegistroDuplicadoException("Ya existe un registro de temperatura para esta cámara en el día de hoy"))
                        }
                    }
                    else -> {
                        val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                        Log.e(TAG, errorMsg)
                        Result.failure(Exception(errorMsg))
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción en lavado de frutas", e)
            Result.failure(e)
        }
    }

    /**
     * Registrar control de lavado de manos
     */
    suspend fun registrarLavadoManos(
        token: String,
        empleadoId: Int,
        area: String,
        turno: String?,
        firma: String?,
        procedimientoCorrecto: String,
        accionCorrectiva: String?,
        supervisorId: Int?
    ): Result<HaccpResponse> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val request = LavadoManosRequest(
                empleadoId = empleadoId,
                areaEstacion = area,
                turno = turno,
                firma = firma,
                procedimientoCorrecto = procedimientoCorrecto,
                accionCorrectiva = accionCorrectiva,
                supervisorId = supervisorId
            )
            
            Log.d(TAG, "Registrando lavado de manos: empleado=$empleadoId, area=$area, turno=$turno, supervisor=$supervisorId")
            val response = apiService.registrarLavadoManos(bearerToken, request)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success) {
                    Log.d(TAG, "✅ Lavado de manos registrado exitosamente")
                    Result.success(body)
                } else {
                    Log.e(TAG, "❌ Error en lavado de manos: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                // Manejo específico para diferentes códigos de error HTTP
                when (response.code()) {
                    409 -> {
                        // Registro duplicado - parsear el mensaje específico del backend
                        try {
                            val errorBody = response.errorBody()?.string()
                            if (errorBody != null) {
                                val gson = com.google.gson.Gson()
                                val errorResponse = gson.fromJson(errorBody, HaccpResponse::class.java)
                                val mensaje = errorResponse.message ?: errorResponse.error ?: "Ya existe un registro para esta cámara hoy"
                                Log.w(TAG, "⚠️ Registro duplicado temperatura cámara: $mensaje")
                                Result.failure(RegistroDuplicadoException(mensaje))
                            } else {
                                Log.w(TAG, "⚠️ Registro duplicado temperatura cámara sin detalles")
                                Result.failure(RegistroDuplicadoException("Ya existe un registro de temperatura para esta cámara en el día de hoy"))
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "⚠️ Error parseando respuesta de registro duplicado temperatura cámara")
                            Result.failure(RegistroDuplicadoException("Ya existe un registro de temperatura para esta cámara en el día de hoy"))
                        }
                    }
                    else -> {
                        val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                        Log.e(TAG, errorMsg)
                        Result.failure(Exception(errorMsg))
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción en lavado de manos", e)
            Result.failure(e)
        }
    }
    
    /**
     * Registrar control de cocción
     */
    suspend fun registrarControlCoccion(
        token: String,
        productoCocinar: String,
        procesoCoccion: String,
        temperatura: Double,
        tiempoCoccion: Int,
        accionCorrectiva: String?
    ): Result<HaccpResponse> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val request = ControlCoccionRequest(
                producto_cocinar = productoCocinar,
                proceso_coccion = procesoCoccion,
                temperatura_coccion = temperatura,
                tiempo_coccion_minutos = tiempoCoccion,
                accion_correctiva = accionCorrectiva
            )
            
            Log.d(TAG, "Registrando control de cocción: producto=$productoCocinar, temp=$temperatura")
            val response = apiService.registrarControlCoccion(bearerToken, request)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success) {
                    Log.d(TAG, "✅ Control de cocción registrado exitosamente")
                    Result.success(body)
                } else {
                    Log.e(TAG, "❌ Error en control de cocción: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción en control de cocción", e)
            Result.failure(e)
        }
    }
    
    /**
     * Obtener supervisores disponibles
     */
    suspend fun obtenerSupervisores(
        token: String,
        area: String? = null,
        turno: String? = null
    ): Result<List<Empleado>> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            
            Log.d(TAG, "Obteniendo supervisores - Área: $area, Turno: $turno")
            val response = apiService.obtenerSupervisores(bearerToken, area, turno)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success && body.data != null) {
                    Log.d(TAG, "✅ ${body.data.size} supervisores obtenidos")
                    Result.success(body.data)
                } else {
                    Log.e(TAG, "❌ Error del servidor")
                    Result.failure(Exception("Error al obtener supervisores"))
                }
            } else {
                val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción obteniendo supervisores", e)
            Result.failure(e)
        }
    }

    /**
     * Registrar control de temperatura de cámaras
     */
    suspend fun registrarTemperaturaCamaras(
        token: String,
        camaraId: Int,
        fecha: String,
        turno: String, // "manana" o "tarde"
        temperatura: Double,
        accionesCorrectivas: String?
    ): Result<HaccpResponse> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            // Construir payload por turno: el backend espera temperatura_manana o temperatura_tarde
            val request = TemperaturaCamarasRequest(
                camaraId = camaraId,
                fecha = fecha,
                turno = turno,
                temperaturaManana = if (turno == "manana") temperatura else null,
                temperaturaTarde = if (turno == "tarde") temperatura else null,
                accionesCorrectivas = accionesCorrectivas
            )
            
            Log.d(TAG, "Registrando temperatura cámara: camara=$camaraId, fecha=$fecha, turno=$turno, temp=$temperatura")
            val response = apiService.registrarTemperaturaCamaras(bearerToken, request)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success) {
                    Log.d(TAG, "✅ Temperatura cámara registrada exitosamente para turno $turno")
                    Result.success(body)
                } else {
                    Log.e(TAG, "❌ Error en temperatura cámara: ${body.error}")
                    // Manejar errores específicos de turnos duplicados
                    when {
                        body.error?.contains("TURNO_MANANA_DUPLICADO") == true -> {
                            Result.failure(RegistroDuplicadoException("Ya existe un registro para el turno de mañana"))
                        }
                        body.error?.contains("TURNO_TARDE_DUPLICADO") == true -> {
                            Result.failure(RegistroDuplicadoException("Ya existe un registro para el turno de tarde"))
                        }
                        else -> {
                            Result.failure(Exception(body.error ?: "Error desconocido"))
                        }
                    }
                }
            } else {
                when (response.code()) {
                    409 -> {
                        // Conflicto - registro duplicado
                        Log.w(TAG, "⚠️ Registro duplicado de temperatura para turno $turno")
                        Result.failure(RegistroDuplicadoException("Ya existe un registro de temperatura para este turno"))
                    }
                    else -> {
                        val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                        Log.e(TAG, errorMsg)
                        Result.failure(Exception(errorMsg))
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción en temperatura cámara", e)
            Result.failure(e)
        }
    }

    /**
     * Verificar si ya existe un registro de temperatura para una cámara en el día actual
     */
    suspend fun verificarRegistroTemperaturaCamara(
        token: String,
        camaraId: Int,
        turno: String? = null
    ): Result<VerificacionTemperaturaResponse> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"

            Log.d(TAG, "Verificando registro de temperatura para cámara: $camaraId, turno: $turno")
            val response = apiService.verificarRegistroTemperaturaCamara(bearerToken, camaraId, turno)

            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success) {
                    Log.d(TAG, "✅ Verificación completada: existe_registro=${body.existeRegistro}, puede_registrar=${body.puedeRegistrar}")
                    Result.success(body)
                } else {
                    Log.e(TAG, "❌ Error en verificación: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción en verificación de temperatura", e)
            Result.failure(e)
        }
    }

    /**
     * Obtener lista de cámaras frigoríficas
     */
    suspend fun obtenerCamaras(token: String): Result<List<Camara>> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            
            Log.d(TAG, "Obteniendo lista de cámaras")
            val response = apiService.obtenerCamaras(bearerToken)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success && body.data != null) {
                    Log.d(TAG, "✅ ${body.data.size} cámaras obtenidas")
                    Result.success(body.data)
                } else {
                    Log.e(TAG, "❌ Error obteniendo cámaras: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción obteniendo cámaras", e)
            Result.failure(e)
        }
    }

    /**
     * Registrar recepción de abarrotes
     */
    suspend fun registrarRecepcionAbarrotes(
        token: String,
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
    ): Result<HaccpResponse> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            val request = RecepcionAbarrotesRequest(
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
            
            Log.d(TAG, "Registrando recepción de abarrotes: proveedor=$nombreProveedor, producto=$nombreProducto, supervisor=$supervisorId")
            val response = apiService.registrarRecepcionAbarrotes(bearerToken, request)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success) {
                    Log.d(TAG, "✅ Recepción de abarrotes registrada exitosamente")
                    Result.success(body)
                } else {
                    Log.e(TAG, "❌ Error en recepción de abarrotes: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción en recepción de abarrotes", e)
            Result.failure(e)
        }
    }
    
    /**
     * Registrar recepción de frutas y verduras
     */
    suspend fun registrarRecepcionFrutasVerduras(
        token: String,
        mes: Int,
        anio: Int,
        fecha: String,
        hora: String,
        tipoControl: String,
        nombreProveedor: String,
        nombreProducto: String,
        cantidadSolicitada: String,
        pesoUnidadRecibido: String,
        unidadMedida: String,
        cNc: String, // Campo de conformidad general
        estadoProducto: String,
        conformidadIntegridad: String,
        uniformeCompleto: String,
        transporteAdecuado: String,
        puntualidad: String,
        observaciones: String?,
        accionCorrectiva: String?,
        productoRechazado: Boolean,
        supervisorId: Int?
    ): Result<HaccpResponse> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            
            // Obtener el proveedor_id basado en el nombre del proveedor
            var proveedorId: Int? = null
            val proveedoresResult = obtenerProveedores(token)
            if (proveedoresResult.isSuccess) {
                val proveedores = proveedoresResult.getOrNull()
                proveedorId = proveedores?.find { it.nombreCompleto == nombreProveedor }?.id
                Log.d(TAG, "Proveedor encontrado: $nombreProveedor -> ID: $proveedorId")
            } else {
                Log.w(TAG, "No se pudieron obtener proveedores, continuando sin proveedor_id")
            }
            
            val request = RecepcionFrutasVerdurasRequest(
                mes = mes,
                anio = anio,
                fecha = fecha,
                hora = hora,
                tipoControl = tipoControl,
                proveedorId = proveedorId,
                nombreProveedor = nombreProveedor,
                nombreProducto = nombreProducto,
                cantidadSolicitada = cantidadSolicitada,
                pesoUnidadRecibido = pesoUnidadRecibido,
                unidadMedida = unidadMedida,
                cNc = cNc,
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
            
            Log.d(TAG, "Registrando recepción de frutas y verduras: tipo=$tipoControl, proveedor=$nombreProveedor, producto=$nombreProducto")
            val response = apiService.registrarRecepcionMercaderia(bearerToken, request)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success) {
                    Log.d(TAG, "✅ Recepción de frutas y verduras registrada exitosamente")
                    Result.success(body)
                } else {
                    Log.e(TAG, "❌ Error en recepción de frutas y verduras: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción en recepción de frutas y verduras", e)
            Result.failure(e)
        }
    }
    
    /**
     * Obtener lista de empleados
     */
    suspend fun obtenerEmpleados(token: String, area: String? = null): Result<List<Empleado>> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            
            val areaLog = if (area != null) " del área $area" else ""
            Log.d(TAG, "Obteniendo lista de empleados$areaLog")
            val response = apiService.obtenerEmpleados(bearerToken, area)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success && body.data != null) {
                    Log.d(TAG, "✅ ${body.data.size} empleados obtenidos")
                    Result.success(body.data)
                } else {
                    Log.e(TAG, "❌ Error obteniendo empleados: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción obteniendo empleados", e)
            Result.failure(e)
        }
    }
    
    /**
     * Obtener lista de proveedores
     */
    suspend fun obtenerProveedores(token: String): Result<List<Proveedor>> = withContext(Dispatchers.IO) {
        try {
            val bearerToken = if (token.startsWith("Bearer ")) token else "Bearer $token"
            
            Log.d(TAG, "Obteniendo lista de proveedores")
            val response = apiService.obtenerProveedores(bearerToken)
            
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success && body.data != null) {
                    Log.d(TAG, "✅ ${body.data.size} proveedores obtenidos")
                    Result.success(body.data)
                } else {
                    Log.e(TAG, "❌ Error obteniendo proveedores: ${body.error}")
                    Result.failure(Exception(body.error ?: "Error desconocido"))
                }
            } else {
                val errorMsg = "Error HTTP ${response.code()}: ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Excepción obteniendo proveedores", e)
            Result.failure(e)
        }
    }
}
