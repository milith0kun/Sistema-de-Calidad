package com.example.sistemadecalidad.data.model

import com.google.gson.annotations.SerializedName

/**
 * Modelo de datos para el fichado/asistencia
 * Basado en la estructura de la tabla asistencia del backend
 */
data class Fichado(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("usuario_id")
    val usuarioId: Int,
    
    @SerializedName("fecha")
    val fecha: String,
    
    @SerializedName("hora_entrada")
    val horaEntrada: String?,
    
    @SerializedName("hora_salida")
    val horaSalida: String?,
    
    @SerializedName("latitud")
    val latitud: Double?,
    
    @SerializedName("longitud")
    val longitud: Double?,
    
    @SerializedName("ubicacion_valida")
    val ubicacionValida: Boolean?,
    
    @SerializedName("codigo_qr")
    val codigoQr: String?,
    
    @SerializedName("metodo_fichado")
    val metodoFichado: String, // "MANUAL", "GPS", "QR"
    
    @SerializedName("observaciones")
    val observaciones: String?,
    
    @SerializedName("timestamp_creacion")
    val timestampCreacion: String?
)

/**
 * Modelo para la petición de fichado de entrada
 */
data class FichadoEntradaRequest(
    @SerializedName("metodo")
    val metodo: String = "MANUAL",
    
    @SerializedName("latitud")
    val latitud: Double? = null,
    
    @SerializedName("longitud")
    val longitud: Double? = null,
    
    @SerializedName("codigo_qr")
    val codigoQr: String? = null,
    
    @SerializedName("fecha")
    val fecha: String? = null,
    
    @SerializedName("hora")
    val hora: String? = null,
    
    @SerializedName("timestamp")
    val timestamp: String? = null
)

/**
 * Modelo para la petición de fichado de salida
 */
data class FichadoSalidaRequest(
    @SerializedName("metodo")
    val metodo: String = "MANUAL",
    
    @SerializedName("latitud")
    val latitud: Double? = null,
    
    @SerializedName("longitud")
    val longitud: Double? = null,
    
    @SerializedName("fecha")
    val fecha: String? = null,
    
    @SerializedName("hora")
    val hora: String? = null,
    
    @SerializedName("timestamp")
    val timestamp: String? = null
)

/**
 * Modelo para la respuesta de fichado
 */
data class FichadoResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("message")
    val message: String?,
    
    @SerializedName("hora")
    val hora: String?,
    
    @SerializedName("qr_valido")
    val qrValido: Boolean?,
    
    @SerializedName("ubicacion_valida")
    val ubicacionValida: Boolean?,
    
    @SerializedName("distancia_metros")
    val distanciaMetros: Double?,
    
    @SerializedName("horas_trabajadas")
    val horasTrabajadas: String?,
    
    @SerializedName("error")
    val error: String?
)

/**
 * Modelo para el historial de fichados
 */
data class HistorialResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("data")
    val data: List<FichadoHistorial>?,
    
    @SerializedName("error")
    val error: String?
)

/**
 * Modelo de fichado para el historial (estructura del backend)
 */
data class FichadoHistorial(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("fecha")
    val fecha: String,
    
    @SerializedName("hora_entrada")
    val horaEntrada: String?,
    
    @SerializedName("hora_salida")
    val horaSalida: String?,
    
    @SerializedName("horas_trabajadas")
    val horasTrabajadas: Double?,
    
    @SerializedName("latitud")
    val latitud: Double?,
    
    @SerializedName("longitud")
    val longitud: Double?,
    
    @SerializedName("latitud_salida")
    val latitudSalida: Double?,
    
    @SerializedName("longitud_salida")
    val longitudSalida: Double?,
    
    @SerializedName("metodo_fichado")
    val metodoFichado: String,
    
    @SerializedName("observaciones")
    val observaciones: String?,
    
    @SerializedName("timestamp_creacion")
    val timestampCreacion: String?,
    
    @SerializedName("estado_gps")
    val estadoGps: String?
)

/**
 * Modelo para el dashboard del día actual
 */
data class DashboardHoyResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("data")
    val data: DashboardData?,
    
    @SerializedName("error")
    val error: String?
)

/**
 * Modelo de datos del dashboard
 */
data class DashboardData(
    @SerializedName("timestamp")
    val timestamp: String?,
    
    @SerializedName("fecha_actual")
    val fechaActual: String?,
    
    @SerializedName("hora_actual")
    val horaActual: String?,
    
    @SerializedName("fecha_completa")
    val fechaCompleta: String?,
    
    @SerializedName("dia_semana")
    val diaSemana: String?,
    
    @SerializedName("usuario")
    val usuario: UsuarioDashboard?,
    
    @SerializedName("estado_fichado")
    val estadoFichado: EstadoFichado?,
    
    @SerializedName("server_time")
    val serverTime: String?
)

/**
 * Usuario en dashboard
 */
data class UsuarioDashboard(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("nombre")
    val nombre: String,
    
    @SerializedName("email")
    val email: String,
    
    @SerializedName("rol")
    val rol: String
)

/**
 * Estado del fichado actual
 */
data class EstadoFichado(
    @SerializedName("tiene_entrada")
    val tieneEntrada: Boolean,
    
    @SerializedName("tiene_salida")
    val tieneSalida: Boolean,
    
    @SerializedName("puede_marcar_entrada")
    val puedemarcarEntrada: Boolean,
    
    @SerializedName("puede_marcar_salida")
    val puedeMarcarSalida: Boolean,
    
    @SerializedName("hora_entrada")
    val horaEntrada: String?,
    
    @SerializedName("hora_salida")
    val horaSalida: String?,
    
    @SerializedName("horas_trabajadas")
    val horasTrabajadas: Double?,
    
    @SerializedName("tiempo_transcurrido")
    val tiempoTranscurrido: Double?,
    
    @SerializedName("metodo")
    val metodo: String?,
    
    @SerializedName("observaciones")
    val observaciones: String?,
    
    @SerializedName("timestamp_creacion")
    val timestampCreacion: String?,
    
    @SerializedName("gps_info")
    val gpsInfo: GpsInfo?
)

/**
 * Información GPS del fichado
 */
data class GpsInfo(
    @SerializedName("entrada_con_gps")
    val entradaConGps: Boolean,
    
    @SerializedName("salida_con_gps")
    val salidaConGps: Boolean,
    
    @SerializedName("coordenadas_entrada")
    val coordenadasEntrada: Coordenadas?,
    
    @SerializedName("coordenadas_salida")
    val coordenadasSalida: Coordenadas?
)

/**
 * Coordenadas GPS
 */
data class Coordenadas(
    @SerializedName("latitud")
    val latitud: Double,
    
    @SerializedName("longitud")
    val longitud: Double
)

/**
 * Modelo para el resumen de analítica
 */
data class ResumenResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("horas_semana")
    val horasSemana: String?,
    
    @SerializedName("horas_mes")
    val horasMes: String?,
    
    @SerializedName("promedio_entrada")
    val promedioEntrada: String?,
    
    @SerializedName("promedio_salida")
    val promedioSalida: String?,
    
    @SerializedName("dias_trabajados_mes")
    val diasTrabajadosMes: Int?,
    
    @SerializedName("error")
    val error: String?
)