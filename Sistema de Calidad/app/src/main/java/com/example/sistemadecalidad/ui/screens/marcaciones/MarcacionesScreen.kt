package com.example.sistemadecalidad.ui.screens.marcaciones

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.PlayArrow

import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.ui.components.GoogleMapView
import com.example.sistemadecalidad.ui.components.TokenExpiredDialog
import com.example.sistemadecalidad.ui.viewmodel.FichadoViewModel
import com.example.sistemadecalidad.utils.LocationManager
import com.example.sistemadecalidad.utils.TimeUtils
import com.google.gson.Gson
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import java.text.SimpleDateFormat
import java.util.*

/**
 * Pantalla de marcaciones con diseño minimalista según especificaciones del informe
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarcacionesScreen(
    fichadoViewModel: FichadoViewModel, // = hiltViewModel()
    onNavigateToDashboard: () -> Unit = {},
    onNavigateToHistorial: () -> Unit = {},
    onNavigateToHaccp: () -> Unit = {},
    onLogout: () -> Unit = {}
    // onNavigateToLocationSettings eliminado - configuración GPS solo desde WebPanel
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val preferencesManager = remember { PreferencesManager(context, Gson()) }
    val lifecycleOwner = LocalLifecycleOwner.current
    
    // Variable para hora actual en tiempo real
    var currentTime by remember { mutableStateOf(Date()) }
    
    // Observar estados
    val fichadoUiState by fichadoViewModel.uiState.collectAsStateWithLifecycle()
    val dashboardHoy by fichadoViewModel.dashboardHoy.collectAsStateWithLifecycle()
    
    // Actualizar hora cada segundo usando zona horaria de Perú
    LaunchedEffect(Unit) {
        while (true) {
            currentTime = TimeUtils.getCurrentPeruDate()
            delay(1000L)
        }
    }
    
    // Estados para configuración de ubicación
    var targetLatitude by remember { mutableStateOf(-12.046374) }
    var targetLongitude by remember { mutableStateOf(-77.042793) }
    var allowedRadius by remember { mutableIntStateOf(100) }
    
    // LocationManager para GPS
    val locationManager = remember { LocationManager(context) }
    val isLocationValid by locationManager.isLocationValid.collectAsStateWithLifecycle()
    val isGpsEnabled by locationManager.isGpsEnabled.collectAsStateWithLifecycle()
    val hasLocationPermission by locationManager.hasLocationPermission.collectAsStateWithLifecycle()
    val distanceToKitchen by locationManager.distanceToKitchen.collectAsStateWithLifecycle()
    
    // Launcher para solicitar permisos de ubicación
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseLocationGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        
        if (fineLocationGranted || coarseLocationGranted) {
            locationManager.updatePermissions()
        }
    }
    
    // Inicializar datos y ubicación al cargar la pantalla
    LaunchedEffect(Unit) {
        fichadoViewModel.inicializarDatos()
        
        // Sincronizar configuración GPS del backend
        // Esta configuración es establecida por Admin/Supervisor desde el WebPanel
        android.util.Log.d("MarcacionesScreen", "🔄 Iniciando sincronización GPS...")
        fichadoViewModel.sincronizarConfiguracionGPS()
        
        // Esperar más tiempo para asegurar que la sincronización termine
        delay(2000)
        
        // Cargar configuración de ubicación guardada (ahora viene del backend)
        try {
            val savedConfig = preferencesManager.getLocationConfig().first()
            if (savedConfig != null) {
                android.util.Log.i("MarcacionesScreen", "✅ Configuración GPS cargada: lat=${savedConfig.latitude}, lon=${savedConfig.longitude}, radio=${savedConfig.radius}")
                targetLatitude = savedConfig.latitude
                targetLongitude = savedConfig.longitude
                allowedRadius = savedConfig.radius
            } else {
                android.util.Log.w("MarcacionesScreen", "⚠️ No hay configuración GPS guardada, usando valores por defecto")
            }
        } catch (e: Exception) {
            android.util.Log.e("MarcacionesScreen", "❌ Error al cargar configuración GPS: ${e.message}")
            // Usar valores por defecto
        }
        
        // Solicitar permisos si no los tiene
        if (!hasLocationPermission) {
            android.util.Log.i("MarcacionesScreen", "🔑 Solicitando permisos de ubicación")
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
        
        // Iniciar tracking de ubicación independientemente de los permisos
        // Si no hay permisos, LocationManager manejará internamente esta situación
        android.util.Log.i("MarcacionesScreen", "🚀 Iniciando tracking de ubicación desde LaunchedEffect")
        locationManager.startLocationTracking()
    }
    
    // Sincronización periódica y detección de lifecycle
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            // Sincronizar cuando la app vuelve del background
            android.util.Log.d("MarcacionesScreen", "App resumed - Sincronizando configuración GPS")
            fichadoViewModel.sincronizarConfiguracionGPS()
            
            // Esperar a que termine la sincronización y recargar configuración
            delay(2000)
            
            // Recargar configuración después de sincronizar
            try {
                val savedConfig = preferencesManager.getLocationConfig().first()
                if (savedConfig != null) {
                    android.util.Log.i("MarcacionesScreen", "✅ Configuración GPS actualizada: lat=${savedConfig.latitude}, lon=${savedConfig.longitude}, radio=${savedConfig.radius}")
                    targetLatitude = savedConfig.latitude
                    targetLongitude = savedConfig.longitude
                    allowedRadius = savedConfig.radius
                    
                    // Recargar configuración en LocationManager
                    locationManager.reloadLocationConfig()
                }
            } catch (e: Exception) {
                android.util.Log.e("MarcacionesScreen", "❌ Error al recargar configuración GPS: ${e.message}")
            }
            
            // Sincronización periódica cada 5 minutos mientras la app está activa
            while (true) {
                delay(5 * 60 * 1000) // 5 minutos
                android.util.Log.d("MarcacionesScreen", "Sincronización periódica - Actualizando configuración GPS")
                fichadoViewModel.sincronizarConfiguracionGPS()
                
                // Recargar configuración después de cada sincronización periódica
                delay(2000)
                try {
                    val savedConfig = preferencesManager.getLocationConfig().first()
                    if (savedConfig != null) {
                        targetLatitude = savedConfig.latitude
                        targetLongitude = savedConfig.longitude
                        allowedRadius = savedConfig.radius
                        locationManager.reloadLocationConfig()
                    }
                } catch (e: Exception) {
                    android.util.Log.e("MarcacionesScreen", "Error en sincronización periódica: ${e.message}")
                }
            }
        }
    }
    
    // Observar eventos de token expirado
    LaunchedEffect(fichadoViewModel) {
        fichadoViewModel.authStateManager.tokenExpiredEvent.collect { tokenExpiredTime ->
            if (tokenExpiredTime != null) {
                android.util.Log.d("MarcacionesScreen", "Token expirado detectado - Redirigiendo al login")
                onLogout()
            }
        }
    }
    
    // Limpiar recursos al salir
    DisposableEffect(Unit) {
        onDispose {
            locationManager.stopLocationTracking()
        }
    }
    
    // Mostrar mensaje de éxito y actualizar estado
    LaunchedEffect(fichadoUiState.isEntradaExitosa, fichadoUiState.isSalidaExitosa) {
        if (fichadoUiState.isEntradaExitosa || fichadoUiState.isSalidaExitosa) {
            android.util.Log.d("MarcacionesScreen", "Fichado exitoso detectado - Actualizando datos")
            
            // Primer delay para asegurar que el ViewModel haya actualizado
            delay(1500)
            
            // Recargar datos después de una marcación exitosa
            android.util.Log.d("MarcacionesScreen", "Recargando dashboard y historial")
            fichadoViewModel.obtenerDashboardHoy()
            fichadoViewModel.obtenerHistorial()
            
            // Segundo delay antes de limpiar estados
            delay(2000)
            android.util.Log.d("MarcacionesScreen", "Limpiando estados de éxito")
            fichadoViewModel.resetSuccessStates()
        }
    }
    
    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surfaceContainer
            ) {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Inicio") },
                    label = { Text("Inicio") },
                    selected = false,
                    onClick = onNavigateToDashboard
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.AccessTime, contentDescription = "Fichado") },
                    label = { Text("Fichado") },
                    selected = true,
                    onClick = { /* Ya estamos en Fichado */ }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "Historial") },
                    label = { Text("Historial") },
                    selected = false,
                    onClick = onNavigateToHistorial
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.CheckCircle, contentDescription = "Calidad") },
                    label = { Text("Calidad") },
                    selected = false,
                    onClick = onNavigateToHaccp
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
        // Fecha actual
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.DateRange,
                    contentDescription = "Fecha",
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.size(20.dp)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Text(
                    text = TimeUtils.formatDateForDisplay(Date()),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }
        
        // Hora actual en tiempo real
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Hora Actual",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSecondaryContainer
                )
                Text(
                    text = TimeUtils.formatTimeForDisplay(currentTime),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
        
        // Estado de ubicación GPS
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = when {
                    !hasLocationPermission -> MaterialTheme.colorScheme.errorContainer
                    !isGpsEnabled -> MaterialTheme.colorScheme.errorContainer
                    isLocationValid -> Color(0xFF4CAF50).copy(alpha = 0.1f)
                    else -> MaterialTheme.colorScheme.errorContainer
                }
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = when {
                        !hasLocationPermission || !isGpsEnabled -> Icons.Default.Warning
                        isLocationValid -> Icons.Default.LocationOn
                        else -> Icons.Default.Warning
                    },
                    contentDescription = "Estado GPS",
                    tint = when {
                        !hasLocationPermission || !isGpsEnabled -> MaterialTheme.colorScheme.onErrorContainer
                        isLocationValid -> Color(0xFF4CAF50)
                        else -> MaterialTheme.colorScheme.onErrorContainer
                    },
                    modifier = Modifier.size(20.dp)
                )
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = locationManager.getLocationStatusMessage(),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = when {
                            !hasLocationPermission || !isGpsEnabled -> MaterialTheme.colorScheme.onErrorContainer
                            isLocationValid -> Color(0xFF4CAF50)
                            else -> MaterialTheme.colorScheme.onErrorContainer
                        }
                    )
                    
                    distanceToKitchen?.let { distance ->
                        Text(
                            text = "Distancia: ${distance.toInt()}m de la cocina",
                            fontSize = 12.sp,
                            color = when {
                                isLocationValid -> Color(0xFF4CAF50)
                                else -> MaterialTheme.colorScheme.onErrorContainer
                            }.copy(alpha = 0.8f)
                        )
                    }
                }
            }
        }
        

        
        // Mapa visual de ubicación objetivo
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Tu Ubicación Objetivo",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                // Google Maps con ubicación objetivo
                GoogleMapView(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    userLatitude = locationManager.currentLocation.collectAsStateWithLifecycle().value?.latitude,
                    userLongitude = locationManager.currentLocation.collectAsStateWithLifecycle().value?.longitude,
                    targetLatitude = targetLatitude,
                    targetLongitude = targetLongitude,
                    allowedRadius = allowedRadius,
                    isLocationValid = isLocationValid
                )
                
                // Información de ubicación
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White.copy(alpha = 0.9f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "📍 Ubicación Objetivo",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD32F2F)
                        )
                        Text(
                            text = "Lat: %.6f".format(targetLatitude),
                            fontSize = 10.sp,
                            color = Color.Black
                        )
                        Text(
                            text = "Lon: %.6f".format(targetLongitude),
                            fontSize = 10.sp,
                            color = Color.Black
                        )
                        Text(
                            text = "Radio: $allowedRadius m",
                            fontSize = 10.sp,
                            color = Color(0xFF00C853)
                        )
                    }
                }
                
                Text(
                    text = "🔵 = Área Permitida  📍 = Ubicación Objetivo  📱 = Tu Ubicación",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }
        
        // Estado actual
        val estadoFichado = dashboardHoy?.data?.estadoFichado
        val estadoActual = when {
            estadoFichado == null -> {
                android.util.Log.d("MarcacionesScreen", "Estado: SIN_MARCAR (estadoFichado es null)")
                "SIN_MARCAR"
            }
            estadoFichado.tieneSalida -> {
                android.util.Log.d("MarcacionesScreen", "Estado: COMPLETADO (tiene salida)")
                "COMPLETADO"
            }
            estadoFichado.tieneEntrada -> {
                android.util.Log.d("MarcacionesScreen", "Estado: TRABAJANDO (tiene entrada, sin salida)")
                "TRABAJANDO"
            }
            else -> {
                android.util.Log.d("MarcacionesScreen", "Estado: SIN_MARCAR (sin entrada ni salida)")
                "SIN_MARCAR"
            }
        }
        
        android.util.Log.d("MarcacionesScreen", "=== ESTADO DETALLADO ===")
        android.util.Log.d("MarcacionesScreen", "dashboardHoy: ${dashboardHoy != null}")
        android.util.Log.d("MarcacionesScreen", "estadoFichado: $estadoFichado")
        android.util.Log.d("MarcacionesScreen", "estadoActual calculado: '$estadoActual'")
        if (estadoFichado != null) {
            android.util.Log.d("MarcacionesScreen", "tieneEntrada: ${estadoFichado.tieneEntrada}")
            android.util.Log.d("MarcacionesScreen", "tieneSalida: ${estadoFichado.tieneSalida}")
            android.util.Log.d("MarcacionesScreen", "horaEntrada: ${estadoFichado.horaEntrada}")
            android.util.Log.d("MarcacionesScreen", "horaSalida: ${estadoFichado.horaSalida}")
        }
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = when (estadoActual) {
                    "TRABAJANDO" -> MaterialTheme.colorScheme.secondaryContainer
                    "COMPLETADO" -> MaterialTheme.colorScheme.tertiaryContainer
                    else -> MaterialTheme.colorScheme.surfaceVariant
                }
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = estadoActual.replace("_", " "),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = when (estadoActual) {
                        "TRABAJANDO" -> MaterialTheme.colorScheme.onSecondaryContainer
                        "COMPLETADO" -> MaterialTheme.colorScheme.onTertiaryContainer
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    }
                )
                
                estadoFichado?.horaEntrada?.let { entrada ->
                    Spacer(modifier = Modifier.height(8.dp))
                    // Formatear la hora usando TimeUtils para consistencia
                    val horaFormateada = try {
                        val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
                        val date = sdf.parse(entrada)
                        if (date != null) TimeUtils.formatTimeForDisplay(date) else entrada
                    } catch (e: Exception) {
                        entrada // Fallback al valor original si hay error
                    }
                    Text(
                        text = "Entrada: $horaFormateada",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                estadoFichado?.horaSalida?.let { salida ->
                    // Formatear la hora usando TimeUtils para consistencia
                    val horaFormateada = try {
                        val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
                        val date = sdf.parse(salida)
                        if (date != null) TimeUtils.formatTimeForDisplay(date) else salida
                    } catch (e: Exception) {
                        salida // Fallback al valor original si hay error
                    }
                    Text(
                        text = "Salida: $horaFormateada",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                // Solo mostrar horas trabajadas si hay entrada Y salida
                val textoHorasTrabajadas = when {
                    estadoFichado == null -> "0:00h"
                    estadoFichado.tieneSalida && estadoFichado.horasTrabajadas != null -> 
                        "Horas trabajadas: ${String.format("%.2f", estadoFichado.horasTrabajadas)}h"
                    estadoFichado.tieneEntrada && !estadoFichado.tieneSalida -> 
                        "Estado: Trabajando..."
                    else -> "Horas trabajadas: 0:00h"
                }
                
                Text(
                    text = textoHorasTrabajadas,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        // Botones de marcación
        android.util.Log.d("MarcacionesScreen", "=== ESTADO DEBUG ===")
        android.util.Log.d("MarcacionesScreen", "dashboardHoy: $dashboardHoy")
        android.util.Log.d("MarcacionesScreen", "estadoFichado: $estadoFichado")
        android.util.Log.d("MarcacionesScreen", "estadoActual: '$estadoActual'")
        android.util.Log.d("MarcacionesScreen", "tieneEntrada: ${estadoFichado?.tieneEntrada}")
        android.util.Log.d("MarcacionesScreen", "tieneSalida: ${estadoFichado?.tieneSalida}")
        
        when (estadoActual) {
            "SIN_MARCAR" -> {
                android.util.Log.d("MarcacionesScreen", "✅ Entrando en caso SIN_MARCAR - Mostrando botón")
                Button(
                    onClick = { 
                        android.util.Log.d("MarcacionesScreen", "Botón MARCAR ENTRADA presionado")
                        val locationData = locationManager.getCurrentLocationForFichado()
                        android.util.Log.d("MarcacionesScreen", "LocationData: $locationData")
                        android.util.Log.d("MarcacionesScreen", "canPerformFichado: ${locationManager.canPerformFichado()}")
                        
                        if (locationData != null) {
                            android.util.Log.d("MarcacionesScreen", "Registrando entrada con GPS: lat=${locationData.latitude}, lon=${locationData.longitude}")
                            fichadoViewModel.registrarEntrada(
                                metodo = "GPS",
                                latitud = locationData.latitude,
                                longitud = locationData.longitude
                            )
                        } else {
                            android.util.Log.d("MarcacionesScreen", "Sin GPS, registrando entrada manual")
                            // Fallback a método manual si no hay GPS
                            fichadoViewModel.registrarEntrada(metodo = "MANUAL")
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    enabled = !fichadoUiState.isLoading && locationManager.canPerformFichado(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (locationManager.canPerformFichado()) 
                            Color(0xFF4CAF50) 
                        else 
                            MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    if (fichadoUiState.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Marcar entrada",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (locationManager.canPerformFichado()) 
                                "MARCAR ENTRADA (GPS)" 
                            else 
                                "GPS REQUERIDO",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            
            "TRABAJANDO" -> {
                android.util.Log.d("MarcacionesScreen", "✅ Entrando en caso TRABAJANDO - Mostrando botón salida")
                Button(
                    onClick = { 
                        val locationData = locationManager.getCurrentLocationForFichado()
                        if (locationData != null) {
                            fichadoViewModel.registrarSalida(
                                metodo = "GPS",
                                latitud = locationData.latitude,
                                longitud = locationData.longitude
                            )
                        } else {
                            // Fallback a método manual si no hay GPS
                            fichadoViewModel.registrarSalida(metodo = "MANUAL")
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    enabled = !fichadoUiState.isLoading && locationManager.canPerformFichado(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (locationManager.canPerformFichado()) 
                            Color(0xFFF44336) 
                        else 
                            MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    if (fichadoUiState.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.ExitToApp,
                            contentDescription = "Marcar salida",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (locationManager.canPerformFichado()) 
                                "MARCAR SALIDA (GPS)" 
                            else 
                                "GPS REQUERIDO",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            
            "COMPLETADO" -> {
                android.util.Log.d("MarcacionesScreen", "✅ Entrando en caso COMPLETADO - Permitiendo nueva entrada")
                // Mostrar mensaje de jornada completada
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.tertiaryContainer
                    )
                ) {
                    Text(
                        text = "✅ Última jornada completada",
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        textAlign = TextAlign.Center,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onTertiaryContainer
                    )
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Permitir registrar nueva entrada para otro turno
                Button(
                    onClick = { 
                        android.util.Log.d("MarcacionesScreen", "Botón NUEVA ENTRADA presionado (después de completar turno)")
                        val locationData = locationManager.getCurrentLocationForFichado()
                        android.util.Log.d("MarcacionesScreen", "LocationData: $locationData")
                        android.util.Log.d("MarcacionesScreen", "canPerformFichado: ${locationManager.canPerformFichado()}")
                        
                        if (locationData != null) {
                            android.util.Log.d("MarcacionesScreen", "Registrando nueva entrada con GPS: lat=${locationData.latitude}, lon=${locationData.longitude}")
                            fichadoViewModel.registrarEntrada(
                                metodo = "GPS",
                                latitud = locationData.latitude,
                                longitud = locationData.longitude
                            )
                        } else {
                            android.util.Log.d("MarcacionesScreen", "Sin GPS, registrando nueva entrada manual")
                            fichadoViewModel.registrarEntrada(metodo = "MANUAL")
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    enabled = !fichadoUiState.isLoading && locationManager.canPerformFichado(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (locationManager.canPerformFichado()) 
                            Color(0xFF4CAF50) 
                        else 
                            MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    if (fichadoUiState.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Nueva entrada",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (locationManager.canPerformFichado()) 
                                "NUEVA ENTRADA (GPS)" 
                            else 
                                "GPS REQUERIDO",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            else -> {
                android.util.Log.e("MarcacionesScreen", "❌ CASO NO MANEJADO - estadoActual: '$estadoActual'")
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = "⚠️ Error: Estado desconocido '$estadoActual'",
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        textAlign = TextAlign.Center,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }
        
        // Información adicional
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Método: ${if (locationManager.canPerformFichado()) "GPS Activo" else "GPS Requerido"}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = if (locationManager.canPerformFichado()) {
                        "• Fichado con validación GPS activa\n• Ubicación verificada en tiempo real\n• Distancia a cocina: ${distanceToKitchen?.toInt() ?: 0}m"
                    } else {
                        "• Active el GPS para fichar\n• Debe estar en el área de la cocina\n• Radio permitido: 100 metros"
                    },
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                )
            }
        }
        
        // Mostrar mensaje de error si existe
        fichadoUiState.errorMessage?.let { error ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Text(
                    text = "❌ $error",
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.padding(16.dp),
                    fontSize = 14.sp
                )
            }
        }
        
        // Mostrar mensaje de éxito
        if (fichadoUiState.isEntradaExitosa) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF4CAF50).copy(alpha = 0.1f)
                )
            ) {
                Text(
                    text = "✅ Entrada registrada correctamente",
                    color = Color(0xFF4CAF50),
                    modifier = Modifier.padding(16.dp),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
        
        if (fichadoUiState.isSalidaExitosa) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFF44336).copy(alpha = 0.1f)
                )
            ) {
                Text(
                    text = "✅ Salida registrada correctamente",
                    color = Color(0xFFF44336),
                    modifier = Modifier.padding(16.dp),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
        }
    }
    
    // Observar estado del diálogo de token expirado
    val showTokenExpiredDialog by fichadoViewModel.authStateManager.showTokenExpiredDialog.collectAsStateWithLifecycle()
    
    // Mostrar diálogo de token expirado
    if (showTokenExpiredDialog) {
        TokenExpiredDialog(
            onGoToLogin = {
                fichadoViewModel.authStateManager.dismissTokenExpiredDialog()
                onLogout()
            },
            onDismiss = {
                fichadoViewModel.authStateManager.dismissTokenExpiredDialog()
            }
        )
    }
}