package com.example.sistemadecalidad.ui.screens.historial

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.automirrored.filled.EventNote
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.sistemadecalidad.ui.components.TokenExpiredDialog
import com.example.sistemadecalidad.ui.viewmodel.AuthViewModel
import com.example.sistemadecalidad.ui.viewmodel.FichadoViewModel
import com.example.sistemadecalidad.utils.TimeUtils
import java.text.SimpleDateFormat
import java.util.*

/**
 * Modelo de datos para representar un registro de marcación
 * Usado para mostrar entradas y salidas en el historial
 */
data class RegistroMarcacion(
    val fecha: String,
    val hora: String,
    val tipo: String, // "ENTRADA" o "SALIDA"
    val estado: String // "PUNTUAL" o "TARDANZA"
)

/**
 * Pantalla de historial de marcaciones
 * Muestra el historial de entradas y salidas del usuario
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistorialScreen(
    fichadoViewModel: FichadoViewModel,
    authViewModel: AuthViewModel? = null,
    onNavigateToDashboard: () -> Unit = {},
    onNavigateToMarcaciones: () -> Unit = {},
    onNavigateToHaccp: () -> Unit = {},
    onLogout: () -> Unit = {}
) {
    var showMenu by remember { mutableStateOf(false) }
    
    // Estados observados
    val historialFichados by fichadoViewModel.historial.collectAsStateWithLifecycle()
    val uiState by fichadoViewModel.uiState.collectAsStateWithLifecycle()
    val currentUser by (authViewModel?.currentUser?.collectAsStateWithLifecycle() ?: remember { mutableStateOf(null) })
    val showTokenExpiredDialog by fichadoViewModel.authStateManager.showTokenExpiredDialog.collectAsStateWithLifecycle()
    
    // Función para recargar historial manualmente
    val recargarHistorial = {
        android.util.Log.d("HistorialScreen", "🔄 Recarga manual solicitada - Forzando actualización")
        fichadoViewModel.obtenerHistorial(forceRefresh = true)
    }
    
    // Cargar historial solo si es necesario (con caché inteligente)
    LaunchedEffect(Unit) {
        android.util.Log.d("HistorialScreen", "🔄 Verificando si necesita cargar historial (con caché inteligente)")
        fichadoViewModel.obtenerHistorial() // Usa caché automáticamente
    }
    
    // Observar eventos de token expirado
    LaunchedEffect(fichadoViewModel) {
        fichadoViewModel.authStateManager.tokenExpiredEvent.collect { tokenExpiredTime ->
            if (tokenExpiredTime != null) {
                android.util.Log.d("HistorialScreen", "Token expirado detectado - Redirigiendo al login")
                onLogout()
            }
        }
    }
    
    // Procesar datos del historial para mostrar
    val registrosParaMostrar: List<RegistroMarcacion> = remember(historialFichados) {
        val listaFinal = mutableListOf<RegistroMarcacion>()
        
        for (fichado in historialFichados) {
            // Agregar entrada si existe
            if (fichado.horaEntrada != null) {
                listaFinal.add(
                    RegistroMarcacion(
                        fecha = fichado.fecha,
                        hora = fichado.horaEntrada,
                        tipo = "ENTRADA",
                        estado = "PUNTUAL" // TODO: Implementar lógica de tardanza
                    )
                )
            }
            
            // Agregar salida si existe
            if (fichado.horaSalida != null) {
                listaFinal.add(
                    RegistroMarcacion(
                        fecha = fichado.fecha,
                        hora = fichado.horaSalida,
                        tipo = "SALIDA",
                        estado = "PUNTUAL"
                    )
                )
            }
        }
        
        listaFinal
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
                    selected = false,
                    onClick = onNavigateToMarcaciones
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "Historial") },
                    label = { Text("Historial") },
                    selected = true,
                    onClick = { }
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
            // Header con información del usuario
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                shape = RoundedCornerShape(0.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Avatar del usuario
                    Card(
                        modifier = Modifier.size(32.dp),
                        shape = RoundedCornerShape(50),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    ) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = "Perfil",
                                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    // Información del usuario
                    Column {
                        Text(
                            text = currentUser?.nombreCompleto ?: "Usuario",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    
                    Spacer(modifier = Modifier.weight(1f))
                    
                    // Título de la pantalla
                    Text(
                        text = "Historial",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    // Botón de recarga
                    IconButton(
                        onClick = recargarHistorial,
                        modifier = Modifier.size(32.dp),
                        enabled = !uiState.isLoadingHistorial
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Recargar historial",
                            tint = if (uiState.isLoadingHistorial) 
                                MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                            else 
                                MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    
                    Spacer(modifier = Modifier.width(4.dp))
                    
                    // Menú de opciones
                    Box {
                        IconButton(
                            onClick = { showMenu = true },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Menu,
                                contentDescription = "Menú",
                                tint = MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Cerrar sesión") },
                                onClick = { 
                                    showMenu = false
                                    authViewModel?.logout()
                                    onLogout()
                                },
                                leadingIcon = {
                                    Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = null)
                                }
                            )
                        }
                    }
                }
            }
            
            // Contenido principal
            when {
                uiState.isLoadingHistorial -> {
                    // Estado de carga
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
                                text = "Cargando historial...",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
                
                uiState.errorMessage != null -> {
                    // Estado de error
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
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.EventNote,
                                contentDescription = "Error",
                                modifier = Modifier.size(80.dp),
                                tint = MaterialTheme.colorScheme.error.copy(alpha = 0.6f)
                            )
                            
                            Spacer(modifier = Modifier.height(24.dp))
                            
                            Text(
                                text = "Error al cargar historial",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.error,
                                textAlign = TextAlign.Center
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            Text(
                                text = uiState.errorMessage ?: "Error desconocido",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Button(
                                onClick = {
                                    fichadoViewModel.clearError()
                                    recargarHistorial()
                                }
                            ) {
                                Text("Reintentar")
                            }
                        }
                    }
                }
                
                registrosParaMostrar.isNotEmpty() -> {
                    // Lista de registros
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(vertical = 16.dp)
                    ) {
                        items(registrosParaMostrar) { registro ->
                            RegistroMarcacionItem(registro = registro)
                        }
                        
                        // Espacio adicional para la navegación inferior
                        item {
                            Spacer(modifier = Modifier.height(80.dp))
                        }
                    }
                }
                
                else -> {
                    // Estado vacío
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
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.EventNote,
                                contentDescription = "Sin registros",
                                modifier = Modifier.size(80.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                            )
                            
                            Spacer(modifier = Modifier.height(24.dp))
                            
                            Text(
                                text = "No hay registros disponibles",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            Text(
                                text = "Los registros de marcaciones aparecerán aquí",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
            
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
    }
}

/**
 * Componente para mostrar cada registro de marcación
 */
@Composable
fun RegistroMarcacionItem(registro: RegistroMarcacion) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Indicador de tipo (entrada/salida)
            Card(
                modifier = Modifier.size(8.dp),
                shape = RoundedCornerShape(50),
                colors = CardDefaults.cardColors(
                    containerColor = if (registro.tipo == "ENTRADA") Color(0xFF4CAF50) else Color(0xFF2196F3)
                )
            ) {
                Box(modifier = Modifier.fillMaxSize())
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Información principal
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = registro.tipo,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = registro.fecha,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Hora y estado
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = registro.hora,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = registro.estado,
                    fontSize = 11.sp,
                    color = if (registro.estado == "PUNTUAL") Color(0xFF4CAF50) else Color(0xFFF44336),
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}