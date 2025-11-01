package com.example.sistemadecalidad.ui.components

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.model.*
import kotlinx.coroutines.delay

/**
 * Componente de Google Maps optimizado para mostrar la ubicación del usuario y el área de trabajo
 * Incluye marcadores, círculo de radio permitido y zoom automático
 */
@Composable
fun GoogleMapView(
    modifier: Modifier = Modifier,
    userLatitude: Double?,
    userLongitude: Double?,
    targetLatitude: Double,
    targetLongitude: Double,
    allowedRadius: Int,
    isLocationValid: Boolean,
    onMapReady: (GoogleMap) -> Unit = {}
) {
    val context = LocalContext.current
    var googleMap by remember { mutableStateOf<GoogleMap?>(null) }
    var userMarker by remember { mutableStateOf<Marker?>(null) }
    var targetMarker by remember { mutableStateOf<Marker?>(null) }
    var radiusCircle by remember { mutableStateOf<Circle?>(null) }
    var isMapLoaded by remember { mutableStateOf(false) }
    
    // Verificar permisos de ubicación
    val hasLocationPermission = remember(context) {
        ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    // Actualizar marcadores cuando cambien las coordenadas
    LaunchedEffect(googleMap, userLatitude, userLongitude, targetLatitude, targetLongitude, allowedRadius, isMapLoaded) {
        if (isMapLoaded) {
            googleMap?.let { map ->
                updateMapMarkers(
                    map = map,
                    userLatitude = userLatitude,
                    userLongitude = userLongitude,
                    targetLatitude = targetLatitude,
                    targetLongitude = targetLongitude,
                    allowedRadius = allowedRadius,
                    isLocationValid = isLocationValid,
                    userMarker = userMarker,
                    targetMarker = targetMarker,
                    radiusCircle = radiusCircle,
                    onUserMarkerUpdate = { userMarker = it },
                    onTargetMarkerUpdate = { targetMarker = it },
                    onRadiusCircleUpdate = { radiusCircle = it }
                )
            }
        }
    }
    
    Column(modifier = modifier) {
        // Información del estado con mejor diseño
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (isLocationValid) 
                    Color(0xFF4CAF50).copy(alpha = 0.15f) 
                else 
                    Color(0xFFF44336).copy(alpha = 0.15f)
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isLocationValid) "✅ Dentro del área permitida" else "❌ Fuera del área permitida",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isLocationValid) Color(0xFF2E7D32) else Color(0xFFD32F2F)
                )
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Contenedor del mapa con mejor diseño
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp) // Aumentado para mejor visualización
            ) {
                // Mapa de Google Maps
                AndroidView(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(16.dp)),
                    factory = { context ->
                        MapView(context).apply {
                            onCreate(null)
                            onResume()
                            getMapAsync { map ->
                                googleMap = map
                                setupGoogleMap(map, hasLocationPermission)
                                isMapLoaded = true
                                onMapReady(map)
                                
                                // Configuración inicial del mapa con delay para asegurar carga
                                android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                                    updateMapMarkers(
                                        map = map,
                                        userLatitude = userLatitude,
                                        userLongitude = userLongitude,
                                        targetLatitude = targetLatitude,
                                        targetLongitude = targetLongitude,
                                        allowedRadius = allowedRadius,
                                        isLocationValid = isLocationValid,
                                        userMarker = userMarker,
                                        targetMarker = targetMarker,
                                        radiusCircle = radiusCircle,
                                        onUserMarkerUpdate = { userMarker = it },
                                        onTargetMarkerUpdate = { targetMarker = it },
                                        onRadiusCircleUpdate = { radiusCircle = it }
                                    )
                                }, 500) // Delay de 500ms para asegurar que el mapa esté listo
                            }
                        }
                    }
                )
                
                // Indicador de carga
                if (!isMapLoaded) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Gray.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(
                                color = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Cargando mapa...",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Leyenda mejorada
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f)
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                LegendItem(
                    icon = "🔵",
                    text = "Tu ubicación",
                    color = Color(0xFF2196F3)
                )
                LegendItem(
                    icon = "📍",
                    text = "Cocina",
                    color = Color(0xFFD32F2F)
                )
                LegendItem(
                    icon = "⭕",
                    text = "Área permitida",
                    color = Color(0xFF4CAF50)
                )
            }
        }
    }
}

@Composable
private fun LegendItem(
    icon: String,
    text: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = icon,
            fontSize = 16.sp
        )
        Text(
            text = text,
            fontSize = 10.sp,
            color = color,
            fontWeight = FontWeight.Medium
        )
    }
}

/**
 * Configura las opciones básicas del mapa de Google
 */
