package com.example.sistemadecalidad.ui.screens.haccp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.ui.viewmodel.HaccpViewModel
import com.example.sistemadecalidad.utils.TimeUtils
import java.util.Calendar
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TemperaturaCamarasScreen(
    haccpViewModel: HaccpViewModel,
    preferencesManager: PreferencesManager,
    onNavigateBack: () -> Unit
) {
    var selectedCamara by remember { mutableStateOf(0) } // 0 = Ref 1, 1 = Ref 2, 2 = Cong 1
    
    val camaras = listOf(
        CamaraInfo(1, "REFRIGERACIÓN 1", "REFRIGERACION", 2.0, 8.0),
        CamaraInfo(2, "CONGELACIÓN 1", "CONGELACION", -18.0, -15.0),
        CamaraInfo(4, "REFRIGERACIÓN 2", "REFRIGERACION", 1.0, 6.0)
    )
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Control de Temperatura de Cámaras") },
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
        ) {
            // Tabs para seleccionar cámara
            TabRow(selectedTabIndex = selectedCamara) {
                camaras.forEachIndexed { index, camara ->
                    Tab(
                        selected = selectedCamara == index,
                        onClick = { selectedCamara = index },
                        text = { Text(camara.nombre) }
                    )
                }
            }
            
            // Formulario de la cámara seleccionada
            CamaraFormulario(
                camara = camaras[selectedCamara],
                haccpViewModel = haccpViewModel,
                preferencesManager = preferencesManager
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CamaraFormulario(
    camara: CamaraInfo,
    haccpViewModel: HaccpViewModel,
    preferencesManager: PreferencesManager
) {
    val currentPeruDate = TimeUtils.getCurrentPeruDate()
    val peruCalendar = Calendar.getInstance(TimeUtils.getPeruTimeZone())
    peruCalendar.time = currentPeruDate
    val mes = peruCalendar.get(Calendar.MONTH) + 1
    val anio = peruCalendar.get(Calendar.YEAR)
    val dia = peruCalendar.get(Calendar.DAY_OF_MONTH)
    
    // Obtener usuario logueado
    val usuario by preferencesManager.getUser().collectAsState(initial = null)
    
    // Estados para la verificación de registro existente
    var registroExistente by remember { mutableStateOf(false) }
    var mensajeRegistroExistente by remember { mutableStateOf<String?>(null) }
    var verificacionRealizada by remember { mutableStateOf(false) }
    
    // Verificar si ya existe un registro para esta cámara hoy
    LaunchedEffect(camara.id) {
        haccpViewModel.verificarRegistroTemperaturaCamara(camara.id) { existe, mensaje ->
            registroExistente = existe
            mensajeRegistroExistente = mensaje
            verificacionRealizada = true
        }
    }
    
    // Generar lista de temperaturas según tipo de cámara
    val temperaturasDisponibles = remember(camara) {
        if (camara.tipo == "REFRIGERACION") {
            // Para refrigeración: 1°C a 4°C con incrementos de 0.1°C (más correlativo)
            val min = (camara.tempMin * 10).toInt()
            val max = (camara.tempMax * 10).toInt()
            (min..max).map { it / 10.0 }
        } else {
            // Para congelación: -25°C a -18°C con incrementos de 0.1°C
            val min = (-25.0 * 10).toInt()
            val max = (-18.0 * 10).toInt()
            (min..max).map { it / 10.0 }
        }
    }
    
    var temperaturaManana by remember { mutableStateOf<Double?>(null) }
    var temperaturaTarde by remember { mutableStateOf<Double?>(null) }
    var accionesCorrectivas by remember { mutableStateOf("") }
    
    // Dropdowns expandidos
    var expandedManana by remember { mutableStateOf(false) }
    var expandedTarde by remember { mutableStateOf(false) }
    
    // Responsable y supervisor auto-generados desde usuario logueado
    val responsable = remember(usuario) {
        usuario?.let { "${it.nombre} - ${it.cargo}" } ?: ""
    }
    val supervisor = remember(usuario) {
        usuario?.nombre ?: ""
    }
    
    val uiState by haccpViewModel.uiState.collectAsState()
    var showSuccessDialog by remember { mutableStateOf(false) }
    
    // Validación
    val isFormValid = temperaturaManana != null &&
            temperaturaTarde != null &&
            responsable.isNotEmpty() &&
            supervisor.isNotEmpty()
    
    // Mostrar diálogo de éxito
    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            showSuccessDialog = true
        }
    }
    
    // Resetear el estado de éxito cuando se muestre el diálogo
    LaunchedEffect(uiState.isFormSuccess) {
        if (uiState.isFormSuccess) {
            haccpViewModel.resetFormSuccess()
        }
    }
    
    val scrollState = rememberScrollState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(scrollState),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Título
        Text(
            text = "REGISTRO HACCP CONTROL DE TEMPERATURA ${if (camara.tipo == "REFRIGERACION") "DE REFRIGERACIÓN" else "DE CONGELACIÓN"} - ${camara.nombre}",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        
        Divider()
        
        // Mostrar mensaje si ya existe un registro
        if (verificacionRealizada && registroExistente && mensajeRegistroExistente != null) {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "⚠️ REGISTRO YA REALIZADO",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = mensajeRegistroExistente!!,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "No se puede realizar un nuevo registro para esta cámara hoy.",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }
        
        // Solo mostrar el formulario si no existe un registro
        if (!registroExistente) {
        
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
                Text("DÍA: $dia", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                Text("(Generado automáticamente)", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.7f))
            }
        }
        
        // PARÁMETROS DE CONTROL
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("PARÁMETROS DE CONTROL", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                Text("Frecuencia: Todos los días, dos veces al día", style = MaterialTheme.typography.bodySmall)
                Text(
                    text = if (camara.tipo == "REFRIGERACION") 
                        "Rango de temperatura: ${camara.tempMin}°C a ${camara.tempMax}°C"
                    else 
                        "Rango de temperatura: < ${camara.tempMax}°C",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium
                )
                Text("Nº de la cámara: ${camara.nombre}", style = MaterialTheme.typography.bodySmall)
            }
        }
        
        Divider()
        
        // TURNO MAÑANA
        Text("TURNO MAÑANA", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
        
        Card {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("HORA: 08:00", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                
                // Dropdown para temperatura
                ExposedDropdownMenuBox(
                    expanded = expandedManana,
                    onExpandedChange = { expandedManana = !expandedManana }
                ) {
                    OutlinedTextField(
                        value = temperaturaManana?.toString() ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("TEMPERATURA (°C) *") },
                        placeholder = { Text("Seleccionar temperatura") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedManana) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                        supportingText = { 
                            Text(
                                if (camara.tipo == "REFRIGERACION") 
                                    "Rango permitido: ${camara.tempMin}°C a ${camara.tempMax}°C"
                                else 
                                    "Debe ser menor a ${camara.tempMax}°C"
                            ) 
                        }
                    )
                    ExposedDropdownMenu(
                        expanded = expandedManana,
                        onDismissRequest = { expandedManana = false }
                    ) {
                        temperaturasDisponibles.forEach { temp ->
                            DropdownMenuItem(
                                text = { Text("$temp°C") },
                                onClick = {
                                    temperaturaManana = temp
                                    expandedManana = false
                                }
                            )
                        }
                    }
                }
                
                // Responsable auto-generado
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            "RESPONSABLE DEL CONTROL",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            responsable.ifEmpty { "(Usuario no identificado)" },
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            "(Generado automáticamente)",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
        
        Divider()
        
        // TURNO TARDE
        Text("TURNO TARDE", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
        
        Card {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("HORA: 16:00", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                
                // Dropdown para temperatura
                ExposedDropdownMenuBox(
                    expanded = expandedTarde,
                    onExpandedChange = { expandedTarde = !expandedTarde }
                ) {
                    OutlinedTextField(
                        value = temperaturaTarde?.toString() ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("TEMPERATURA (°C) *") },
                        placeholder = { Text("Seleccionar temperatura") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedTarde) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                        supportingText = { 
                            Text(
                                if (camara.tipo == "REFRIGERACION") 
                                    "Rango permitido: ${camara.tempMin}°C a ${camara.tempMax}°C"
                                else 
                                    "Debe ser menor a ${camara.tempMax}°C"
                            ) 
                        }
                    )
                    ExposedDropdownMenu(
                        expanded = expandedTarde,
                        onDismissRequest = { expandedTarde = false }
                    ) {
                        temperaturasDisponibles.forEach { temp ->
                            DropdownMenuItem(
                                text = { Text("$temp°C") },
                                onClick = {
                                    temperaturaTarde = temp
                                    expandedTarde = false
                                }
                            )
                        }
                    }
                }
                
                // Responsable auto-generado
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            "RESPONSABLE DEL CONTROL",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            responsable.ifEmpty { "(Usuario no identificado)" },
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            "(Generado automáticamente)",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
        
        Divider()
        
        // ACCIONES CORRECTIVAS
        Text("ACCIONES CORRECTIVAS ESTÁNDAR", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
        
        OutlinedTextField(
            value = accionesCorrectivas,
            onValueChange = { accionesCorrectivas = it },
            label = { Text("Descripción") },
            placeholder = { Text("Llenar con una descripción si hubo alguna NC") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            maxLines = 5
        )
        
        Divider()
        
        // SUPERVISOR
        Text("SUPERVISOR", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
        
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    "SUPERVISOR RESPONSABLE",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Text(
                    supervisor.ifEmpty { "(Usuario no identificado)" },
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
                usuario?.let {
                    Text(
                        "Cargo: ${it.cargo}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Text(
                        "Área: ${it.area}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
                Text(
                    "(Generado automáticamente)",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                )
            }
        }
        
        Divider()
        
        // SIGNIFICADO
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("SIGNIFICADO", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                Text("C = CONFORME: Temperatura correcta", style = MaterialTheme.typography.bodySmall)
                Text("NC = NO CONFORME: Temperatura fuera de rango, requiere acción inmediata", style = MaterialTheme.typography.bodySmall)
            }
        }
        
        // Botón de registro
        Button(
            onClick = {
                if (temperaturaManana != null && temperaturaTarde != null) {
                    val fecha = "$anio-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}"
                    
                    haccpViewModel.registrarTemperaturaCamaras(
                        camaraId = camara.id,
                        fecha = fecha,
                        temperaturaManana = temperaturaManana,
                        temperaturaTarde = temperaturaTarde,
                        accionesCorrectivas = accionesCorrectivas.ifEmpty { null }
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
            Text("Registrar Control de Temperatura")
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
        
        } // Cierre del if (!registroExistente)
    }
    
    // Diálogo de éxito
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { 
                showSuccessDialog = false
                haccpViewModel.clearMessages()
            },
            title = { Text("✅ Registro Exitoso") },
            text = { 
                Text(uiState.successMessage ?: "Control de temperatura registrado correctamente")
            },
            confirmButton = {
                TextButton(
                    onClick = { 
                        showSuccessDialog = false
                        haccpViewModel.clearMessages()
                        // Recargar la verificación para actualizar el estado
                        haccpViewModel.verificarRegistroTemperaturaCamara(camara.id) { existe, mensaje ->
                            // La verificación se actualizará automáticamente por el LaunchedEffect
                        }
                    }
                ) {
                    Text("Aceptar")
                }
            }
        )
    }
    
    // Diálogo de éxito
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = {
                showSuccessDialog = false
                haccpViewModel.clearMessages()
            },
            title = { Text("✓ Registro Exitoso") },
            text = { Text(uiState.successMessage ?: "Control de temperatura registrado correctamente") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSuccessDialog = false
                        haccpViewModel.clearMessages()
                    }
                ) {
                    Text("Aceptar")
                }
            }
        )
    }
}

/**
 * Data class para información de cámara
 */
private data class CamaraInfo(
    val id: Int,
    val nombre: String,
    val tipo: String, // REFRIGERACION, CONGELACION
    val tempMin: Double,
    val tempMax: Double
)

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
