package com.example.sistemadecalidad.ui.screens.haccp

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
// import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.model.User
import com.example.sistemadecalidad.data.api.Empleado
import com.example.sistemadecalidad.ui.viewmodel.HaccpViewModel
import com.example.sistemadecalidad.ui.components.ValidatedTextField
import com.example.sistemadecalidad.ui.components.FieldValidators
import com.example.sistemadecalidad.ui.components.ErrorMessage
import com.example.sistemadecalidad.ui.components.SuccessMessage
import com.example.sistemadecalidad.ui.components.LoadingMessage
import com.example.sistemadecalidad.utils.TimeUtils
import kotlinx.coroutines.delay
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecepcionMercaderiaScreen(
    onNavigateBack: () -> Unit,
    haccpViewModel: HaccpViewModel, // = hiltViewModel()
    usuario: User? = null,
    preferencesManager: PreferencesManager? = null
) {
    // Estados para los campos del formulario - Solo para Frutas y Verduras
    var nombreProveedor by remember { mutableStateOf("") }
    var nombreProducto by remember { mutableStateOf("") }
    var cantidadSolicitada by remember { mutableStateOf("") }
    var unidadMedida by remember { mutableStateOf("") }
    
    // Campos específicos para Frutas y Verduras
    var estadoProducto by remember { mutableStateOf("") }
    var conformidadIntegridad by remember { mutableStateOf("") }
    
    // Campos comunes
    var uniformeCompleto by remember { mutableStateOf("") }
    var transporteAdecuado by remember { mutableStateOf("") }
    var puntualidad by remember { mutableStateOf("") }
    
    // Campos opcionales
    var supervisorSeleccionado by remember { mutableStateOf<Empleado?>(null) }
    var observaciones by remember { mutableStateOf("") }
    var accionCorrectiva by remember { mutableStateOf("") }
    var productoRechazado by remember { mutableStateOf(false) }
    
    // Estados de UI
    var showSupervisorDialog by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var showSuccessMessage by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    // Observar estados del ViewModel
    val uiState by haccpViewModel.uiState.collectAsState()
    val supervisores by haccpViewModel.supervisores.collectAsState()
    
    // Cargar supervisores al iniciar
    LaunchedEffect(Unit) {
        haccpViewModel.cargarSupervisores()
    }
    
    // Manejar estados del registro
    LaunchedEffect(uiState.isFormSuccess) {
        if (uiState.isFormSuccess) {
            showSuccessMessage = true
            // Limpiar formulario después del éxito
            nombreProveedor = ""
            nombreProducto = ""
            cantidadSolicitada = ""
            unidadMedida = ""
            estadoProducto = ""
            conformidadIntegridad = ""
            uniformeCompleto = ""
            transporteAdecuado = ""
            puntualidad = ""
            supervisorSeleccionado = null
            observaciones = ""
            accionCorrectiva = ""
            productoRechazado = false
            
            // Resetear el estado de éxito en el ViewModel para evitar que se quede "pegado"
            haccpViewModel.resetFormSuccess()
        }
    }
    
    // Actualizar estados de carga y error
    LaunchedEffect(uiState.isLoading) {
        isLoading = uiState.isLoading
    }
    
    LaunchedEffect(uiState.error) {
        errorMessage = uiState.error
    }
    
    // Función de validación específica para frutas y verduras
    fun validarFormulario(): String? {
        if (nombreProveedor.isBlank()) return "El nombre del proveedor es obligatorio"
        if (nombreProducto.isBlank()) return "El nombre del producto es obligatorio"
        if (cantidadSolicitada.isBlank()) return "La cantidad solicitada es obligatoria"
        
        // Validaciones específicas para frutas y verduras
        if (estadoProducto.isBlank()) return "El estado del producto es obligatorio"
        if (conformidadIntegridad.isBlank()) return "La conformidad e integridad es obligatoria"
        
        // Validaciones comunes
        if (uniformeCompleto.isBlank()) return "La evaluación de uniforme completo es obligatoria"
        if (transporteAdecuado.isBlank()) return "La evaluación de transporte adecuado es obligatoria"
        if (puntualidad.isBlank()) return "La evaluación de puntualidad es obligatoria"
        
        return null
    }
    
    // Función para registrar
    fun registrar() {
        val error = validarFormulario()
        if (error != null) {
            errorMessage = error
            return
        }
        
        // Obtener fecha y hora actuales
        val currentPeruDate = TimeUtils.getCurrentPeruDate()
        val peruCalendar = Calendar.getInstance(TimeUtils.getPeruTimeZone())
        peruCalendar.time = currentPeruDate
        val mes = peruCalendar.get(Calendar.MONTH) + 1
        val anio = peruCalendar.get(Calendar.YEAR)
        val fecha = TimeUtils.formatDateForBackend(currentPeruDate)
        val hora = TimeUtils.formatTimeForBackend(currentPeruDate)
        
        haccpViewModel.registrarRecepcionFrutasVerduras(
            mes = mes,
            anio = anio,
            fecha = fecha,
            hora = hora,
            tipoControl = "FRUTAS_VERDURAS",
            nombreProveedor = nombreProveedor,
            nombreProducto = nombreProducto,
            cantidadSolicitada = cantidadSolicitada,
            pesoUnidadRecibido = "0.0", // Valor por defecto como texto ya que no se usa peso recibido
            unidadMedida = unidadMedida,
            cNc = "C", // Valor por defecto de conformidad general
            estadoProducto = estadoProducto,
            conformidadIntegridad = conformidadIntegridad,
            uniformeCompleto = uniformeCompleto,
            transporteAdecuado = transporteAdecuado,
            puntualidad = puntualidad,
            supervisorId = supervisorSeleccionado?.id,
            observaciones = observaciones.ifBlank { null },
            accionCorrectiva = accionCorrectiva.ifBlank { null },
            productoRechazado = productoRechazado
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Recepción de Frutas y Verduras",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Mensaje de estado
            item {
                if (showSuccessMessage) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    ) {
                        Text(
                            text = "✓ Registro guardado exitosamente",
                            modifier = Modifier.padding(16.dp),
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
                
                errorMessage?.let { error ->
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        )
                    ) {
                        Text(
                            text = error,
                            modifier = Modifier.padding(16.dp),
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
            }

            // Responsables del Registro y Supervisión - MOVIDO AL INICIO
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Responsables",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        
                        // Responsable de Registro (usuario logueado)
                        OutlinedTextField(
                            value = usuario?.nombreCompleto ?: "Usuario no identificado",
                            onValueChange = { },
                            label = { Text("Responsable de Registro") },
                            modifier = Modifier.fillMaxWidth(),
                            readOnly = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                disabledTextColor = MaterialTheme.colorScheme.onSurface,
                                disabledBorderColor = MaterialTheme.colorScheme.outline,
                                disabledPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                disabledLabelColor = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        )
                        
                        // Selector de Supervisor
                        ExposedDropdownMenuBox(
                            expanded = showSupervisorDialog,
                            onExpandedChange = { showSupervisorDialog = !showSupervisorDialog }
                        ) {
                            OutlinedTextField(
                                value = supervisorSeleccionado?.nombre ?: "",
                                onValueChange = { },
                                readOnly = true,
                                label = { Text("Responsable de la Supervisión *") },
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = showSupervisorDialog)
                                },
                                modifier = Modifier
                                    .menuAnchor()
                                    .fillMaxWidth(),
                                placeholder = { Text("Seleccionar supervisor") }
                            )
                            ExposedDropdownMenu(
                                expanded = showSupervisorDialog,
                                onDismissRequest = { showSupervisorDialog = false }
                            ) {
                                supervisores.forEach { supervisor ->
                                    DropdownMenuItem(
                                        text = {
                                            Column {
                                                Text(
                                                    text = supervisor.nombre,
                                                    style = MaterialTheme.typography.bodyMedium
                                                )
                                            }
                                        },
                                        onClick = {
                                            supervisorSeleccionado = supervisor
                                            showSupervisorDialog = false
                                        },
                                        leadingIcon = if (supervisorSeleccionado?.id == supervisor.id) {
                                            { Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary) }
                                        } else null
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Información del producto
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Información del Producto",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        
                        OutlinedTextField(
                            value = nombreProveedor,
                            onValueChange = { nombreProveedor = it },
                            label = { Text("Proveedor *") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MaterialTheme.colorScheme.primary,
                                focusedLabelColor = MaterialTheme.colorScheme.primary
                            )
                        )
                        
                        OutlinedTextField(
                            value = nombreProducto,
                            onValueChange = { nombreProducto = it },
                            label = { Text("Producto *") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MaterialTheme.colorScheme.primary,
                                focusedLabelColor = MaterialTheme.colorScheme.primary
                            )
                        )
                    }
                }
            }
            
            // Información de cantidad y peso
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.secondaryContainer
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Cantidad y Peso",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        
                        OutlinedTextField(
                            value = cantidadSolicitada,
                            onValueChange = { cantidadSolicitada = it },
                            label = { Text("Cantidad Solicitada *") },
                            modifier = Modifier.fillMaxWidth(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            placeholder = { Text("Ej: 100") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MaterialTheme.colorScheme.secondary,
                                focusedLabelColor = MaterialTheme.colorScheme.secondary
                            )
                        )
                        
                        // Selector de tipo de medida
                        var tipoMedida by remember { mutableStateOf("peso") } // "peso" o "unidad"
                        var showTipoMedidaDropdown by remember { mutableStateOf(false) }
                        
                        ExposedDropdownMenuBox(
                            expanded = showTipoMedidaDropdown,
                            onExpandedChange = { showTipoMedidaDropdown = !showTipoMedidaDropdown }
                        ) {
                            OutlinedTextField(
                                value = if (tipoMedida == "peso") "Peso" else "Unidad",
                                onValueChange = { },
                                readOnly = true,
                                label = { Text("Tipo de Medida *") },
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = showTipoMedidaDropdown)
                                },
                                modifier = Modifier
                                    .menuAnchor()
                                    .fillMaxWidth(),
                                placeholder = { Text("Seleccionar tipo") },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = MaterialTheme.colorScheme.secondary,
                                    focusedLabelColor = MaterialTheme.colorScheme.secondary
                                )
                            )
                            ExposedDropdownMenu(
                                expanded = showTipoMedidaDropdown,
                                onDismissRequest = { showTipoMedidaDropdown = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Peso") },
                                    onClick = {
                                        tipoMedida = "peso"
                                        showTipoMedidaDropdown = false
                                    },
                                    leadingIcon = if (tipoMedida == "peso") {
                                        { Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary) }
                                    } else null
                                )
                                DropdownMenuItem(
                                    text = { Text("Unidad") },
                                    onClick = {
                                        tipoMedida = "unidad"
                                        showTipoMedidaDropdown = false
                                    },
                                    leadingIcon = if (tipoMedida == "unidad") {
                                        { Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary) }
                                    } else null
                                )
                            }
                        }
                        
                        // Conformidad de Cantidad/Peso
                        var conformidadCantidad by remember { mutableStateOf("") }
                        
                        Text(
                            text = "Conformidad de Cantidad/Peso",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            FilterChip(
                                selected = conformidadCantidad == "C",
                                onClick = { conformidadCantidad = "C" },
                                label = { Text("C - Conforme") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.3f),
                                    selectedLabelColor = MaterialTheme.colorScheme.tertiary
                                ),
                                modifier = Modifier.weight(1f)
                            )
                            FilterChip(
                                selected = conformidadCantidad == "NC",
                                onClick = { conformidadCantidad = "NC" },
                                label = { Text("NC - No Conforme") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = MaterialTheme.colorScheme.error.copy(alpha = 0.3f),
                                    selectedLabelColor = MaterialTheme.colorScheme.error
                                ),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }
            
            // Estado de Conformidad (C-NC)
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.tertiaryContainer
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Estado de Conformidad (C-NC)",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                        
                        var conformidadGeneral by remember { mutableStateOf("") }
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f).clickable { conformidadGeneral = "Conforme" }
                            ) {
                                RadioButton(
                                    selected = conformidadGeneral == "Conforme",
                                    onClick = { conformidadGeneral = "Conforme" },
                                    colors = RadioButtonDefaults.colors(
                                        selectedColor = MaterialTheme.colorScheme.tertiary
                                    )
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Conforme (C)",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer
                                )
                            }
                            
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f).clickable { conformidadGeneral = "No Conforme" }
                            ) {
                                RadioButton(
                                    selected = conformidadGeneral == "No Conforme",
                                    onClick = { conformidadGeneral = "No Conforme" },
                                    colors = RadioButtonDefaults.colors(
                                        selectedColor = MaterialTheme.colorScheme.error
                                    )
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "No Conforme (NC)",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer
                                )
                            }
                        }
                    }
                }
            }


            // Evaluaciones específicas para Frutas y Verduras
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Evaluación de Calidad",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        
                        EvaluacionField(
                            label = "Estado del Producto *",
                            value = estadoProducto,
                            onValueChange = { estadoProducto = it }
                        )
                    }
                }
            }
            
            item {
                ConformidadField(
                    label = "Conformidad e Integridad *",
                    value = conformidadIntegridad,
                    onValueChange = { conformidadIntegridad = it }
                )
            }

            // Evaluaciones comunes
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.7f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Evaluación General",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        
                        ConformidadField(
                            label = "Uniforme Completo *",
                            value = uniformeCompleto,
                            onValueChange = { uniformeCompleto = it }
                        )
                        
                        ConformidadField(
                            label = "Transporte Adecuado *",
                            value = transporteAdecuado,
                            onValueChange = { transporteAdecuado = it }
                        )
                        
                        ConformidadField(
                            label = "Puntualidad *",
                            value = puntualidad,
                            onValueChange = { puntualidad = it }
                        )
                    }
                }
            }

            // Observaciones y Acciones
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Observaciones y Acciones",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                        
                        OutlinedTextField(
                            value = observaciones,
                            onValueChange = { observaciones = it },
                            label = { Text("Observaciones") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3,
                            maxLines = 5,
                            placeholder = { Text("Ingrese observaciones adicionales...") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MaterialTheme.colorScheme.error,
                                focusedLabelColor = MaterialTheme.colorScheme.error
                            )
                        )
                        
                        OutlinedTextField(
                            value = accionCorrectiva,
                            onValueChange = { accionCorrectiva = it },
                            label = { Text("Acciones Correctivas") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3,
                            maxLines = 5,
                            placeholder = { Text("Describa las acciones correctivas necesarias...") },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MaterialTheme.colorScheme.error,
                                focusedLabelColor = MaterialTheme.colorScheme.error
                            )
                        )
                    }
                }
            }
            
            item {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = productoRechazado,
                        onCheckedChange = { productoRechazado = it }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Producto Rechazado")
                }
            }

            // Botón de registro
            item {
                Button(
                    onClick = { registrar() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    enabled = !isLoading,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    } else {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    Text(
                        text = "Registrar Recepción",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }

    // Diálogo de selección de supervisor
    if (showSupervisorDialog) {
        AlertDialog(
            onDismissRequest = { showSupervisorDialog = false },
            title = { Text("Seleccionar Supervisor") },
            text = {
                LazyColumn {
                    items(supervisores) { supervisor ->
                        TextButton(
                            onClick = {
                                supervisorSeleccionado = supervisor
                                showSupervisorDialog = false
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = supervisor.nombre,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showSupervisorDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    // Limpiar mensaje de éxito después de un tiempo
    LaunchedEffect(showSuccessMessage) {
        if (showSuccessMessage) {
            delay(3000)
            showSuccessMessage = false
        }
    }
    
    // Limpiar mensaje de error después de un tiempo
    LaunchedEffect(errorMessage) {
        if (errorMessage != null) {
            delay(5000)
            errorMessage = null
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
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            FilterChip(
                selected = value == "C",
                onClick = { onValueChange("C") },
                label = { Text("✓ Conforme") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.3f),
                    selectedLabelColor = MaterialTheme.colorScheme.tertiary
                ),
                modifier = Modifier.weight(1f)
            )
            FilterChip(
                selected = value == "NC",
                onClick = { onValueChange("NC") },
                label = { Text("✗ No Conforme") },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.error.copy(alpha = 0.3f),
                    selectedLabelColor = MaterialTheme.colorScheme.error
                ),
                modifier = Modifier.weight(1f)
            )
        }
    }
}