private fun setupGoogleMap(map: GoogleMap, hasLocationPermission: Boolean) {
    map.apply {
        // Configurar UI
        uiSettings.apply {
            isZoomControlsEnabled = true
            isCompassEnabled = true
            isMyLocationButtonEnabled = hasLocationPermission
            isMapToolbarEnabled = false
        }
        
        // Habilitar ubicación del usuario si hay permisos
        if (hasLocationPermission) {
            try {
                isMyLocationEnabled = true
            } catch (e: SecurityException) {
                android.util.Log.e("GoogleMapView", "Error habilitando ubicación: ${e.message}")
            }
        }
        
        // Tipo de mapa
        mapType = GoogleMap.MAP_TYPE_NORMAL
    }
}

/**
 * Actualiza los marcadores y elementos del mapa
 */
private fun updateMapMarkers(
    map: GoogleMap,
    userLatitude: Double?,
    userLongitude: Double?,
    targetLatitude: Double,
    targetLongitude: Double,
    allowedRadius: Int,
    isLocationValid: Boolean,
    userMarker: Marker?,
    targetMarker: Marker?,
    radiusCircle: Circle?,
    onUserMarkerUpdate: (Marker?) -> Unit,
    onTargetMarkerUpdate: (Marker?) -> Unit,
    onRadiusCircleUpdate: (Circle?) -> Unit
) {
    // Limpiar marcadores existentes
    userMarker?.remove()
    targetMarker?.remove()
    radiusCircle?.remove()
    
    val targetLocation = LatLng(targetLatitude, targetLongitude)
    
    // Agregar marcador de la cocina (ubicación objetivo)
    val newTargetMarker = map.addMarker(
        MarkerOptions()
            .position(targetLocation)
            .title("Cocina")
            .snippet("Ubicación objetivo para fichado")
            .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_RED))
    )
    onTargetMarkerUpdate(newTargetMarker)
    
    // Agregar círculo de radio permitido
    val newRadiusCircle = map.addCircle(
        CircleOptions()
            .center(targetLocation)
            .radius(allowedRadius.toDouble())
            .strokeColor(Color(0xFF4CAF50).toArgb())
            .strokeWidth(3f)
            .fillColor(Color(0x404CAF50).toArgb())
    )
    onRadiusCircleUpdate(newRadiusCircle)
    
    // Agregar marcador del usuario si hay ubicación
    var newUserMarker: Marker? = null
    if (userLatitude != null && userLongitude != null) {
        val userLocation = LatLng(userLatitude, userLongitude)
        newUserMarker = map.addMarker(
            MarkerOptions()
                .position(userLocation)
                .title("Tu ubicación")
                .snippet(if (isLocationValid) "Dentro del área permitida" else "Fuera del área permitida")
                .icon(BitmapDescriptorFactory.defaultMarker(
                    if (isLocationValid) BitmapDescriptorFactory.HUE_BLUE 
                    else BitmapDescriptorFactory.HUE_ORANGE
                ))
        )
    }
    onUserMarkerUpdate(newUserMarker)
    
    // Ajustar zoom para mostrar ambas ubicaciones
    adjustMapZoom(map, userLatitude, userLongitude, targetLatitude, targetLongitude, allowedRadius)
}

/**
 * Ajusta el zoom del mapa para mostrar todas las ubicaciones relevantes
 */
private fun adjustMapZoom(
    map: GoogleMap,
    userLatitude: Double?,
    userLongitude: Double?,
    targetLatitude: Double,
    targetLongitude: Double,
    allowedRadius: Int
) {
    val boundsBuilder = LatLngBounds.Builder()
    val targetLocation = LatLng(targetLatitude, targetLongitude)
    
    // Incluir ubicación objetivo
    boundsBuilder.include(targetLocation)
    
    // Incluir ubicación del usuario si está disponible
    if (userLatitude != null && userLongitude != null) {
        boundsBuilder.include(LatLng(userLatitude, userLongitude))
    }
    
    // Incluir puntos del círculo para asegurar que se vea completo
    val radiusInDegrees = allowedRadius / 111320.0 // Aproximación: 1 grado ≈ 111.32 km
    boundsBuilder.include(LatLng(targetLatitude + radiusInDegrees, targetLongitude))
    boundsBuilder.include(LatLng(targetLatitude - radiusInDegrees, targetLongitude))
    boundsBuilder.include(LatLng(targetLatitude, targetLongitude + radiusInDegrees))
    boundsBuilder.include(LatLng(targetLatitude, targetLongitude - radiusInDegrees))
    
    try {
        val bounds = boundsBuilder.build()
        val padding = 100 // Padding en píxeles
        val cameraUpdate = CameraUpdateFactory.newLatLngBounds(bounds, padding)
        map.animateCamera(cameraUpdate)
    } catch (e: Exception) {
        android.util.Log.e("GoogleMapView", "Error ajustando zoom: ${e.message}")
        // Fallback: centrar en la ubicación objetivo con zoom fijo
        map.animateCamera(
            CameraUpdateFactory.newLatLngZoom(targetLocation, 16f)
        )
    }
}