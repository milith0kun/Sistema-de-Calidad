package com.example.sistemadecalidad.ui.screens.historial

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.ExitToApp

import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
// import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.sistemadecalidad.ui.viewmodel.FichadoViewModel
import com.example.sistemadecalidad.ui.viewmodel.AuthViewModel
import com.example.sistemadecalidad.utils.TimeUtils
import java.text.SimpleDateFormat
import java.util.*

/**
 * Modelo de datos para el historial de marcaciones según especificaciones
 */
data class RegistroMarcacion(
    val fecha: String,
    val hora: String,
    val tipo: String, // "ENTRADA" o "SALIDA"
    val estado: String // "PUNTUAL" o "TARDANZA"
)

/**
 * Pantalla de historial que replica exactamente el diseño de d2 Móvil
 * Implementa diseño según especificaciones:
 * - Header con foto de perfil, nombre y menú hamburguesa
 * - Lista de registros con icono verde, fecha, hora, tipo y estado
 * - Estado vacío cuando no hay registros
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistorialScreen(
    fichadoViewModel: FichadoViewModel, // = hiltViewModel()
    authViewModel: AuthViewModel? = null,
    onNavigateToDashboard: () -> Unit = {},
    onNavigateToMarcaciones: () -> Unit = {},
    onNavigateToHaccp: () -> Unit = {},
    onLogout: () -> Unit = {}
) {
    var showMenu by remember { mutableStateOf(false) }
    
    // Observar estados
    val historialFichados by fichadoViewModel.historial.collectAsStateWithLifecycle()
    val currentUser by (authViewModel?.currentUser?.collectAsStateWithLifecycle() ?: remember { mutableStateOf(null) })
    
    // Inicializar datos al cargar la pantalla
    LaunchedEffect(Unit) {
        fichadoViewModel.obtenerHistorial()
    }
    
    // Convertir los registros del backend al formato de visualización
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
                    onClick = { /* Ya estamos en Historial */ }
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
        // Header según especificaciones exactas
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            shape = RoundedCornerShape(0.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Foto de perfil circular (icono de persona)
                Card(
                    modifier = Modifier.size(40.dp),
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
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                // Información del usuario
                Column {
                    Text(
                        text = "Bienvenido",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = currentUser?.nombre ?: "Usuario",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
                
                Spacer(modifier = Modifier.weight(1f))
                
                // Título "Historial"
                Text(
                    text = "Historial",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Spacer(modifier = Modifier.width(16.dp))
                
                // Menú hamburguesa en esquina superior
                Box {
                    IconButton(
                        onClick = { showMenu = true }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "Menú",
                            tint = MaterialTheme.colorScheme.onSurface
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
                                Icon(Icons.Default.ExitToApp, contentDescription = null)
                            }
                        )
                    }
                }
            }
        }
        
        // Contenido principal - Lista de registros o estado vacío
        if (registrosParaMostrar.isNotEmpty()) {
            // Lista de registros según especificaciones
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
        } else {
            // Estado vacío - pantalla limpia sin elementos
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
                    // Icono de información gris grande
                    Icon(
                        imageVector = Icons.Default.EventNote,
                        contentDescription = "Sin registros",
                        modifier = Modifier.size(80.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Texto principal
                    Text(
                        text = "No hay registros disponibles",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Texto secundario
                    Text(
                        text = "Los registros de marcaciones aparecerán aquí",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                        textAlign = TextAlign.Center
                    )
                }
            }
        } // Cierre de if-else
        } // Cierre de Column
    } // Cierre de Scaffold
} // Cierre de HistorialScreen

/**
 * Componente para mostrar cada registro de marcación según especificaciones exactas
 * - Icono verde de persona (lado izquierdo)
 * - Fecha: 2025-09-15 (formato año-mes-día)
 * - Hora: 07:57:57 (formato completo)
 * - Tipo: CONCEPTO / ENTRADA o SALIDA
 * - Estado: CLASIFICACIÓN / PUNTUAL o TARDANZA
 */
@Composable
fun RegistroMarcacionItem(registro: RegistroMarcacion) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icono verde de persona (lado izquierdo)
            Card(
                modifier = Modifier.size(40.dp),
                shape = RoundedCornerShape(50),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF4CAF50) // Verde según especificaciones
                )
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Registro",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Información del registro
            Column(
                modifier = Modifier.weight(1f)
            ) {
                // Fecha: 2025-09-15 (formato año-mes-día)
                Text(
                    text = registro.fecha,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                // Hora: 07:57:57 (formato completo) - Formatear usando TimeUtils
                val horaFormateada = try {
                    val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
                    val date = sdf.parse(registro.hora)
                    if (date != null) TimeUtils.formatTimeForDisplay(date) else registro.hora
                } catch (e: Exception) {
                    registro.hora // Fallback al valor original si hay error
                }
                Text(
                    text = horaFormateada,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Tipo: CONCEPTO / ENTRADA o SALIDA
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "CONCEPTO",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = " / ",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = registro.tipo,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                
                // Estado: CLASIFICACIÓN / PUNTUAL o TARDANZA
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "CLASIFICACIÓN",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = " / ",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = registro.estado,
                        fontSize = 12.sp,
                        color = if (registro.estado == "PUNTUAL") Color(0xFF4CAF50) else Color(0xFFF44336),
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}