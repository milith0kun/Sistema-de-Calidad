package com.example.sistemadecalidad.ui.screens.haccp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.sistemadecalidad.data.api.Empleado
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.ui.viewmodel.HaccpViewModel
import com.example.sistemadecalidad.utils.TimeUtils
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecepcionAbarrotesScreen(
    haccpViewModel: HaccpViewModel,
    preferencesManager: PreferencesManager,
    onNavigateBack: () -> Unit
) {
    val currentPeruDate = TimeUtils.getCurrentPeruDate()
    val peruCalendar = Calendar.getInstance(TimeUtils.getPeruTimeZone())
    peruCalendar.time = currentPeruDate
    val mes = peruCalendar.get(Calendar.MONTH) + 1
    val anio = peruCalendar.get(Calendar.YEAR)
    val fecha = SimpleDateFormat("dd/MM/yyyy", Locale.Builder().setLanguage("es").setRegion("PE").build()).apply {
        timeZone = TimeUtils.getPeruTimeZone()
    }.format(currentPeruDate)
    val hora = TimeUtils.formatTimeForDisplay(currentPeruDate)
    
    // Obtener usuario logueado
    val usuario by preferencesManager.getUser().collectAsState(initial = null)
    
    // Cargar supervisores activos
    val supervisores by haccpViewModel.supervisores.collectAsState()
    
    LaunchedEffect(Unit) {
        haccpViewModel.cargarSupervisores()
    }
    
    // Estados del formulario
    var nombreProveedor by remember { mutableStateOf("") }
    var nombreProducto by remember { mutableStateOf("") }
    var cantidadSolicitada by remember { mutableStateOf("") }
    
    // Verificaciones sanitarias
    var registroSanitarioVigente by remember { mutableStateOf(true) }
    
    // Evaluación de vencimiento
    var evaluacionVencimiento by remember { mutableStateOf("Excelente") } // Excelente, Regular, Pésimo
    
    // Conformidad empaque
    var conformidadEmpaque by remember { mutableStateOf("Excelente") } // Excelente, Regular, Pésimo
    
    // Verificaciones C/NC
    var uniformeCompleto by remember { mutableStateOf<Boolean?>(null) }
    var transporteAdecuado by remember { mutableStateOf<Boolean?>(null) }
    var puntualidad by remember { mutableStateOf<Boolean?>(null) }
    
    // Campos finales
    var observaciones by remember { mutableStateOf("") }
    var accionCorrectiva by remember { mutableStateOf("") }
    var supervisorSeleccionado by remember { mutableStateOf<Empleado?>(null) }
    var expandedSupervisor by remember { mutableStateOf(false) }
    
    val uiState by haccpViewModel.uiState.collectAsState()
    var showSuccessDialog by remember { mutableStateOf(false) }
    
    // Responsable del registro = usuario logueado
    val responsableRegistro = remember(usuario) {
        usuario?.let { "${it.nombre} - ${it.cargo}" } ?: ""
    }
    
    // Validación
    val isFormValid = nombreProveedor.isNotEmpty() &&
            nombreProducto.isNotEmpty() &&
            cantidadSolicitada.isNotEmpty() &&
            uniformeCompleto != null &&
            transporteAdecuado != null &&
            puntualidad != null &&
            supervisorSeleccionado != null &&
            responsableRegistro.isNotEmpty()
    
    // Mostrar diálogo de éxito
    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            showSuccessDialog = true
        }
    }
    
    val scrollState = rememberScrollState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Recepción de Abarrotes") },
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
                .padding(16.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Título
            Text(
                text = "REGISTRO HACCP CONTROL DE CALIDAD DE RECEPCIÓN DE MERCADERÍA DE ABARROTES EN GENERAL",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            HorizontalDivider()
            
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
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("FECHA: $fecha", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                        Text("HORA: $hora", style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                    }
                    Text("(Generado automáticamente)", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.7f))
                }
            }
            
            // DATOS DEL PROVEEDOR Y PRODUCTO
            Text("DATOS DEL PROVEEDOR Y PRODUCTO", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            OutlinedTextField(
                value = nombreProveedor,
                onValueChange = { nombreProveedor = it },
                label = { Text("NOMBRE DEL PROVEEDOR *") },
                placeholder = { Text("Escribir el nombre completo de la empresa o persona") },
                modifier = Modifier.fillMaxWidth(),
                supportingText = { Text("Ejemplo: Proveedores S.A.C.") }
            )
            
            OutlinedTextField(
                value = nombreProducto,
                onValueChange = { nombreProducto = it },
                label = { Text("NOMBRE DEL PRODUCTO *") },
                placeholder = { Text("Escribir el tipo de abarrote") },
                modifier = Modifier.fillMaxWidth(),
                supportingText = { Text("Ejemplo: Arroz, Aceite, Conservas, Fideos") }
            )
            
            OutlinedTextField(
                value = cantidadSolicitada,
                onValueChange = { cantidadSolicitada = it },
                label = { Text("CANTIDAD SOLICITADA - PESO O UNIDAD *") },
                placeholder = { Text("Anotar lo que realmente llegó") },
                modifier = Modifier.fillMaxWidth(),
                supportingText = { Text("Ejemplo: 50 kg, 24 latas, 12 paquetes, 500 gramos") }
            )
            
            HorizontalDivider()
            
            // VERIFICACIONES SANITARIAS
            Text("VERIFICACIONES SANITARIAS", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            // Registro Sanitario
            Card {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("VIGENCIA DE REGISTRO SANITARIO", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = registroSanitarioVigente,
                            onClick = { registroSanitarioVigente = true },
                            label = { Text("✓ Registro sanitario vigente") },
                            modifier = Modifier.weight(1f)
                        )
                        FilterChip(
                            selected = !registroSanitarioVigente,
                            onClick = { registroSanitarioVigente = false },
                            label = { Text("✗ Registro sanitario vencido") },
                            modifier = Modifier.weight(1f),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        )
                    }
                }
            }
            
            // Evaluación de Vencimiento
            Card {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("EVALUACIÓN DE FECHA DE VENCIMIENTO", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = evaluacionVencimiento == "Excelente",
                            onClick = { evaluacionVencimiento = "Excelente" },
                            label = { Text("Excelente: Vencimiento mayor a 6 meses") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFF4CAF50)
                            )
                        )
                        FilterChip(
                            selected = evaluacionVencimiento == "Regular",
                            onClick = { evaluacionVencimiento = "Regular" },
                            label = { Text("Regular: Vencimiento entre 1-6 meses") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFFFA726)
                            )
                        )
                        FilterChip(
                            selected = evaluacionVencimiento == "Pésimo",
                            onClick = { evaluacionVencimiento = "Pésimo" },
                            label = { Text("Pésimo: Vencimiento menor a 1 mes") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        )
                    }
                }
            }
            
            // Conformidad del Empaque
            Card {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("CONFORMIDAD E INTEGRIDAD DEL EMPAQUE PRIMARIO", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = conformidadEmpaque == "Excelente",
                            onClick = { conformidadEmpaque = "Excelente" },
                            label = { Text("Excelente") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFF4CAF50)
                            )
                        )
                        FilterChip(
                            selected = conformidadEmpaque == "Regular",
                            onClick = { conformidadEmpaque = "Regular" },
                            label = { Text("Regular") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFFFFA726)
                            )
                        )
                        FilterChip(
                            selected = conformidadEmpaque == "Pésimo",
                            onClick = { conformidadEmpaque = "Pésimo" },
                            label = { Text("Pésimo") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        )
                    }
                }
            }
            
            HorizontalDivider()
            
            // VERIFICACIONES C/NC
            Text("VERIFICACIONES C/NC", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            // Uniforme Completo
            Card {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("UNIFORME COMPLETO", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = uniformeCompleto == true,
                            onClick = { uniformeCompleto = true },
                            label = { Text("C - CONFORME") },
                            modifier = Modifier.weight(1f),
                            leadingIcon = if (uniformeCompleto == true) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
                            } else null
                        )
                        FilterChip(
                            selected = uniformeCompleto == false,
                            onClick = { uniformeCompleto = false },
                            label = { Text("NC - NO CONFORME") },
                            modifier = Modifier.weight(1f),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        )
                    }
                }
            }
            
            // Transporte Adecuado
            Card {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("TRANSPORTE ADECUADO", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = transporteAdecuado == true,
                            onClick = { transporteAdecuado = true },
                            label = { Text("C - CONFORME") },
                            modifier = Modifier.weight(1f),
                            leadingIcon = if (transporteAdecuado == true) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
                            } else null
                        )
                        FilterChip(
                            selected = transporteAdecuado == false,
                            onClick = { transporteAdecuado = false },
                            label = { Text("NC - NO CONFORME") },
                            modifier = Modifier.weight(1f),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        )
                    }
                }
            }
            
            // Puntualidad
            Card {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("PUNTUALIDAD", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                    
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = puntualidad == true,
                            onClick = { puntualidad = true },
                            label = { Text("C - CONFORME") },
                            modifier = Modifier.weight(1f),
                            leadingIcon = if (puntualidad == true) {
                                { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp)) }
                            } else null
                        )
                        FilterChip(
                            selected = puntualidad == false,
                            onClick = { puntualidad = false },
                            label = { Text("NC - NO CONFORME") },
                            modifier = Modifier.weight(1f),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        )
                    }
                }
            }
            
            HorizontalDivider()
            
            // RESPONSABLES
            Text("RESPONSABLES", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            // Responsable del Registro (Auto-generado)
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "RESPONSABLE DEL REGISTRO",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Text(
                        responsableRegistro.ifEmpty { "(Usuario no identificado)" },
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
                        "(Quien llena el formato - Generado automáticamente)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                    )
                }
            }
            
            // Observaciones
            OutlinedTextField(
                value = observaciones,
                onValueChange = { observaciones = it },
                label = { Text("OBSERVACIONES") },
                placeholder = { Text("Anotar cualquier detalle importante o problema encontrado") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                maxLines = 5,
                supportingText = { Text("Ejemplo: productos próximos a vencer, empaques con defectos leves") }
            )
            
            // Acción Correctiva
            OutlinedTextField(
                value = accionCorrectiva,
                onValueChange = { accionCorrectiva = it },
                label = { Text("ACCIÓN CORRECTIVA") },
                placeholder = { Text("Escribir qué se hizo si algo salió mal") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                maxLines = 5,
                supportingText = { Text("Ejemplo: se rechazó el producto, se separaron unidades dañadas, se comunicó al proveedor") }
            )
            
            // Supervisor del Turno (Selección de lista)
            Text("SUPERVISOR DEL TURNO", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            ExposedDropdownMenuBox(
                expanded = expandedSupervisor,
                onExpandedChange = { expandedSupervisor = !expandedSupervisor }
            ) {
                OutlinedTextField(
                    value = supervisorSeleccionado?.let { "${it.nombre} - ${it.rol ?: "Supervisor"}" } ?: "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("RESPONSABLE DE LA SUPERVISIÓN (SUPERVISOR DEL TURNO) *") },
                    placeholder = { Text("Seleccionar supervisor del turno") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedSupervisor) },
                    modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable, true),
                    supportingText = { 
                        Text(
                            if (supervisores.isEmpty()) 
                                "Cargando supervisores..."
                            else 
                                "${supervisores.size} supervisores activos disponibles. El supervisor es quien supervisa el turno."
                        )
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        disabledTextColor = MaterialTheme.colorScheme.onSurface,
                        disabledBorderColor = MaterialTheme.colorScheme.outline,
                        disabledPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        disabledLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        disabledTrailingIconColor = MaterialTheme.colorScheme.onSurfaceVariant
                    )
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
                                            supervisor.rol ?: "Supervisor",
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
            
            HorizontalDivider()
            
            // SIGNIFICADO
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("SIGNIFICADO", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                    Text("C = CONFORME: Todo está bien", style = MaterialTheme.typography.bodySmall)
                    Text("NC = NO CONFORME: Hay un problema que necesita corrección", style = MaterialTheme.typography.bodySmall)
                }
            }
            
            // Mensajes de error
            if (uiState.error != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                ) {
                    Text(
                        text = uiState.error!!,
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
            
            // Botón de registro
            Button(
                onClick = {
                    // Convertir Boolean? a String C/NC
                    val uniformeCStr = if (uniformeCompleto == true) "C" else "NC"
                    val transporteStr = if (transporteAdecuado == true) "C" else "NC"
                    val puntualidadStr = if (puntualidad == true) "C" else "NC"
                    
                    haccpViewModel.registrarRecepcionAbarrotes(
                        mes = mes,
                        anio = anio,
                        fecha = fecha,
                        hora = hora,
                        nombreProveedor = nombreProveedor,
                        nombreProducto = nombreProducto,
                        cantidadSolicitada = cantidadSolicitada,
                        registroSanitarioVigente = registroSanitarioVigente,
                        evaluacionVencimiento = evaluacionVencimiento,
                        conformidadEmpaque = conformidadEmpaque,
                        uniformeCompleto = uniformeCStr,
                        transporteAdecuado = transporteStr,
                        puntualidad = puntualidadStr,
                        observaciones = observaciones.ifBlank { null },
                        accionCorrectiva = accionCorrectiva.ifBlank { null },
                        supervisorId = supervisorSeleccionado!!.id
                    )
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
                Text(if (uiState.isLoading) "Registrando..." else "Registrar Recepción de Abarrotes")
            }
            
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
    
    // Diálogo de éxito
    if (showSuccessDialog && uiState.successMessage != null) {
        AlertDialog(
            onDismissRequest = {
                showSuccessDialog = false
                haccpViewModel.clearMessages()
                onNavigateBack()
            },
            icon = {
                Icon(
                    Icons.Default.Check,
                    contentDescription = null,
                    tint = Color(0xFF4CAF50),
                    modifier = Modifier.size(48.dp)
                )
            },
            title = { Text("¡Registro Exitoso!") },
            text = { Text(uiState.successMessage ?: "La recepción de abarrotes ha sido registrada correctamente") },
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

// Función auxiliar para obtener el nombre del mes
private fun getMonthName(month: Int): String {
    return when (month) {
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
        else -> ""
    }
}
