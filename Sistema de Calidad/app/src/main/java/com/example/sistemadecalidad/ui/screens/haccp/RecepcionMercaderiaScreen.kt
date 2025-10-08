package com.example.sistemadecalidad.ui.screens.haccp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.ui.viewmodel.HaccpViewModel
import com.example.sistemadecalidad.ui.components.ValidatedTextField
import com.example.sistemadecalidad.ui.components.FieldValidators
import com.example.sistemadecalidad.ui.components.ErrorMessage
import com.example.sistemadecalidad.ui.components.SuccessMessage
import com.example.sistemadecalidad.ui.components.LoadingMessage
import com.example.sistemadecalidad.utils.TimeUtils
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecepcionMercaderiaScreen(
    haccpViewModel: HaccpViewModel,
    preferencesManager: PreferencesManager,
    onNavigateBack: () -> Unit
) {
    // ViewModel states
    val uiState by haccpViewModel.uiState.collectAsStateWithLifecycle()
    val supervisores by haccpViewModel.supervisores.collectAsStateWithLifecycle()
    
    var tipoControl by remember { mutableStateOf("FRUTAS_VERDURAS") }
    var nombreProveedor by remember { mutableStateOf("") }
    var nombreProducto by remember { mutableStateOf("") }
    var cantidadSolicitada by remember { mutableStateOf("") }
    var pesoRecibido by remember { mutableStateOf("") }
    var unidadMedida by remember { mutableStateOf("KG") }
    
    // Campos para Frutas y Verduras
    var estadoProducto by remember { mutableStateOf("EXCELENTE") }
    var conformidadIntegridad by remember { mutableStateOf("EXCELENTE") }
    
    // Campos para Abarrotes
    var registroSanitario by remember { mutableStateOf(true) }
    var fechaVencimiento by remember { mutableStateOf("") }
    var evaluacionVencimiento by remember { mutableStateOf("EXCELENTE") }
    var conformidadEmpaque by remember { mutableStateOf("EXCELENTE") }
    
    // Evaluaciones comunes
    var uniformeCompleto by remember { mutableStateOf("C") }
    var transporteAdecuado by remember { mutableStateOf("C") }
    var puntualidad by remember { mutableStateOf("C") }
    
    // Supervisor
    var supervisorSeleccionado by remember { mutableStateOf<Int?>(null) }
    var supervisorMenuExpanded by remember { mutableStateOf(false) }
    
    var observaciones by remember { mutableStateOf("") }
    var accionCorrectiva by remember { mutableStateOf("") }
    var productoRechazado by remember { mutableStateOf(false) }
    
    var showSuccessDialog by remember { mutableStateOf(false) }
    
    val scrollState = rememberScrollState()
    val currentPeruDate = TimeUtils.getCurrentPeruDate()
    val peruCalendar = Calendar.getInstance(TimeUtils.getPeruTimeZone())
    peruCalendar.time = currentPeruDate
    
    // Cargar supervisores al iniciar
    LaunchedEffect(Unit) {
        haccpViewModel.cargarSupervisores(area = null) // Todos los supervisores
    }
    
    // Mostrar diálogo de éxito
    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            showSuccessDialog = true
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Recepción de Mercadería") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Volver")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    // Validaciones mejoradas
                    val errors = mutableMapOf<String, String>()
                    
                    // Validar campos obligatorios
                    if (nombreProveedor.isBlank()) {
                        errors["proveedor"] = "El nombre del proveedor es obligatorio"
                    }
                    
                    if (nombreProducto.isBlank()) {
                        errors["producto"] = "El nombre del producto es obligatorio"
                    }
                    
                    // Validar peso
                    val pesoDouble = pesoRecibido.toDoubleOrNull()
                    when {
                        pesoRecibido.isBlank() -> errors["peso"] = "El peso es obligatorio"
                        pesoDouble == null -> errors["peso"] = "El peso debe ser un número válido"
                        pesoDouble <= 0 -> errors["peso"] = "El peso debe ser mayor a 0"
                        pesoDouble > 1000 -> errors["peso"] = "El peso no puede ser mayor a 1000 kg"
                    }
                    
                    // Validar cantidad solicitada si no está vacía
                    if (cantidadSolicitada.isNotBlank()) {
                        val cantidadDouble = cantidadSolicitada.toDoubleOrNull()
                        if (cantidadDouble == null || cantidadDouble <= 0) {
                            errors["cantidad"] = "La cantidad debe ser un número válido mayor a 0"
                        }
                    }
                    
                    // Validar campos de evaluación para frutas y verduras
                    if (tipoControl == "FRUTAS_VERDURAS") {
                        if (estadoProducto.isBlank()) {
                            errors["estado"] = "El estado del producto es obligatorio"
                        }
                        if (conformidadIntegridad.isBlank()) {
                            errors["conformidad"] = "La conformidad de integridad es obligatoria"
                        }
                    }
                    
                    // Validar campos de evaluación para abarrotes
                    if (tipoControl == "ABARROTES") {
                        if (evaluacionVencimiento.isBlank()) {
                            errors["vencimiento"] = "La evaluación de vencimiento es obligatoria"
                        }
                        if (conformidadEmpaque.isBlank()) {
                            errors["empaque"] = "La conformidad del empaque es obligatoria"
                        }
                    }
                    
                    // Validar campos comunes
                    if (uniformeCompleto.isBlank()) {
                        errors["uniforme"] = "La evaluación del uniforme es obligatoria"
                    }
                    if (transporteAdecuado.isBlank()) {
                        errors["transporte"] = "La evaluación del transporte es obligatoria"
                    }
                    if (puntualidad.isBlank()) {
                        errors["puntualidad"] = "La evaluación de puntualidad es obligatoria"
                    }
                    
                    // Si hay errores, mostrar mensaje y no enviar
                    if (errors.isNotEmpty()) {
                        val errorMessage = "Por favor corrija los siguientes errores:\n" + 
                            errors.values.joinToString("\n• ", "• ")
                        // Aquí podrías mostrar un diálogo de error o usar el sistema de errores del ViewModel
                        return@FloatingActionButton
                    }
                    
                    // Verificar que pesoDouble no sea null antes de proceder
                    if (pesoDouble == null) {
                        return@FloatingActionButton
                    }
                    
                    haccpViewModel.registrarRecepcionFrutasVerduras(
                        mes = peruCalendar.get(Calendar.MONTH) + 1,
                        anio = peruCalendar.get(Calendar.YEAR),
                        fecha = TimeUtils.formatDateForBackend(currentPeruDate),
                        hora = TimeUtils.formatTimeForBackend(currentPeruDate),
                        tipoControl = tipoControl,
                        nombreProveedor = nombreProveedor,
                        nombreProducto = nombreProducto,
                        cantidadSolicitada = cantidadSolicitada,
                        pesoUnidadRecibido = pesoDouble,
                        unidadMedida = unidadMedida,
                        estadoProducto = estadoProducto,
                        conformidadIntegridad = conformidadIntegridad,
                        uniformeCompleto = uniformeCompleto,
                        transporteAdecuado = transporteAdecuado,
                        puntualidad = puntualidad,
                        observaciones = observaciones.ifEmpty { null },
                        accionCorrectiva = accionCorrectiva.ifEmpty { null },
                        productoRechazado = productoRechazado,
                        supervisorId = supervisorSeleccionado
                    )
                }
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimaryContainer)
                } else {
                    Icon(Icons.Default.Check, "Guardar")
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(scrollState)
        ) {
            // Mostrar mensajes de estado
            if (uiState.isLoading) {
                LoadingMessage("Guardando registro...")
            }
            
            uiState.error?.let { errorMessage ->
                ErrorMessage(
                    message = errorMessage,
                    onDismiss = { haccpViewModel.clearMessages() }
                )
            }
            
            uiState.successMessage?.let { successMessage ->
                SuccessMessage(
                    message = successMessage,
                    onDismiss = { haccpViewModel.clearMessages() }
                )
            }
            
            Text(
                text = "Información de Recepción",
                style = MaterialTheme.typography.titleLarge
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Tipo de Control
            Text("Tipo de Control", style = MaterialTheme.typography.labelMedium)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = tipoControl == "FRUTAS_VERDURAS",
                    onClick = { tipoControl = "FRUTAS_VERDURAS" },
                    label = { Text("Frutas y Verduras") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = tipoControl == "ABARROTES",
                    onClick = { tipoControl = "ABARROTES" },
                    label = { Text("Abarrotes") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Datos del Proveedor y Producto
            ValidatedTextField(
                value = nombreProveedor,
                onValueChange = { nombreProveedor = it },
                label = "Proveedor",
                isRequired = true,
                validator = FieldValidators.required("Proveedor"),
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ValidatedTextField(
                value = nombreProducto,
                onValueChange = { nombreProducto = it },
                label = "Producto",
                isRequired = true,
                validator = FieldValidators.required("Producto"),
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ValidatedTextField(
                    value = cantidadSolicitada,
                    onValueChange = { cantidadSolicitada = it },
                    label = "Cantidad Solicitada",
                    keyboardType = androidx.compose.ui.text.input.KeyboardType.Number,
                    validator = { value ->
                        if (value.isNotBlank()) {
                            val number = value.toDoubleOrNull()
                            when {
                                number == null -> "Debe ser un número válido"
                                number <= 0 -> "Debe ser mayor a 0"
                                else -> null
                            }
                        } else null
                    },
                    modifier = Modifier.weight(1f)
                )
                ValidatedTextField(
                    value = pesoRecibido,
                    onValueChange = { pesoRecibido = it },
                    label = "Peso Recibido",
                    isRequired = true,
                    keyboardType = androidx.compose.ui.text.input.KeyboardType.Number,
                    validator = FieldValidators.positiveNumber("Peso Recibido", 1000.0),
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Unidad de Medida
            Text("Unidad de Medida", style = MaterialTheme.typography.labelMedium)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                listOf("KG", "UNIDAD", "CAJA", "GRAMOS", "LITROS").forEach { unidad ->
                    FilterChip(
                        selected = unidadMedida == unidad,
                        onClick = { unidadMedida = unidad },
                        label = { Text(unidad, style = MaterialTheme.typography.bodySmall) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Campos específicos según tipo de control
            if (tipoControl == "FRUTAS_VERDURAS") {
                Text(
                    text = "Evaluación de Frutas y Verduras",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                EvaluacionField(
                    label = "Estado del Producto",
                    value = estadoProducto,
                    onValueChange = { estadoProducto = it }
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                EvaluacionField(
                    label = "Conformidad e Integridad",
                    value = conformidadIntegridad,
                    onValueChange = { conformidadIntegridad = it }
                )
            } else {
                Text(
                    text = "Evaluación de Abarrotes",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = registroSanitario,
                        onCheckedChange = { registroSanitario = it }
                    )
                    Text("Registro Sanitario Vigente")
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = fechaVencimiento,
                    onValueChange = { fechaVencimiento = it },
                    label = { Text("Fecha de Vencimiento (YYYY-MM-DD)") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                EvaluacionField(
                    label = "Evaluación Vencimiento",
                    value = evaluacionVencimiento,
                    onValueChange = { evaluacionVencimiento = it }
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                EvaluacionField(
                    label = "Conformidad Empaque",
                    value = conformidadEmpaque,
                    onValueChange = { conformidadEmpaque = it }
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Evaluaciones Comunes
            Text(
                text = "Evaluaciones del Proveedor",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            ConformidadField(
                label = "Uniforme Completo",
                value = uniformeCompleto,
                onValueChange = { uniformeCompleto = it }
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ConformidadField(
                label = "Transporte Adecuado",
                value = transporteAdecuado,
                onValueChange = { transporteAdecuado = it }
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ConformidadField(
                label = "Puntualidad",
                value = puntualidad,
                onValueChange = { puntualidad = it }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Supervisor de área
            Text("Supervisor de Área (Opcional)", style = MaterialTheme.typography.labelMedium)
            Spacer(modifier = Modifier.height(4.dp))
            ExposedDropdownMenuBox(
                expanded = supervisorMenuExpanded,
                onExpandedChange = { supervisorMenuExpanded = it }
            ) {
                OutlinedTextField(
                    value = supervisorSeleccionado?.let { id ->
                        supervisores.find { it.id == id }?.nombre
                    } ?: "Seleccionar supervisor",
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = supervisorMenuExpanded) },
                    modifier = Modifier
                        .menuAnchor()
                        .fillMaxWidth(),
                    colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors()
                )
                
                ExposedDropdownMenu(
                    expanded = supervisorMenuExpanded,
                    onDismissRequest = { supervisorMenuExpanded = false }
                ) {
                    supervisores.forEach { supervisor ->
                        DropdownMenuItem(
                            text = { 
                                Column {
                                    Text(supervisor.nombre)
                                    Text(
                                        text = "${supervisor.cargo} - ${supervisor.area}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            },
                            onClick = {
                                supervisorSeleccionado = supervisor.id
                                supervisorMenuExpanded = false
                            }
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Observaciones
            ValidatedTextField(
                value = observaciones,
                onValueChange = { observaciones = it },
                label = "Observaciones",
                maxLines = 3,
                validator = FieldValidators.maxLength("Observaciones", 500),
                placeholder = "Ingrese observaciones adicionales (opcional)",
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ValidatedTextField(
                value = accionCorrectiva,
                onValueChange = { accionCorrectiva = it },
                label = "Acción Correctiva",
                maxLines = 2,
                validator = FieldValidators.maxLength("Acción Correctiva", 300),
                placeholder = "Describa las acciones correctivas tomadas (opcional)",
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = productoRechazado,
                    onCheckedChange = { productoRechazado = it }
                )
                Text("Producto Rechazado")
            }
            
            Spacer(modifier = Modifier.height(80.dp)) // Espacio para FAB
        }
    }
    
    // Navegar de vuelta automáticamente después del éxito
    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            kotlinx.coroutines.delay(2000) // Esperar 2 segundos para que el usuario vea el mensaje
            haccpViewModel.clearMessages()
            onNavigateBack()
        }
    }
}

@Composable
fun EvaluacionField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit
) {
    Column {
        Text(label, style = MaterialTheme.typography.labelMedium)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterChip(
                selected = value == "EXCELENTE",
                onClick = { onValueChange("EXCELENTE") },
                label = { Text("Excelente") },
                modifier = Modifier.weight(1f)
            )
            FilterChip(
                selected = value == "REGULAR",
                onClick = { onValueChange("REGULAR") },
                label = { Text("Regular") },
                modifier = Modifier.weight(1f)
            )
            FilterChip(
                selected = value == "PESIMO",
                onClick = { onValueChange("PESIMO") },
                label = { Text("Pésimo") },
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun ConformidadField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
    ) {
        Text(label, modifier = Modifier.weight(1f))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = value == "C",
                onClick = { onValueChange("C") },
                label = { Text("✓ Conforme") }
            )
            FilterChip(
                selected = value == "NC",
                onClick = { onValueChange("NC") },
                label = { Text("✗ No Conforme") }
            )
        }
    }
}
