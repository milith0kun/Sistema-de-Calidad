package com.example.sistemadecalidad.utils

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat

/**
 * Handler para gestionar permisos de notificaciones en Android 13+
 */
object NotificationPermissionHandler {

    /**
     * Verificar si el permiso de notificaciones está concedido
     */
    fun hasNotificationPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            // En versiones anteriores a Android 13, no se requiere permiso runtime
            true
        }
    }

    /**
     * Verificar si se debe mostrar la explicación del permiso
     */
    fun shouldShowRequestPermissionRationale(activity: Activity): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            activity.shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            false
        }
    }
}

/**
 * Composable para solicitar permiso de notificaciones
 * Se puede usar en cualquier pantalla que necesite solicitar permisos de notificaciones
 */
@Composable
fun RequestNotificationPermission(
    onPermissionGranted: () -> Unit = {},
    onPermissionDenied: () -> Unit = {}
) {
    val context = LocalContext.current
    var hasPermission by remember {
        mutableStateOf(NotificationPermissionHandler.hasNotificationPermission(context))
    }

    // Launcher para solicitar permiso
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasPermission = isGranted
        if (isGranted) {
            android.util.Log.d("NotificationPermission", "✅ Permiso de notificaciones concedido")
            onPermissionGranted()
        } else {
            android.util.Log.w("NotificationPermission", "❌ Permiso de notificaciones denegado")
            onPermissionDenied()
        }
    }

    // Solicitar permiso automáticamente si no lo tiene (solo Android 13+)
    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasPermission) {
            android.util.Log.d("NotificationPermission", "🔔 Solicitando permiso de notificaciones...")
            permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
}

/**
 * Composable para verificar y manejar permisos de notificaciones con UI personalizada
 */
@Composable
fun NotificationPermissionEffect(
    requestOnLaunch: Boolean = true,
    onPermissionResult: (Boolean) -> Unit = {}
) {
    val context = LocalContext.current
    var hasAskedForPermission by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        android.util.Log.d("NotificationPermission", "Resultado del permiso: $isGranted")
        onPermissionResult(isGranted)
    }

    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && requestOnLaunch && !hasAskedForPermission) {
            val hasPermission = NotificationPermissionHandler.hasNotificationPermission(context)

            if (!hasPermission) {
                android.util.Log.d("NotificationPermission", "🔔 Solicitando permiso de notificaciones...")
                hasAskedForPermission = true
                permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else {
                android.util.Log.d("NotificationPermission", "✅ Permiso de notificaciones ya concedido")
                onPermissionResult(true)
            }
        } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            // En Android < 13, siempre tenemos permiso
            onPermissionResult(true)
        }
    }
}
