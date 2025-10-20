package com.example.sistemadecalidad.ui.screens.haccp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.sistemadecalidad.data.api.Empleado
import com.example.sistemadecalidad.data.model.User
import com.example.sistemadecalidad.utils.TimeUtils
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FormularioPlaceholderScreen(
    titulo: String,
    descripcion: String,
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(titulo) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Volver")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = titulo,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = descripcion,
                style = MaterialTheme.typography.bodyLarge,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                color = androidx.compose.ui.graphics.Color.Gray
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LavadoManosScreen(
    haccpViewModel: com.example.sistemadecalidad.ui.viewmodel.HaccpViewModel,
    preferencesManager: com.example.sistemadecalidad.data.local.PreferencesManager,
    onNavigateBack: () -> Unit
) {
    // Estados para los campos del formulario - usando zona horaria de Perú
    val currentPeruDate = TimeUtils.getCurrentPeruDate()
    val peruCalendar = Calendar.getInstance(TimeUtils.getPeruTimeZone())
    peruCalendar.time = currentPeruDate
    
    var mes by remember { mutableStateOf(peruCalendar.get(Calendar.MONTH) + 1) }
    var anio by remember { mutableStateOf(peruCalendar.get(Calendar.YEAR)) }
    var areaEstacion by remember { mutableStateOf("COCINA") }
    var turno by remember { mutableStateOf("MAÑANA") }
    var procedimientoCorrecto by remember { mutableStateOf("C") } // C = Conforme, NC = No Conforme
    var accionesCorrectivas by remember { mutableStateOf("") }
    
    // Estados para el selector de supervisor
    var supervisorSeleccionado by remember { mutableStateOf<Empleado?>(null) }
    var expandedSupervisor by remember { mutableStateOf(false) }
    
    val uiState by haccpViewModel.uiState.collectAsState()
    val usuario by preferencesManager.getUser().collectAsState(initial = null)
    val supervisores by haccpViewModel.supervisores.collectAsState()
    
    var showSuccessDialog by remember { mutableStateOf(false) }
    
    val scrollState = rememberScrollState()
    
    // DEBUG: Agregar logs para depurar el problema del usuario
    LaunchedEffect(usuario) {
        android.util.Log.d("LavadoManosScreen", "=== DEBUG USUARIO ===")
        android.util.Log.d("LavadoManosScreen", "Usuario recibido: $usuario")
        usuario?.let { user ->
            android.util.Log.d("LavadoManosScreen", "ID: ${user.id}")
            android.util.Log.d("LavadoManosScreen", "Nombre: ${user.nombre}")
            android.util.Log.d("LavadoManosScreen", "Apellido: ${user.apellido}")
            android.util.Log.d("LavadoManosScreen", "NombreCompleto: ${user.nombreCompleto}")
            android.util.Log.d("LavadoManosScreen", "Cargo: ${user.cargo}")
            android.util.Log.d("LavadoManosScreen", "Area: ${user.area}")
            android.util.Log.d("LavadoManosScreen", "Email: ${user.email}")
            android.util.Log.d("LavadoManosScreen", "Rol: ${user.rol}")
        } ?: android.util.Log.d("LavadoManosScreen", "Usuario es NULL")
        android.util.Log.d("LavadoManosScreen", "===================")
    }
    
    // Cargar supervisores al iniciar
    LaunchedEffect(Unit) {
        haccpViewModel.cargarSupervisores()
    }
    
    // Validación del formulario
    val isFormValid = areaEstacion.isNotEmpty() && 
                     turno.isNotEmpty() &&
                     supervisorSeleccionado != null &&
                     // Si es NC, se requiere acciones correctivas
                     (procedimientoCorrecto == "C" || accionesCorrectivas.isNotEmpty())
    
    // Mostrar diálogo de éxito
    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            showSuccessDialog = true
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Lavado de Manos") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Volver")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Título
            Text(
                text = "REGISTRO HACCP CONTROL DE LAVADO Y DESINFECCIÓN DE MANOS",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Divider()
            
            // DATOS DEL EMPLEADO (automático del usuario logueado)
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("EMPLEADO QUE SE LAVA LAS MANOS", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                    Text("Nombre: ${usuario?.nombreCompleto ?: "..."}")
                    Text("Cargo: ${usuario?.cargo ?: "..."}")
                    Text("Fecha: ${TimeUtils.formatDateForDisplay(currentPeruDate)}")
                    Text("Hora: ${TimeUtils.formatTimeForDisplay(currentPeruDate)}")
                }
            }
            
            // DATOS DEL PERÍODO (Auto-generados)
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("DATOS DEL PERÍODO", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("MES: ${getMonthName(mes)}", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                        Text("AÑO: $anio", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                    }
                    Text("(Generado automáticamente)", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.7f))
                }
            }
            
            Divider()
            
            // ÁREA O ESTACIÓN
            Text("ÁREA O ESTACIÓN *", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = areaEstacion == "COCINA",
                    onClick = { areaEstacion = "COCINA" },
                    label = { Text("Cocina") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = areaEstacion == "SALON",
                    onClick = { areaEstacion = "SALON" },
                    label = { Text("Salón") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            Divider()
            
            // TURNO
            Text("TURNO *", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = turno == "MAÑANA",
                    onClick = { turno = "MAÑANA" },
                    label = { Text("☀️ Mañana") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = turno == "TARDE",
                    onClick = { turno = "TARDE" },
                    label = { Text("🌙 Tarde") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            Divider()
            
            // SUPERVISOR
            Text("SUPERVISOR *", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            Text(
                "Seleccione el supervisor que supervisa este turno",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            ExposedDropdownMenuBox(
                expanded = expandedSupervisor,
                onExpandedChange = { expandedSupervisor = !expandedSupervisor }
            ) {
                OutlinedTextField(
                    value = supervisorSeleccionado?.nombre ?: "",
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("Supervisor *") },
                    placeholder = { Text("Seleccione un supervisor") },
                    trailingIcon = {
                        Icon(
                            Icons.Default.KeyboardArrowDown,
                            contentDescription = null
                        )
                    },
                    modifier = Modifier.fillMaxWidth().menuAnchor(),
                    supportingText = { 
                        Text(
                            if (supervisores.isEmpty()) 
                                "Cargando supervisores..."
                            else 
                                "${supervisores.size} supervisores disponibles"
                        )
                    },
                    isError = supervisorSeleccionado == null
                )
                
                ExposedDropdownMenu(
                    expanded = expandedSupervisor,
                    onDismissRequest = { expandedSupervisor = false }
                ) {
                    if (supervisores.isEmpty()) {
                        DropdownMenuItem(
                            text = { Text("No hay supervisores disponibles", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant) },
                            onClick = { },
                            enabled = false
                        )
                    } else {
                        supervisores.forEach { supervisor ->
                            DropdownMenuItem(
                                text = { 
                                    Column {
                                        Text(
                                            supervisor.nombre,
                                            style = MaterialTheme.typography.bodyLarge,
                                            fontWeight = FontWeight.Medium
                                        )
                                        Text(
                                            supervisor.cargo ?: "Supervisor",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                },
                                onClick = {
                                    supervisorSeleccionado = supervisor
                                    expandedSupervisor = false
                                },
                                leadingIcon = if (supervisorSeleccionado?.id == supervisor.id) {
                                    { Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary) }
                                } else null
                            )
                        }
                    }
                }
            }
            
            Divider()
            
            // PROCEDIMIENTO DE LAVADO
            Text("PROCEDIMIENTO DE LAVADO DE MANOS", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            Text(
                "Evaluar si el personal siguió correctamente el procedimiento de lavado y desinfección de manos",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = if (procedimientoCorrecto == "C") 
                        MaterialTheme.colorScheme.primaryContainer 
                    else 
                        MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        "Seleccione la evaluación:",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        FilterChip(
                            selected = procedimientoCorrecto == "C",
                            onClick = { procedimientoCorrecto = "C" },
                            label = { 
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("✓ CONFORME", fontWeight = FontWeight.Bold)
                                    Text("Procedimiento correcto", style = MaterialTheme.typography.bodySmall)
                                }
                            },
                            modifier = Modifier.weight(1f),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFF4CAF50)
                            )
                        )
                        FilterChip(
                            selected = procedimientoCorrecto == "NC",
                            onClick = { procedimientoCorrecto = "NC" },
                            label = { 
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("✗ NO CONFORME", fontWeight = FontWeight.Bold)
                                    Text("Requiere repetir", style = MaterialTheme.typography.bodySmall)
                                }
                            },
                            modifier = Modifier.weight(1f),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFEF5350)
                            )
                        )
                    }
                }
            }
            
            Divider()
            
            // ACCIONES CORRECTIVAS
            Text("ACCIÓN CORRECTIVA", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            val requiereAcciones = procedimientoCorrecto == "NC"
            
            if (requiereAcciones) {
                Text(
                    "⚠️ Requerido: Se detectó un proceso NO CONFORME",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            OutlinedTextField(
                value = accionesCorrectivas,
                onValueChange = { accionesCorrectivas = it },
                label = { Text(if (requiereAcciones) "Descripción de acciones correctivas *" else "Descripción de acciones correctivas (opcional)") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                maxLines = 5,
                isError = requiereAcciones && accionesCorrectivas.isEmpty()
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Botón de registro
            Button(
                onClick = {
                    usuario?.let { user ->
                        haccpViewModel.registrarLavadoManos(
                            empleadoId = user.id,
                            area = areaEstacion,
                            turno = turno,
                            firma = user.nombreCompleto,
                            procedimientoCorrecto = procedimientoCorrecto,
                            accionCorrectiva = accionesCorrectivas.ifEmpty { null },
                            supervisorId = supervisorSeleccionado?.id
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = isFormValid && !uiState.isLoading
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text("Registrar Control de Lavado de Manos")
            }
            
            // Mostrar error si existe
            if (uiState.error != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Error: ${uiState.error}",
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
    }
    
    // Diálogo de éxito
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = {
                showSuccessDialog = false
                haccpViewModel.clearMessages()
                onNavigateBack()
            },
            title = { Text("✓ Registro Exitoso") },
            text = { Text(uiState.successMessage ?: "Control de lavado de manos registrado correctamente") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSuccessDialog = false
                        haccpViewModel.clearMessages()
                        onNavigateBack()
                    }
                ) {
                    Text("Aceptar")
                }
            }
        )
    }
}

/**
 * Función helper para obtener el nombre del mes
 */
private fun getMonthName(month: Int): String {
    return when(month) {
        1 -> "Enero"
        2 -> "Febrero"
        3 -> "Marzo"
        4 -> "Abril"
        5 -> "Mayo"
        6 -> "Junio"
        7 -> "Julio"
        8 -> "Agosto"
        9 -> "Septiembre"
        10 -> "Octubre"
        11 -> "Noviembre"
        12 -> "Diciembre"
        else -> month.toString()
    }
}
