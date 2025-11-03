package com.example.sistemadecalidad.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.sistemadecalidad.data.local.NotificationSettings
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.utils.NotificationHelper
import com.google.gson.Gson
import kotlinx.coroutines.launch

/**
 * Pantalla de configuración de notificaciones
 * Permite al usuario personalizar qué notificaciones recibir
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationSettingsScreen(
    onNavigateBack: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val preferencesManager = remember { PreferencesManager(context, Gson()) }
    val scope = rememberCoroutineScope()

    // Cargar configuración actual
    val notificationSettings by preferencesManager.getNotificationSettings()
        .collectAsStateWithLifecycle(initialValue = NotificationSettings())

    // Estados locales
    var showSaveConfirmation by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Configuración de Notificaciones") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Descripción
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSecondaryContainer,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "Personaliza las notificaciones que deseas recibir para mejorar tu experiencia en la app.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
            }

            // Switch principal
            NotificationSwitchCard(
                title = "Todas las Notificaciones",
                description = "Activar o desactivar todas las notificaciones de la aplicación",
                icon = Icons.Default.Notifications,
                checked = notificationSettings.enabled,
                onCheckedChange = { enabled ->
                    scope.launch {
                        preferencesManager.setNotificationsEnabled(enabled)
                        if (enabled) {
                            NotificationHelper.initializeNotifications(context)
                        } else {
                            NotificationHelper.cancelAllNotifications(context)
                        }
                        showSaveConfirmation = true
                    }
                }
            )

            if (notificationSettings.enabled) {
                // Divider
                HorizontalDivider()

                // Sección de tipos de notificaciones
                Text(
                    text = "Tipos de Notificaciones",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                // Notificaciones de tiempo de trabajo
                NotificationSwitchCard(
                    title = "Recordatorio de Salida",
                    description = "Notificación después de 8 horas de trabajo para recordar marcar la salida",
                    icon = Icons.Default.AccessTime,
                    checked = notificationSettings.workTimeEnabled,
                    onCheckedChange = { enabled ->
                        scope.launch {
                            preferencesManager.setWorkTimeNotificationsEnabled(enabled)
                            if (enabled) {
                                NotificationHelper.scheduleWorkTimeCheck(context)
                            } else {
                                // Cancelar solo notificaciones de tiempo de trabajo
                                NotificationHelper.cancelAllNotifications(context)
                                NotificationHelper.scheduleHaccpReminders(context)
                            }
                            showSaveConfirmation = true
                        }
                    }
                )

                // Notificaciones HACCP
                NotificationSwitchCard(
                    title = "Recordatorios HACCP",
                    description = "Notificaciones diarias para recordar completar formularios de calidad",
                    icon = Icons.AutoMirrored.Filled.Assignment,
                    checked = notificationSettings.haccpEnabled,
                    onCheckedChange = { enabled ->
                        scope.launch {
                            preferencesManager.setHaccpNotificationsEnabled(enabled)
                            if (enabled) {
                                NotificationHelper.scheduleHaccpReminders(context)
                            } else {
                                // Cancelar solo notificaciones HACCP
                                NotificationHelper.cancelAllNotifications(context)
                                NotificationHelper.scheduleWorkTimeCheck(context)
                            }
                            showSaveConfirmation = true
                        }
                    }
                )

                // Divider
                HorizontalDivider()

                // Sección de preferencias adicionales
                Text(
                    text = "Preferencias Adicionales",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                // Sonido
                NotificationSwitchCard(
                    title = "Sonido",
                    description = "Reproducir sonido al recibir notificaciones",
                    icon = Icons.AutoMirrored.Filled.VolumeUp,
                    checked = notificationSettings.soundEnabled,
                    onCheckedChange = { enabled ->
                        scope.launch {
                            preferencesManager.saveNotificationSettings(
                                enabled = notificationSettings.enabled,
                                workTimeEnabled = notificationSettings.workTimeEnabled,
                                haccpEnabled = notificationSettings.haccpEnabled,
                                soundEnabled = enabled,
                                vibrationEnabled = notificationSettings.vibrationEnabled
                            )
                            showSaveConfirmation = true
                        }
                    }
                )

                // Vibración
                NotificationSwitchCard(
                    title = "Vibración",
                    description = "Vibrar el dispositivo al recibir notificaciones",
                    icon = Icons.Default.Vibration,
                    checked = notificationSettings.vibrationEnabled,
                    onCheckedChange = { enabled ->
                        scope.launch {
                            preferencesManager.saveNotificationSettings(
                                enabled = notificationSettings.enabled,
                                workTimeEnabled = notificationSettings.workTimeEnabled,
                                haccpEnabled = notificationSettings.haccpEnabled,
                                soundEnabled = notificationSettings.soundEnabled,
                                vibrationEnabled = enabled
                            )
                            showSaveConfirmation = true
                        }
                    }
                )
            }

            // Información adicional
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.tertiaryContainer
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onTertiaryContainer,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Información",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "• Las notificaciones de tiempo de trabajo se verifican cada 30 minutos\n" +
                                "• Los recordatorios HACCP se envían a las 9:00 AM, 1:00 PM y 5:00 PM\n" +
                                "• Los cambios se aplican inmediatamente",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onTertiaryContainer
                    )
                }
            }
        }
    }

    // Snackbar de confirmación
    if (showSaveConfirmation) {
        LaunchedEffect(Unit) {
            kotlinx.coroutines.delay(2000)
            showSaveConfirmation = false
        }

        Snackbar(
            modifier = Modifier.padding(16.dp)
        ) {
            Text("✅ Configuración guardada correctamente")
        }
    }
}

@Composable
private fun NotificationSwitchCard(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(32.dp)
            )

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange
            )
        }
    }
}
