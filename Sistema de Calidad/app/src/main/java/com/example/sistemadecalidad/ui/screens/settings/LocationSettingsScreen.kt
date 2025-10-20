package com.example.sistemadecalidad.ui.screens.settings

import android.Manifest
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.utils.LocationManager
import com.google.gson.Gson
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Pantalla de configuración de ubicación para fichado
 * Permite configurar:
 * - Latitud objetivo
 * - Longitud objetivo
 * - Radio de área permitida (metros)
 * - Activar/desactivar validación GPS
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationSettingsScreen(
    onNavigateBack: () -> Unit
) {
    val TAG = "LocationSettingsScreen"
    val context = LocalContext.current
    val preferencesManager = remember { PreferencesManager(context, Gson()) }
    val locationManager = remember { LocationManager(context) }
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()
    
    var targetLatitude by remember { mutableStateOf("-12.046374") } // Lima, Perú por defecto
    var targetLongitude by remember { mutableStateOf("-77.042793") }
    var allowedRadius by remember { mutableStateOf("100") } // 100 metros
    var gpsValidationEnabled by remember { mutableStateOf(true) }
    var showSuccessMessage by remember { mutableStateOf(false) }
    var isLoadingLocation by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    // Solicitar permisos de ubicación
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                     permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        
        if (granted) {
            Log.d(TAG, "Permisos de ubicación concedidos")
            locationManager.updatePermissions()
        } else {
            Log.w(TAG, "Permisos de ubicación denegados")
            errorMessage = "Se necesitan permisos de ubicación"
        }
    }
    
    // Cargar configuración guardada
    LaunchedEffect(Unit) {
        Log.d(TAG, "Cargando configuración guardada...")
        try {
            val savedConfig = preferencesManager.getLocationConfig().first()
            if (savedConfig != null) {
                targetLatitude = savedConfig.latitude.toString()
                targetLongitude = savedConfig.longitude.toString()
                allowedRadius = savedConfig.radius.toString()
                gpsValidationEnabled = savedConfig.gpsValidationEnabled
                Log.i(TAG, "Configuración cargada: lat=${savedConfig.latitude}, lon=${savedConfig.longitude}, radius=${savedConfig.radius}, gpsEnabled=${savedConfig.gpsValidationEnabled}")
            } else {
                Log.d(TAG, "No hay configuración guardada, usando valores por defecto")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error cargando configuración: ${e.message}", e)
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Configuración de Ubicación") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Título de sección
            Text(
                text = "Ubicación Objetivo para Fichado",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            
            Text(
                text = "Configura la ubicación donde se debe estar para fichar",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Campo de Latitud
            OutlinedTextField(
                value = targetLatitude,
                onValueChange = { targetLatitude = it },
                label = { Text("Latitud") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                supportingText = { Text("Ejemplo: -12.046374") }
            )
            
            // Campo de Longitud
            OutlinedTextField(
                value = targetLongitude,
                onValueChange = { targetLongitude = it },
                label = { Text("Longitud") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                supportingText = { Text("Ejemplo: -77.042793") }
            )
            
            // Campo de Radio permitido
            OutlinedTextField(
                value = allowedRadius,
                onValueChange = { allowedRadius = it },
                label = { Text("Radio Permitido (metros)") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                supportingText = { Text("Distancia máxima permitida desde el punto objetivo") }
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Switch para activar/desactivar validación GPS
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Validación GPS",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Requerir estar en la ubicación para fichar",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Switch(
                        checked = gpsValidationEnabled,
                        onCheckedChange = { gpsValidationEnabled = it }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Mapa visual de ubicación
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
                        text = "Vista de Ubicación",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    
                    // Canvas con mapa simplificado
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .background(Color(0xFFE3F2FD)),
                        contentAlignment = Alignment.Center
                    ) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val centerX = size.width / 2
                            val centerY = size.height / 2
                            
                            // Dibujar círculo de área permitida (radio)
                            val radiusPx = size.minDimension * 0.3f
                            drawCircle(
                                color = Color(0x4000C853), // Verde semi-transparente
                                radius = radiusPx,
                                center = Offset(centerX, centerY)
                            )
                            
                            // Borde del círculo
                            drawCircle(
                                color = Color(0xFF00C853),
                                radius = radiusPx,
                                center = Offset(centerX, centerY),
                                style = Stroke(width = 3f)
                            )
                            
                            // Marcador del punto objetivo (pin rojo)
                            drawCircle(
                                color = Color(0xFFD32F2F),
                                radius = 12f,
                                center = Offset(centerX, centerY)
                            )
                            
                            // Punto blanco interior del marcador
                            drawCircle(
                                color = Color.White,
                                radius = 4f,
                                center = Offset(centerX, centerY)
                            )
                        }
                        
                        // Información de ubicación actual
                        Column(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = Color.White.copy(alpha = 0.9f)
                                )
                            ) {
                                Column(
                                    modifier = Modifier.padding(8.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "📍 Ubicación Objetivo",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFD32F2F)
                                    )
                                    Text(
                                        text = "Lat: ${targetLatitude.take(10)}",
                                        fontSize = 10.sp,
                                        color = Color.Black
                                    )
                                    Text(
                                        text = "Lon: ${targetLongitude.take(10)}",
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
                        }
                    }
                    
                    Text(
                        text = "🔵 = Área Permitida  📍 = Ubicación Objetivo",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Botón para usar ubicación actual
            OutlinedButton(
                onClick = {
                    Log.d(TAG, "Botón 'Usar Mi Ubicación Actual' presionado")
                    errorMessage = null
                    
                    scope.launch {
                        try {
                            // Verificar y solicitar permisos si es necesario
                            val hasPermission = locationManager.hasLocationPermission.value
                            Log.d(TAG, "¿Tiene permisos de ubicación? $hasPermission")
                            
                            if (!hasPermission) {
                                Log.d(TAG, "Solicitando permisos de ubicación...")
                                locationPermissionLauncher.launch(
                                    arrayOf(
                                        Manifest.permission.ACCESS_FINE_LOCATION,
                                        Manifest.permission.ACCESS_COARSE_LOCATION
                                    )
                                )
                                return@launch
                            }
                            
                            // Iniciar tracking de ubicación
                            isLoadingLocation = true
                            Log.d(TAG, "Iniciando tracking de ubicación...")
                            locationManager.startLocationTracking()
                            
                            // Esperar a obtener ubicación (máximo 5 segundos)
                            repeat(10) { attempt ->
                                delay(500)
                                val currentLoc = locationManager.currentLocation.value
                                Log.d(TAG, "Intento ${attempt + 1}/10: ubicación = ${currentLoc?.let { "(${it.latitude}, ${it.longitude})" } ?: "null"}")
                                
                                if (currentLoc != null) {
                                    targetLatitude = currentLoc.latitude.toString()
                                    targetLongitude = currentLoc.longitude.toString()
                                    isLoadingLocation = false
                                    showSuccessMessage = true
                                    Log.i(TAG, "Ubicación obtenida: lat=${currentLoc.latitude}, lon=${currentLoc.longitude}")
                                    
                                    delay(2000)
                                    showSuccessMessage = false
                                    return@launch
                                }
                            }
                            
                            // No se pudo obtener ubicación
                            isLoadingLocation = false
                            errorMessage = "No se pudo obtener la ubicación. Verifica que el GPS esté activo."
                            Log.w(TAG, "Timeout obteniendo ubicación GPS")
                            
                        } catch (e: Exception) {
                            isLoadingLocation = false
                            errorMessage = "Error: ${e.message}"
                            Log.e(TAG, "Error obteniendo ubicación: ${e.message}", e)
                        } finally {
                            locationManager.stopLocationTracking()
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoadingLocation
            ) {
                if (isLoadingLocation) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Obteniendo ubicación...")
                } else {
                    Icon(Icons.Default.MyLocation, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Usar Mi Ubicación Actual")
                }
            }
            
            // Mensaje de error
            if (errorMessage != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = "⚠️ $errorMessage",
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            // Mensaje de éxito
            if (showSuccessMessage) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Text(
                        text = "✅ Configuración guardada exitosamente",
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
            
            // Botón para guardar configuración
            Button(
                onClick = {
                    scope.launch {
                        errorMessage = null
                        
                        try {
                            val lat = targetLatitude.toDoubleOrNull()
                            val lon = targetLongitude.toDoubleOrNull()
                            val radius = allowedRadius.toIntOrNull()
                            
                            if (lat == null || lon == null || radius == null) {
                                errorMessage = "Por favor, ingresa valores numéricos válidos"
                                Log.w(TAG, "Valores inválidos: lat=$targetLatitude, lon=$targetLongitude, radius=$allowedRadius")
                                return@launch
                            }
                            
                            if (lat < -90 || lat > 90) {
                                errorMessage = "Latitud debe estar entre -90 y 90"
                                Log.w(TAG, "Latitud fuera de rango: $lat")
                                return@launch
                            }
                            
                            if (lon < -180 || lon > 180) {
                                errorMessage = "Longitud debe estar entre -180 y 180"
                                Log.w(TAG, "Longitud fuera de rango: $lon")
                                return@launch
                            }
                            
                            if (radius <= 0) {
                                errorMessage = "El radio debe ser mayor a 0"
                                Log.w(TAG, "Radio inválido: $radius")
                                return@launch
                            }
                            
                            Log.i(TAG, "Guardando configuración: lat=$lat, lon=$lon, radius=$radius, gpsEnabled=$gpsValidationEnabled")
                            
                            // Guardar en PreferencesManager
                            preferencesManager.saveLocationConfig(lat, lon, radius, gpsValidationEnabled)
                            
                            // Recargar configuración en LocationManager
                            locationManager.reloadLocationConfig()
                            
                            showSuccessMessage = true
                            Log.i(TAG, "Configuración guardada exitosamente")
                            
                            delay(2000)
                            showSuccessMessage = false
                            
                        } catch (e: Exception) {
                            errorMessage = "Error al guardar: ${e.message}"
                            Log.e(TAG, "Error guardando configuración", e)
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Guardar Configuración")
            }

        }
    }
}
