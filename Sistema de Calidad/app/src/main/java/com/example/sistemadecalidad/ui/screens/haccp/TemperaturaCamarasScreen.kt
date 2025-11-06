package com.example.sistemadecalidad.ui.screens.haccp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.api.Camara
import com.example.sistemadecalidad.ui.viewmodel.HaccpViewModel
import com.example.sistemadecalidad.utils.TimeUtils
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TemperaturaCamarasScreen(
    haccpViewModel: HaccpViewModel,
    preferencesManager: PreferencesManager,
    onNavigateBack: () -> Unit
) {
    // Índice de la pestaña seleccionada
    var selectedCamara by remember { mutableStateOf(0) }

    // CONFIGURACIÓN ESTÁTICA: 3 CÁMARAS (2 Refrigeración + 1 Congelación)
    // Las cámaras están hardcodeadas en la app (no dependen de la base de datos)
    // Esto es correcto porque las cámaras físicas no cambian
    val camaras = remember {
        listOf(
            Camara(
                id = 1,
                nombre = "REFRIGERACIÓN 1",
                tipo = "REFRIGERACION",
                temperaturaMinima = 0.0,
                temperaturaMaxima = 4.0,
                ubicacion = "Área de almacenamiento principal"
            ),
            Camara(
                id = 2,
                nombre = "CONGELACIÓN 1",
                tipo = "CONGELACION",
                temperaturaMinima = -25.0,
                temperaturaMaxima = -18.0,
                ubicacion = "Área de congelados"
            ),
            Camara(
                id = 3,
                nombre = "REFRIGERACIÓN 2",
                tipo = "REFRIGERACION",
                temperaturaMinima = 0.0,
                temperaturaMaxima = 4.0,
                ubicacion = "Área de almacenamiento secundaria"
            )
        )
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Control de Temperatura de Cámaras") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver")
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
    camara: Camara,
    haccpViewModel: HaccpViewModel,
    preferencesManager: PreferencesManager
) {
    val currentPeruDate = TimeUtils.getCurrentPeruDate()
    val peruCalendar = Calendar.getInstance(TimeUtils.getPeruTimeZone())
    peruCalendar.time = currentPeruDate
    val mes = peruCalendar.get(Calendar.MONTH) + 1
    val anio = peruCalendar.get(Calendar.YEAR)
    val dia = peruCalendar.get(Calendar.DAY_OF_MONTH)
    val horaActual = peruCalendar.get(Calendar.HOUR_OF_DAY)
    
    // Detectar turno automáticamente (mañana: 00:00-12:00, tarde: 12:00-00:00)
    val turnoActual = if (horaActual < 12) "mañana" else "tarde"
    // Mapeo para backend: el backend espera "manana" (sin ñ) o "tarde"
    val turnoParam = if (turnoActual == "mañana") "manana" else "tarde"
    val horaDisplay = if (turnoActual == "mañana") "08:00" else "16:00"
    
    // Obtener usuario logueado
    val usuario by preferencesManager.getUser().collectAsState(initial = null)
    
    // Estado de verificación de registro existente
    var verificacionRealizada by remember { mutableStateOf(false) }
    var registroExistente by remember { mutableStateOf(false) }
    var mensajeRegistroExistente by remember { mutableStateOf<String?>(null) }
    
    // Verificar si ya existe un registro para esta cámara y turno hoy
    // Usar turnoParam para evitar error de parámetro inválido en backend
    LaunchedEffect(camara.id, turnoParam) {
        haccpViewModel.verificarRegistroTemperaturaCamara(
            camaraId = camara.id,
            turno = turnoParam
        ) { existe, mensaje ->
            verificacionRealizada = true
            registroExistente = existe
            mensajeRegistroExistente = mensaje
        }
    }
    
    // Generar lista de temperaturas según tipo de cámara
    // Incrementos de 0.1°C para ambos tipos
    val temperaturasDisponibles = remember(camara) {
        val min = (camara.temperaturaMinima * 10).toInt()
        val max = (camara.temperaturaMaxima * 10).toInt()
        (min..max).map { it / 10.0 }
    }
    
    // Estado para la temperatura del turno actual
    var temperatura by remember { mutableStateOf<Double?>(null) }
    var accionesCorrectivas by remember { mutableStateOf("") }
    
    // Dropdown expandido
    var expandedTemperatura by remember { mutableStateOf(false) }
    
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
    val isFormValid = temperatura != null &&
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
        
        HorizontalDivider()
        
        // Mostrar mensaje si ya existe un registro
        if (verificacionRealizada && registroExistente && mensajeRegistroExistente != null) {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "⚠️ REGISTRO YA REALIZADO PARA ESTE TURNO",
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
                        text = "No se puede realizar un nuevo registro para esta cámara en el turno ${turnoActual} hoy.",
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
                Text("TURNO: ${turnoActual.uppercase()}", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.primary)
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
                        "Rango de temperatura: ${camara.temperaturaMinima}°C a ${camara.temperaturaMaxima}°C"
                    else 
                        "Rango de temperatura: < ${camara.temperaturaMaxima}°C",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium
                )
                Text("Nº de la cámara: ${camara.nombre}", style = MaterialTheme.typography.bodySmall)
            }
        }
        
        HorizontalDivider()
        
        // TURNO ACTUAL
        Text("TURNO ${turnoActual.uppercase()}", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        
        Card {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("HORA: $horaDisplay", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                
                // Dropdown para temperatura
                ExposedDropdownMenuBox(
                    expanded = expandedTemperatura,
                    onExpandedChange = { expandedTemperatura = !expandedTemperatura }
                ) {
                    OutlinedTextField(
                        value = temperatura?.toString() ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("TEMPERATURA (°C) *") },
                        placeholder = { Text("Seleccionar temperatura") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedTemperatura) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable, enabled = true),
                        supportingText = {
                            Text(
                                if (camara.tipo == "REFRIGERACION")
                                    "Rango permitido: ${camara.temperaturaMinima}°C a ${camara.temperaturaMaxima}°C (variación 0.1°C)"
                                else
                                    "Debe ser menor a ${camara.temperaturaMaxima}°C (variación 0.1°C)"
                            )
                        }
                    )
                    ExposedDropdownMenu(
                        expanded = expandedTemperatura,
                        onDismissRequest = { expandedTemperatura = false }
                    ) {
                        temperaturasDisponibles.forEach { temp ->
                            DropdownMenuItem(
                                text = { Text("$temp°C") },
                                onClick = {
                                    temperatura = temp
                                    expandedTemperatura = false
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
        
        HorizontalDivider()
        
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
        
        HorizontalDivider()
        
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
        
        HorizontalDivider()
        
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
                if (temperatura != null) {
                    val fecha = "$anio-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}"
                    
                    haccpViewModel.registrarTemperaturaCamaras(
                        camaraId = camara.id,
                        fecha = fecha,
                        // Enviar turno normalizado al backend ("manana"/"tarde")
                        turno = turnoParam,
                        temperatura = temperatura!!,
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
            Text("Registrar Control de Temperatura - Turno ${turnoActual.uppercase()}")
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
                Text(uiState.successMessage ?: "Control de temperatura registrado correctamente para el turno ${turnoActual}")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSuccessDialog = false
                        haccpViewModel.clearMessages()
                        // Recargar la verificación para actualizar el estado
                        haccpViewModel.verificarRegistroTemperaturaCamara(
                            camaraId = camara.id,
                            // Usar turnoParam para mantener consistencia con backend
                            turno = turnoParam
                        ) { _, _ ->
                            // La verificación se actualizará automáticamente por el LaunchedEffect
                        }
                    }
                ) {
                    Text("Aceptar")
                }
            }
        )
    }
}

// Eliminado CamaraInfo: ahora usamos el modelo Camara cargado desde el backend,
// asegurando IDs y rangos correctos según la tabla camaras_frigorificas.

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
