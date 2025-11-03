package com.example.sistemadecalidad.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.utils.NotificationHelper
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * BroadcastReceiver que se ejecuta cuando el dispositivo se reinicia
 * Reprograma las notificaciones si el usuario está autenticado
 */
class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BootReceiver"
    }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d(TAG, "📱 Dispositivo reiniciado, verificando notificaciones...")

            // Usar pendingResult para operaciones asíncronas
            val pendingResult = goAsync()

            scope.launch {
                try {
                    // Verificar si el usuario está autenticado
                    val preferencesManager = PreferencesManager(context, Gson())
                    val isLoggedIn = preferencesManager.isLoggedIn().first()

                    if (isLoggedIn) {
                        Log.d(TAG, "✅ Usuario autenticado, reprogramando notificaciones...")

                        // Verificar si las notificaciones están habilitadas
                        val notificationsEnabled = preferencesManager.areNotificationsEnabled().first()

                        if (notificationsEnabled) {
                            // Inicializar canales de notificación
                            NotificationHelper.initializeNotificationChannels(context)

                            // Reprogramar notificaciones
                            NotificationHelper.scheduleWorkTimeCheck(context)
                            NotificationHelper.scheduleHaccpReminders(context)

                            Log.d(TAG, "✅ Notificaciones reprogramadas correctamente después del reinicio")
                        } else {
                            Log.d(TAG, "⚠️ Notificaciones deshabilitadas por el usuario")
                        }
                    } else {
                        Log.d(TAG, "ℹ️ Usuario no autenticado, no se programan notificaciones")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Error reprogramando notificaciones: ${e.message}", e)
                } finally {
                    // Completar el pendingResult
                    pendingResult.finish()
                }
            }
        }
    }
}
