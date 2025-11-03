package com.example.sistemadecalidad.utils

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.*
import com.example.sistemadecalidad.MainActivity
import com.example.sistemadecalidad.R
import java.util.concurrent.TimeUnit

/**
 * Helper simplificado para notificaciones sin dependencias de Hilt
 */
object NotificationHelper {
    
    private const val CHANNEL_ID_WORK_TIME = "work_time_notifications"
    private const val CHANNEL_ID_HACCP_FORMS = "haccp_form_notifications"
    
    private const val NOTIFICATION_ID_WORK_TIME = 1001
    private const val NOTIFICATION_ID_HACCP_FORMS = 1002
    
    private const val CHANNEL_NAME_WORK_TIME = "Recordatorios de Salida"
    private const val CHANNEL_NAME_HACCP_FORMS = "Formularios HACCP"
    
    private const val CHANNEL_DESC_WORK_TIME = "Notificaciones para recordar marcar la salida"
    private const val CHANNEL_DESC_HACCP_FORMS = "Recordatorios diarios de formularios HACCP"
    
    /**
     * Inicializar canales de notificación
     */
    fun initializeNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // Canal para recordatorios de tiempo de trabajo
            val workTimeChannel = NotificationChannel(
                CHANNEL_ID_WORK_TIME,
                CHANNEL_NAME_WORK_TIME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESC_WORK_TIME
                enableVibration(true)
                setShowBadge(true)
            }
            
            // Canal para formularios HACCP
            val haccpFormsChannel = NotificationChannel(
                CHANNEL_ID_HACCP_FORMS,
                CHANNEL_NAME_HACCP_FORMS,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = CHANNEL_DESC_HACCP_FORMS
                enableVibration(true)
                setShowBadge(true)
            }
            
            notificationManager.createNotificationChannel(workTimeChannel)
            notificationManager.createNotificationChannel(haccpFormsChannel)
        }
    }
    
    /**
     * Mostrar notificación de recordatorio de salida
     */
    fun showWorkTimeReminder(context: Context, horasTrabajadas: Double) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "marcaciones")
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_ID_WORK_TIME)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Recordatorio de Salida")
            .setContentText("Has trabajado ${String.format("%.1f", horasTrabajadas)} horas. ¿Ya marcaste tu salida?")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Has trabajado ${String.format("%.1f", horasTrabajadas)} horas. No olvides marcar tu salida para registrar correctamente tu jornada laboral.")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()
        
        try {
            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.notify(NOTIFICATION_ID_WORK_TIME, notification)
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }
    
    /**
     * Mostrar notificación de formularios HACCP
     */
    fun showHaccpFormReminder(context: Context, formulariosPendientes: List<String>) {
        if (formulariosPendientes.isEmpty()) return
        
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "calidad")
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            1,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val title = if (formulariosPendientes.size == 1) {
            "Formulario HACCP Pendiente"
        } else {
            "Formularios HACCP Pendientes (${formulariosPendientes.size})"
        }
        
        val content = if (formulariosPendientes.size == 1) {
            "Recuerda completar: ${formulariosPendientes.first()}"
        } else {
            "Tienes ${formulariosPendientes.size} formularios por completar hoy"
        }
        
        val notification = NotificationCompat.Builder(context, CHANNEL_ID_HACCP_FORMS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()
        
        try {
            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.notify(NOTIFICATION_ID_HACCP_FORMS, notification)
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }
    
    /**
     * Programar verificación periódica de tiempo de trabajo
     */
    fun scheduleWorkTimeCheck(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val workRequest = PeriodicWorkRequestBuilder<SimpleNotificationWorker>(
            30, TimeUnit.MINUTES,
            15, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .setInputData(workDataOf("work_type" to "check_work_time"))
            .addTag("work_time_check")
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "work_time_check",
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }
    
    /**
     * Programar recordatorios de formularios HACCP
     */
    fun scheduleHaccpReminders(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        // Recordatorio diario a las 9:00 AM
        val dailyReminderRequest = PeriodicWorkRequestBuilder<SimpleNotificationWorker>(
            1, TimeUnit.DAYS
        )
            .setConstraints(constraints)
            .setInputData(workDataOf("work_type" to "haccp_reminder"))
            .setInitialDelay(calculateDelayToNextHour(9), TimeUnit.MILLISECONDS)
            .addTag("haccp_reminder")
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            "haccp_daily_reminder",
            ExistingPeriodicWorkPolicy.KEEP,
            dailyReminderRequest
        )
    }
    
    /**
     * Cancelar todas las notificaciones programadas y activas
     */
    fun cancelAllNotifications(context: Context) {
        try {
            // Cancelar notificaciones activas
            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.cancel(NOTIFICATION_ID_WORK_TIME)
            notificationManager.cancel(NOTIFICATION_ID_HACCP_FORMS)
            
            // Cancelar trabajos programados
            val workManager = WorkManager.getInstance(context)
            workManager.cancelUniqueWork("work_time_check")
            workManager.cancelUniqueWork("haccp_daily_reminder")
            workManager.cancelAllWorkByTag("work_time_check")
            workManager.cancelAllWorkByTag("haccp_reminder")
            
        } catch (e: Exception) {
            android.util.Log.e("NotificationHelper", "Error cancelando notificaciones: ${e.message}")
        }
    }
    
    /**
     * Mostrar notificación de tiempo de trabajo
     */
    fun showWorkTimeNotification(context: Context, horasTrabajadas: Double) {
        showWorkTimeReminder(context, horasTrabajadas)
    }
    
    /**
     * Mostrar notificación de recordatorio HACCP
     */
    fun showHaccpReminderNotification(context: Context, title: String, message: String) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "calidad")
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            1,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, CHANNEL_ID_HACCP_FORMS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()
        
        try {
            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.notify(NOTIFICATION_ID_HACCP_FORMS, notification)
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }
    
    /**
     * Inicializar todas las notificaciones
     */
    fun initializeNotifications(context: Context) {
        initializeNotificationChannels(context)
        scheduleWorkTimeCheck(context)
        scheduleHaccpReminders(context)
    }
    
    /**
     * Calcular delay hasta la próxima hora específica
     */
    private fun calculateDelayToNextHour(targetHour: Int): Long {
        val now = System.currentTimeMillis()
        val calendar = java.util.Calendar.getInstance()
        
        calendar.set(java.util.Calendar.HOUR_OF_DAY, targetHour)
        calendar.set(java.util.Calendar.MINUTE, 0)
        calendar.set(java.util.Calendar.SECOND, 0)
        calendar.set(java.util.Calendar.MILLISECOND, 0)
        
        var targetTime = calendar.timeInMillis
        
        if (targetTime <= now) {
            calendar.add(java.util.Calendar.DAY_OF_MONTH, 1)
            targetTime = calendar.timeInMillis
        }
        
        return targetTime - now
    }
}