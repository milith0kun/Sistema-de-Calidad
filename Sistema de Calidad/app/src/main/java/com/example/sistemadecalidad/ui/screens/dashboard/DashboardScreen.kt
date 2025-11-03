package com.example.sistemadecalidad.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color
// import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.sistemadecalidad.ui.components.TokenExpiredDialog
import com.example.sistemadecalidad.ui.viewmodel.AuthViewModel
import com.example.sistemadecalidad.ui.viewmodel.FichadoViewModel
import com.example.sistemadecalidad.utils.TimeUtils
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.delay

/**
 * Pantalla principal del dashboard con información del empleado y estado actual
 * Implementa diseño moderno con:
 * - Header con información del usuario y tiempo real
 * - Cards informativas con métricas importantes
 * - Estado actual del fichado con indicadores visuales
 * - Resumen de actividad diaria y semanal
 * - Accesos rápidos a funciones principales
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToAnalitica: () -> Unit,
    onNavigateToMarcaciones: () -> Unit = {},
    onNavigateToHistorial: () -> Unit = {},
    onNavigateToHaccp: () -> Unit = {},
    onNavigateToAbout: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {},
    onLogout: () -> Unit = {},
    authViewModel: AuthViewModel, // = hiltViewModel(),
    fichadoViewModel: FichadoViewModel // = hiltViewModel()
) {
    var showMenu by remember { mutableStateOf(false) }
    var currentTime by remember { mutableStateOf(Date()) }
    
    // Observar estados
    val currentUser by authViewModel.currentUser.collectAsStateWithLifecycle()
    val isInitializing by authViewModel.isInitializing.collectAsStateWithLifecycle()
    val dashboardHoy by fichadoViewModel.dashboardHoy.collectAsStateWithLifecycle()
    val fichadoUiState by fichadoViewModel.uiState.collectAsStateWithLifecycle()
    
    // Actualizar hora cada segundo usando zona horaria de Perú
    LaunchedEffect(Unit) {
        while (true) {
            currentTime = TimeUtils.getCurrentPeruDate()
            delay(1000L)
        }
    }
    
    // Inicializar datos del dashboard solo cuando el usuario esté cargado
    LaunchedEffect(currentUser, isInitializing) {
        if (!isInitializing && currentUser != null) {
            android.util.Log.d("DashboardScreen", "Usuario cargado, inicializando datos del dashboard")
            fichadoViewModel.inicializarDatos()
        }
    }
    
    // Observar eventos de token expirado
    LaunchedEffect(fichadoViewModel) {
        fichadoViewModel.authStateManager.tokenExpiredEvent.collect { tokenExpiredTime ->
            if (tokenExpiredTime != null) {
                android.util.Log.d("DashboardScreen", "Token expirado detectado - Redirigiendo al login")
                onLogout()
            }
        }
    }
    
    // Formatear fecha y hora actual en tiempo real usando zona horaria de Perú
    val fechaActual = remember(currentTime) {
        TimeUtils.formatDateForDisplay(currentTime)
    }
    
    val horaActual = remember(currentTime) {
        TimeUtils.formatTimeForDisplay(currentTime)
    }
    
    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surfaceContainer
            ) {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Inicio") },
                    label = { Text("Inicio") },
                    selected = true,
                    onClick = { /* Ya estamos en Dashboard */ }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.AccessTime, contentDescription = "Marcaciones") },
                    label = { Text("Fichado") },
                    selected = false,
                    onClick = onNavigateToMarcaciones
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
        ) {
            // Header mejorado con mejor diseño y legibilidad
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                shape = RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 20.dp)
                ) {
                    // Fila superior con información del usuario y menú
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Información de bienvenida mejorada
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = "¡Bienvenido de vuelta!",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f),
                                fontWeight = FontWeight.Medium
                            )
                            
                            // Mostrar indicador de carga o nombre del usuario
                            if (isInitializing) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(vertical = 4.dp)
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Cargando...",
                                        style = MaterialTheme.typography.headlineSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                                    )
                                }
                            } else {
                                Text(
                                    text = currentUser?.nombreCompleto ?: "Usuario",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    maxLines = 1,
                                    overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                                )
                            }
                        }
                        
                        // Botón de menú de perfil mejorado
                        Box {
                            Card(
                                modifier = Modifier.size(48.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.primary
                                ),
                                shape = RoundedCornerShape(12.dp),
                                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                            ) {
                                IconButton(
                                    onClick = { showMenu = true },
                                    modifier = Modifier.fillMaxSize()
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Person,
                                        contentDescription = "Mi Perfil",
                                        tint = MaterialTheme.colorScheme.onPrimary,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                            }
                            
                            // Indicador de estado activo
                            val estadoFichado = dashboardHoy?.data?.estadoFichado
                            val isActive = estadoFichado?.tieneEntrada == true && !estadoFichado.tieneSalida
                            
                            if (isActive) {
                                Card(
                                    modifier = Modifier
                                        .size(14.dp)
                                        .offset(x = 34.dp, y = 34.dp),
                                    colors = CardDefaults.cardColors(
                                        containerColor = Color(0xFF4CAF50)
                                    ),
                                    shape = RoundedCornerShape(50),
                                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                                ) {}
                            }
                            
                            // Menú desplegable mejorado
                            DropdownMenu(
                                expanded = showMenu,
                                onDismissRequest = { showMenu = false },
                                modifier = Modifier.width(200.dp)
                            ) {
                                // Header del menú con información del usuario
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp)
                                ) {
                                    Text(
                                        text = currentUser?.nombreCompleto ?: "Usuario",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = currentUser?.email ?: "",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    currentUser?.cargo?.let { cargo ->
                                        Text(
                                            text = cargo,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.primary,
                                            fontWeight = FontWeight.Medium
                                        )
                                    }
                                }
                                
                                HorizontalDivider()
                                
                                DropdownMenuItem(
                                    text = { Text("Mi Perfil") },
                                    onClick = { 
                                        showMenu = false
                                        onNavigateToProfile()
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.Person, contentDescription = null)
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Acerca de") },
                                    onClick = { 
                                        showMenu = false
                                        onNavigateToAbout()
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.Info, contentDescription = null)
                                    }
                                )
                                
                                HorizontalDivider()
                                
                                DropdownMenuItem(
                                    text = { Text("Cerrar sesión") },
                                    onClick = { 
                                        showMenu = false
                                        authViewModel.logout()
                                        onLogout()
                                    },
                                    leadingIcon = {
                                        Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = null)
                                    }
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Fila inferior con fecha, hora y estado
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Fecha y hora mejorada con mejor legibilidad
                        Column {
                            Text(
                                text = fechaActual.replaceFirstChar { it.uppercase() },
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            Text(
                                text = horaActual,
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        
                        // Estado de fichado mejorado
                        val estadoFichado = dashboardHoy?.data?.estadoFichado
                        val isActive = estadoFichado?.tieneEntrada == true && !estadoFichado.tieneSalida
                        
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = if (isActive) 
                                    Color(0xFF4CAF50).copy(alpha = 0.1f) 
                                else 
                                    MaterialTheme.colorScheme.surface.copy(alpha = 0.5f)
                            ),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .background(
                                            color = if (isActive) Color(0xFF4CAF50) else Color(0xFF9E9E9E),
                                            shape = RoundedCornerShape(50)
                                        )
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (isActive) "Activo" else "Inactivo",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Medium,
                                    color = if (isActive) Color(0xFF4CAF50) else Color(0xFF9E9E9E)
                                )
                            }
                        }
                    }
                }
            }
            
            // Contenido principal mejorado con estados de carga
            when {
                isInitializing -> {
                    // Estado de inicialización de la app
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(48.dp),
                                color = MaterialTheme.colorScheme.primary
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Text(
                                text = "Inicializando aplicación...",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }
                
                fichadoUiState.isLoading -> {
                    // Estado de carga de datos del dashboard
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(48.dp),
                                color = MaterialTheme.colorScheme.primary
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Text(
                                text = "Cargando datos del dashboard...",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }
                
                else -> {
                    // Contenido normal del dashboard
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                // Estado actual prominente
                item {
                    val estadoFichado = dashboardHoy?.data?.estadoFichado
                    val estadoActual = when {
                        estadoFichado == null -> "Sin marcar"
                        estadoFichado.tieneSalida -> "Jornada completada"
                        estadoFichado.tieneEntrada -> "Trabajando actualmente"
                        else -> "Sin marcar entrada"
                    }
                    
                    val estadoColor = when {
                        estadoFichado?.tieneEntrada == true && !estadoFichado.tieneSalida -> 
                            MaterialTheme.colorScheme.primary
                        estadoFichado?.tieneSalida == true -> 
                            MaterialTheme.colorScheme.tertiary
                        else -> 
                            MaterialTheme.colorScheme.outline
                    }
                    
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = estadoColor.copy(alpha = 0.1f)
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(20.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Estado",
                                tint = estadoColor,
                                modifier = Modifier.size(32.dp)
                            )
                            
                            Spacer(modifier = Modifier.width(16.dp))
                            
                            Column(
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = "Estado Actual",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = estadoActual,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = estadoColor
                                )
                            }
                            
                            // Botón de actualizar
                            IconButton(
                                onClick = { fichadoViewModel.inicializarDatos() }
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Actualizar",
                                    tint = estadoColor
                                )
                            }
                        }
                    }
                }
                
                // Métricas en grid mejorado
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Horas trabajadas hoy
                        Card(
                            modifier = Modifier.weight(1f),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            ),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AccessTime,
                                    contentDescription = "Horas trabajadas",
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(24.dp)
                                )
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                val estadoFichado = dashboardHoy?.data?.estadoFichado
                                val horasTexto = if (estadoFichado?.tieneEntrada == true && estadoFichado.tieneSalida) {
                                    val horas = estadoFichado.horasTrabajadas ?: 0.0
                                    String.format("%.1f", horas)
                                } else if (estadoFichado?.tieneEntrada == true) {
                                    "En curso"
                                } else {
                                    "0.0"
                                }
                                
                                Text(
                                    text = if (horasTexto != "En curso") horasTexto else "⏱️",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                
                                Text(
                                    text = if (horasTexto != "En curso") "Horas hoy" else "En progreso",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        
                        // Ubicación actual
                        Card(
                            modifier = Modifier.weight(1f),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            ),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = "Ubicación",
                                    tint = MaterialTheme.colorScheme.secondary,
                                    modifier = Modifier.size(24.dp)
                                )
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                val estadoFichado = dashboardHoy?.data?.estadoFichado
                                val tieneGpsInfo = estadoFichado?.gpsInfo?.entradaConGps == true
                                
                                Text(
                                    text = if (tieneGpsInfo) "✓" else "📍",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold
                                )
                                
                                Text(
                                    text = if (tieneGpsInfo) "Con GPS" else "Manual",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
                
                // Información detallada de fichado
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Schedule,
                                    contentDescription = "Horarios",
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                
                                Spacer(modifier = Modifier.width(8.dp))
                                
                                Text(
                                    text = "Registro de Hoy",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            val estadoFichado = dashboardHoy?.data?.estadoFichado
                            
                            // Hora de entrada
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Entrada:",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                
                                val horaEntradaFormateada = estadoFichado?.horaEntrada?.let { entrada ->
                                    try {
                                        val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
                                        val date = sdf.parse(entrada)
                                        if (date != null) TimeUtils.formatTimeForDisplay(date) else entrada
                                    } catch (e: Exception) {
                                        entrada
                                    }
                                } ?: "Sin registro"
                                
                                Text(
                                    text = horaEntradaFormateada,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = if (estadoFichado?.tieneEntrada == true) 
                                        MaterialTheme.colorScheme.primary 
                                    else 
                                        MaterialTheme.colorScheme.outline
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            // Hora de salida
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Salida:",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                
                                val horaSalidaFormateada = estadoFichado?.horaSalida?.let { salida ->
                                    try {
                                        val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
                                        val date = sdf.parse(salida)
                                        if (date != null) TimeUtils.formatTimeForDisplay(date) else salida
                                    } catch (e: Exception) {
                                        salida
                                    }
                                } ?: "Pendiente"
                                
                                Text(
                                    text = horaSalidaFormateada,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = if (estadoFichado?.tieneSalida == true) 
                                        MaterialTheme.colorScheme.tertiary 
                                    else 
                                        MaterialTheme.colorScheme.outline
                                )
                            }
                        }
                    }
                }
                
                // Accesos rápidos mejorados
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Botón Analítica
                        Button(
                            onClick = onNavigateToAnalitica,
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.TrendingUp,
                                contentDescription = "Analítica",
                                modifier = Modifier.size(18.dp)
                            )
                            
                            Spacer(modifier = Modifier.width(8.dp))
                            
                            Text(
                                text = "Analítica",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        
                        // Botón HACCP
                        OutlinedButton(
                            onClick = onNavigateToHaccp,
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Assignment,
                                contentDescription = "HACCP",
                                modifier = Modifier.size(18.dp)
                            )
                            
                            Spacer(modifier = Modifier.width(8.dp))
                            
                            Text(
                                text = "Calidad",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
                
                // Espacio adicional para la navegación inferior
                item {
                    Spacer(modifier = Modifier.height(20.dp))
                }
                    } // Cierre de LazyColumn
                } // Cierre de else del when
            } // Cierre de when
        } // Cierre de Scaffold
    } // Cierre de contenido del Scaffold
    
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