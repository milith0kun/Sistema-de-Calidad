package com.example.sistemadecalidad.ui.screens.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Menu

import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
 * Implementa diseño según especificaciones:
 * - Header con círculo de persona, nombre del empleado y menú
 * - Card con estado actual del fichado
 * - Horas trabajadas del día
 * - Último fichado registrado
 * - Botón principal "Analítica de Datos"
 * - Fecha y hora en tiempo real
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToAnalitica: () -> Unit,
    onNavigateToMarcaciones: () -> Unit = {},
    onNavigateToHistorial: () -> Unit = {},
    onNavigateToHaccp: () -> Unit = {},
    onNavigateToAbout: () -> Unit = {},
    onLogout: () -> Unit = {},
    authViewModel: AuthViewModel, // = hiltViewModel(),
    fichadoViewModel: FichadoViewModel // = hiltViewModel()
) {
    var showMenu by remember { mutableStateOf(false) }
    var currentTime by remember { mutableStateOf(Date()) }
    
    // Observar estados
    val currentUser by authViewModel.currentUser.collectAsStateWithLifecycle()
    val dashboardHoy by fichadoViewModel.dashboardHoy.collectAsStateWithLifecycle()
    val fichadoState by fichadoViewModel.uiState.collectAsStateWithLifecycle()
    
    // Actualizar hora cada segundo usando zona horaria de Perú
    LaunchedEffect(Unit) {
        while (true) {
            currentTime = TimeUtils.getCurrentPeruDate()
            delay(1000L)
        }
    }
    
    // Inicializar datos al cargar la pantalla
    LaunchedEffect(Unit) {
        fichadoViewModel.inicializarDatos()
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
        // Espaciado superior para bajar el header
        Spacer(modifier = Modifier.height(24.dp))
        
        // Header según especificaciones - posición más baja
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            ),
            shape = RoundedCornerShape(bottomStart = 0.dp, bottomEnd = 0.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp), // Aumentado el padding
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Círculo con icono de persona
                Card(
                    modifier = Modifier.size(52.dp), // Ligeramente más grande
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    ),
                    shape = RoundedCornerShape(50)
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Usuario",
                            tint = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                // Información del empleado
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = "Bienvenido",
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Text(
                        text = currentUser?.nombre ?: "Usuario",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
                
                // Menú hamburguesa en esquina superior
                Box {
                    IconButton(
                        onClick = { showMenu = true }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "Menú",
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    
                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Mi Perfil") },
                            onClick = { 
                                showMenu = false
                                // TODO: Navegar a perfil
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
                        DropdownMenuItem(
                            text = { Text("Cerrar sesión") },
                            onClick = { 
                                showMenu = false
                                authViewModel.logout()
                                onLogout()
                            },
                            leadingIcon = {
                                Icon(Icons.Default.ExitToApp, contentDescription = null)
                            }
                        )
                    }
                }
            }
        }
        
        // Contenido principal según especificaciones
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Fecha y hora actual en tiempo real
            item {
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
                            text = fechaActual.replaceFirstChar { it.uppercase() },
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        Text(
                            text = horaActual,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
            
            // Card con estado actual del fichado
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        val estadoFichado = dashboardHoy?.data?.estadoFichado
                        val estadoActual = when {
                            estadoFichado == null -> "SIN_MARCAR"
                            estadoFichado.tieneSalida -> "COMPLETADO"
                            estadoFichado.tieneEntrada -> "TRABAJANDO"
                            else -> "SIN_MARCAR"
                        }
                        
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Estado",
                                tint = if (estadoActual == "TRABAJANDO") 
                                    MaterialTheme.colorScheme.primary 
                                else 
                                    MaterialTheme.colorScheme.outline,
                                modifier = Modifier.size(24.dp)
                            )
                            
                            Spacer(modifier = Modifier.width(12.dp))
                            
                            Column {
                                Text(
                                    text = "Estado actual",
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = estadoActual,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }
            
            // Horas trabajadas del día
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccessTime,
                                contentDescription = "Horas trabajadas",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(24.dp)
                            )
                            
                            Spacer(modifier = Modifier.width(12.dp))
                            
                            Column {
                                Text(
                                    text = "Horas trabajadas hoy",
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                
                                // Solo mostrar horas trabajadas si hay entrada Y salida
                                val estadoFichado = dashboardHoy?.data?.estadoFichado
                                val textoHoras = when {
                                    estadoFichado == null -> "0:00"
                                    estadoFichado.tieneSalida && estadoFichado.horasTrabajadas != null -> 
                                        String.format("%.2f h", estadoFichado.horasTrabajadas)
                                    estadoFichado.tieneEntrada && !estadoFichado.tieneSalida -> 
                                        "Trabajando..."
                                    else -> "0:00"
                                }
                                
                                Text(
                                    text = textoHoras,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }
            
            // Último fichado registrado - Mostrar hora de entrada
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = "Último fichado",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(24.dp)
                            )
                            
                            Spacer(modifier = Modifier.width(12.dp))
                            
                            Column {
                                Text(
                                    text = "Hora de entrada",
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                // Formatear la hora usando TimeUtils para mostrar en zona horaria de Lima
                                val horaEntradaFormateada = dashboardHoy?.data?.estadoFichado?.horaEntrada?.let { entrada ->
                                    try {
                                        val sdf = java.text.SimpleDateFormat("HH:mm:ss", Locale.getDefault())
                                        val date = sdf.parse(entrada)
                                        if (date != null) TimeUtils.formatTimeForDisplay(date) else entrada
                                    } catch (e: Exception) {
                                        entrada // Fallback al valor original si hay error
                                    }
                                } ?: "Sin registros"
                                
                                Text(
                                    text = horaEntradaFormateada,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }
            
            // Botón principal - "Analítica de Datos" (único botón disponible)
            item {
                Spacer(modifier = Modifier.height(8.dp))
                
                Button(
                    onClick = onNavigateToAnalitica,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.DateRange,
                        contentDescription = "Analítica",
                        modifier = Modifier.size(20.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Text(
                        text = "Analítica de Datos",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            
            // Espacio adicional para la navegación inferior
            item {
                Spacer(modifier = Modifier.height(80.dp))
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