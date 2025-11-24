package com.example.sistemadecalidad.ui.components

import android.content.Context
import android.graphics.drawable.Drawable
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
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polygon
import org.osmdroid.views.overlay.infowindow.InfoWindow
import com.example.sistemadecalidad.R

/**
 * Componente de OpenStreetMap que no requiere API Key
 * Muestra la ubicación del usuario, área objetivo y radio permitido
 */
@Composable
fun OSMMapView(
    modifier: Modifier = Modifier,
    userLatitude: Double?,
    userLongitude: Double?,
    targetLatitude: Double,
    targetLongitude: Double,
    allowedRadius: Int,
    isLocationValid: Boolean
) {
    val context = LocalContext.current
    var mapView by remember { mutableStateOf<MapView?>(null) }
    var isMapReady by remember { mutableStateOf(false) }

    // Configurar OSMDroid
    LaunchedEffect(Unit) {
        Configuration.getInstance().load(context, context.getSharedPreferences("osmdroid", Context.MODE_PRIVATE))
        Configuration.getInstance().userAgentValue = "SistemaHACCP"
    }

    // Layout principal optimizado para mapa cuadrado
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        // Información del estado con diseño mejorado y compacto
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (isLocationValid) 
                    Color(0xFF4CAF50).copy(alpha = 0.15f) 
                else 
                    Color(0xFFF44336).copy(alpha = 0.15f)
            ),
            shape = RoundedCornerShape(8.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isLocationValid) "✅ Dentro del área permitida" else "❌ Fuera del área permitida",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isLocationValid) Color(0xFF2E7D32) else Color(0xFFD32F2F)
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Contenedor del mapa cuadrado optimizado
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f) // Hace el mapa cuadrado (1:1)
            ) {
                // Mapa de OpenStreetMap
                AndroidView(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(16.dp)),
                    factory = { context ->
                        MapView(context).apply {
                            setTileSource(TileSourceFactory.MAPNIK)
                            setMultiTouchControls(true)
                            zoomController.setVisibility(org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER)
                            
                            // Configurar el mapa
                            controller.setZoom(16.0)
                            controller.setCenter(GeoPoint(targetLatitude, targetLongitude))
                            
                            mapView = this
                            isMapReady = true
                        }
                    },
                    update = { view ->
                        if (isMapReady) {
                            updateOSMMarkers(
                                mapView = view,
                                context = context,
                                userLatitude = userLatitude,
                                userLongitude = userLongitude,
                                targetLatitude = targetLatitude,
                                targetLongitude = targetLongitude,
                                allowedRadius = allowedRadius,
                                isLocationValid = isLocationValid
                            )
                        }
                    }
                )
                
                // Indicador de carga
                if (!isMapReady) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(16.dp)),
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
        
        Spacer(modifier = Modifier.height(6.dp))
        
        // Leyenda compacta y optimizada para el diseño cuadrado
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    RoundedCornerShape(6.dp)
                )
                .padding(horizontal = 10.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            LegendItemCompact("🔵", "Tu ubicación")
            LegendItemCompact("📍", "Cocina")
            LegendItemCompact("⭕", "Área permitida")
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

@Composable
private fun LegendItemCompact(
    icon: String,
    text: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(3.dp)
    ) {
        Text(
            text = icon,
            fontSize = 11.sp
        )
        Text(
            text = text,
            fontSize = 8.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontWeight = FontWeight.Medium
        )
    }
}

/**
 * Actualiza los marcadores y círculos en el mapa OSM
 */
@Suppress("UNUSED_PARAMETER")
private fun updateOSMMarkers(
    mapView: MapView,
    context: Context,
    userLatitude: Double?,
    userLongitude: Double?,
    targetLatitude: Double,
    targetLongitude: Double,
    allowedRadius: Int,
    isLocationValid: Boolean
) {
    // Limpiar overlays existentes
    mapView.overlays.clear()
    
    try {
        // Agregar marcador del objetivo (cocina)
        val targetMarker = Marker(mapView).apply {
            position = GeoPoint(targetLatitude, targetLongitude)
            title = "Cocina - Área de trabajo"
            snippet = "Ubicación objetivo para marcación"
            setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
        }
        mapView.overlays.add(targetMarker)
        
        // Agregar círculo del área permitida
        val allowedAreaCircle = Polygon().apply {
            val points = mutableListOf<GeoPoint>()
            val earthRadius = 6371000.0 // Radio de la Tierra en metros
            val radiusInDegrees = allowedRadius / earthRadius * (180.0 / Math.PI)
            
            // Crear círculo con puntos
            for (i in 0..360 step 10) {
                val angle = Math.toRadians(i.toDouble())
                val lat = targetLatitude + radiusInDegrees * Math.cos(angle)
                val lng = targetLongitude + radiusInDegrees * Math.sin(angle) / Math.cos(Math.toRadians(targetLatitude))
                points.add(GeoPoint(lat, lng))
            }
            
            this.points = points
            // Usar métodos no deprecados para configurar el polígono
            this.fillPaint.color = Color(0xFF4CAF50).copy(alpha = 0.3f).toArgb()
            this.outlinePaint.color = Color(0xFF4CAF50).toArgb()
            this.outlinePaint.strokeWidth = 3.0f
            title = "Área permitida (${allowedRadius}m)"
        }
        mapView.overlays.add(allowedAreaCircle)
        
        // Agregar marcador del usuario si está disponible
        if (userLatitude != null && userLongitude != null) {
            val userMarker = Marker(mapView).apply {
                position = GeoPoint(userLatitude, userLongitude)
                title = if (isLocationValid) "Tu ubicación ✅" else "Tu ubicación ❌"
                snippet = if (isLocationValid) "Dentro del área permitida" else "Fuera del área permitida"
                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
            }
            mapView.overlays.add(userMarker)
            
            // Ajustar zoom para mostrar ambos puntos
            val boundingBox = org.osmdroid.util.BoundingBox(
                maxOf(userLatitude, targetLatitude) + 0.001,
                maxOf(userLongitude, targetLongitude) + 0.001,
                minOf(userLatitude, targetLatitude) - 0.001,
                minOf(userLongitude, targetLongitude) - 0.001
            )
            mapView.zoomToBoundingBox(boundingBox, true, 100)
        } else {
            // Solo centrar en el objetivo
            mapView.controller.setCenter(GeoPoint(targetLatitude, targetLongitude))
            mapView.controller.setZoom(16.0)
        }
        
        // Refrescar el mapa
        mapView.invalidate()
        
    } catch (e: Exception) {
        // En caso de error, al menos centrar el mapa
        mapView.controller.setCenter(GeoPoint(targetLatitude, targetLongitude))
        mapView.controller.setZoom(16.0)
    }
}