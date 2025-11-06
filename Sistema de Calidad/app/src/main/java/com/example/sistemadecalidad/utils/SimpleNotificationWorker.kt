package com.example.sistemadecalidad.utils

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.sistemadecalidad.data.api.ApiService
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.repository.FichadoRepository
import com.google.gson.Gson
import kotlinx.coroutines.flow.first
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.Calendar

/**
 * Worker simplificado para notificaciones sin Hilt
 * Obtiene token real desde PreferencesManager y usa NetworkConfig para URLs
 */
class SimpleNotificationWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        private const val TAG = "NotificationWorker"
        private val FORMULARIOS_HACCP_DIARIOS = listOf(
            "Recepción de Mercadería",
            "Control de Cocción",
            "Lavado de Frutas y Verduras",
            "Lavado de Manos",
            "Control de Temperatura"
        )
    }

    override suspend fun doWork(): Result {
        return try {
            val workType = inputData.getString("work_type") ?: "work_time_check"

            android.util.Log.d(TAG, "🔔 Ejecutando worker tipo: $workType")

            when (workType) {
                "work_time_check" -> {
                    checkWorkTime()
                }
                "haccp_reminder" -> {
                    sendHaccpReminder()
                }
                else -> {
                    android.util.Log.w(TAG, "⚠️ Tipo de trabajo desconocido: $workType")
                }
            }

            Result.success()
        } catch (e: Exception) {
            android.util.Log.e(TAG, "❌ Error en worker: ${e.message}", e)
            Result.failure()
        }
    }

    /**
     * Verifica el tiempo de trabajo y envía notificación si es necesario
     */
    private suspend fun checkWorkTime() {
        try {
            // Obtener token real desde PreferencesManager
            val preferencesManager = PreferencesManager(applicationContext, Gson())
            val token = preferencesManager.getToken().first()

            if (token.isNullOrEmpty()) {
                android.util.Log.w(TAG, "⚠️ No hay token disponible, saltando verificación de tiempo de trabajo")
                return
            }

            android.util.Log.d(TAG, "🔑 Token obtenido correctamente")

            val fichadoRepository = createFichadoRepository()
            val tokenWithBearer = if (token.startsWith("Bearer ")) token else "Bearer $token"

            // Obtener dashboard del día actual que contiene el estado de fichado
            fichadoRepository.obtenerDashboardHoy(tokenWithBearer).collect { result ->
                result.onSuccess { dashboardResponse ->
                    val estadoFichado = dashboardResponse.data?.estadoFichado

                    android.util.Log.d(TAG, "📊 Estado fichado: entrada=${estadoFichado?.tieneEntrada}, salida=${estadoFichado?.tieneSalida}, horas=${estadoFichado?.horasTrabajadas}")

                    if (estadoFichado != null &&
                        estadoFichado.tieneEntrada &&
                        !estadoFichado.tieneSalida &&
                        estadoFichado.horasTrabajadas != null &&
                        estadoFichado.horasTrabajadas >= 8.0) {

                        android.util.Log.d(TAG, "⏰ Usuario ha trabajado ${estadoFichado.horasTrabajadas} horas, enviando notificación")

                        // Enviar notificación de 8 horas trabajadas
                        NotificationHelper.showWorkTimeNotification(
                            applicationContext,
                            estadoFichado.horasTrabajadas
                        )
                    } else {
                        android.util.Log.d(TAG, "✅ No es necesario enviar notificación de tiempo de trabajo")
                    }
                }.onFailure { error ->
                    android.util.Log.e(TAG, "❌ Error obteniendo dashboard: ${error.message}", error)
                }
            }
        } catch (e: Exception) {
            android.util.Log.e(TAG, "❌ Error verificando tiempo de trabajo: ${e.message}", e)
        }
    }

    /**
     * Envía recordatorio de formularios HACCP
     */
    private suspend fun sendHaccpReminder() {
        try {
            // Verificar que haya usuario autenticado
            val preferencesManager = PreferencesManager(applicationContext, Gson())
            val isLoggedIn = preferencesManager.isLoggedIn().first()

            if (!isLoggedIn) {
                android.util.Log.w(TAG, "⚠️ Usuario no autenticado, saltando recordatorio HACCP")
                return
            }

            val currentHour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
            val dayOfWeek = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)

            // No enviar notificaciones en fines de semana
            if (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY) {
                android.util.Log.d(TAG, "📅 Fin de semana, no enviando recordatorio HACCP")
                return
            }

            // Solo enviar en horas laborales (8 AM - 6 PM)
            if (currentHour < 8 || currentHour > 18) {
                android.util.Log.d(TAG, "🕐 Fuera de horario laboral, no enviando recordatorio HACCP")
                return
            }

            val message = when (currentHour) {
                9 -> "Recuerda completar los formularios HACCP de la mañana"
                13 -> "Es hora de completar los formularios HACCP del mediodía"
                17 -> "No olvides completar los formularios HACCP de la tarde"
                else -> "Recuerda completar tus formularios HACCP pendientes"
            }

            android.util.Log.d(TAG, "📝 Enviando recordatorio HACCP: $message")

            NotificationHelper.showHaccpReminderNotification(
                applicationContext,
                "Recordatorio HACCP",
                message
            )

        } catch (e: Exception) {
            android.util.Log.e(TAG, "❌ Error enviando recordatorio HACCP: ${e.message}", e)
        }
    }

    /**
     * Crea una instancia de FichadoRepository usando NetworkConfig
     */
    private fun createFichadoRepository(): FichadoRepository {
        // Usar la URL de AWS Production
        val baseUrl = NetworkConfig.AWS_PRODUCTION_URL

        android.util.Log.d(TAG, "🌐 Usando URL del servidor: $baseUrl")

        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val apiService = retrofit.create(ApiService::class.java)
        return FichadoRepository(apiService)
    }
}