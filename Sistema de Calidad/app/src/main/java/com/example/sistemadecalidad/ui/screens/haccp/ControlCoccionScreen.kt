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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.sistemadecalidad.utils.TimeUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ControlCoccionScreen(
    haccpViewModel: com.example.sistemadecalidad.ui.viewmodel.HaccpViewModel,
    preferencesManager: com.example.sistemadecalidad.data.local.PreferencesManager,
    onNavigateBack: () -> Unit
) {
    var productoCocinar by remember { mutableStateOf("POLLO") }
    var procesoCoccion by remember { mutableStateOf("H") }
    var temperaturaCoccion by remember { mutableStateOf("") }
    var tiempoCoccion by remember { mutableStateOf("") }
    var accionCorrectiva by remember { mutableStateOf("") }
    
    val uiState by haccpViewModel.uiState.collectAsState()
    val usuario by preferencesManager.getUser().collectAsState(initial = null)
    
    var showSuccessDialog by remember { mutableStateOf(false) }
    
    val scrollState = rememberScrollState()
    val currentPeruDate = TimeUtils.getCurrentPeruDate()
    
    // Calcular conformidad automáticamente
    val temperatura = temperaturaCoccion.toDoubleOrNull() ?: 0.0
    val conformidad = if (temperatura > 80.0) "C" else "NC"
    
    // Validación del formulario
    val isFormValid = temperaturaCoccion.isNotEmpty() && 
                     tiempoCoccion.isNotEmpty() &&
                     (conformidad == "C" || accionCorrectiva.isNotEmpty())
    
    // Mostrar diálogo de éxito
    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            showSuccessDialog = true
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Control de Cocción") },
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
                text = "REGISTRO HACCP - CONTROL DE COCCIÓN",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
            )
            
            Divider()
            
            // DATOS DEL RESPONSABLE (automático del usuario logueado)
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("RESPONSABLE", style = MaterialTheme.typography.labelMedium, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                    Text("Nombre: ${usuario?.nombreCompleto ?: "..."}")
                    Text("Cargo: ${usuario?.cargo ?: "..."}")
                    Text("Área: ${usuario?.area ?: "..."}")
                }
            }
            
            // Producto a Cocinar
            Text("PRODUCTO A COCINAR *", style = MaterialTheme.typography.titleSmall, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    FilterChip(
                        selected = productoCocinar == "POLLO",
                        onClick = { productoCocinar = "POLLO" },
                        label = { Text("Pollo") },
                        modifier = Modifier.weight(1f)
                    )
                    FilterChip(
                        selected = productoCocinar == "CARNE",
                        onClick = { productoCocinar = "CARNE" },
                        label = { Text("Carne") },
                        modifier = Modifier.weight(1f)
                    )
                    FilterChip(
                        selected = productoCocinar == "PESCADO",
                        onClick = { productoCocinar = "PESCADO" },
                        label = { Text("Pescado") },
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    FilterChip(
                        selected = productoCocinar == "HAMBURGUESA",
                        onClick = { productoCocinar = "HAMBURGUESA" },
                        label = { Text("Hamburguesa") },
                        modifier = Modifier.weight(1f)
                    )
                    FilterChip(
                        selected = productoCocinar == "PIZZA",
                        onClick = { productoCocinar = "PIZZA" },
                        label = { Text("Pizza") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            // Proceso de Cocción
            Text("PROCESO DE COCCIÓN *", style = MaterialTheme.typography.titleSmall, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
            Text("H = Horno | P = Plancha | C = Cocina", style = MaterialTheme.typography.bodySmall)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = procesoCoccion == "H",
                    onClick = { procesoCoccion = "H" },
                    label = { Text("🔥 Horno") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = procesoCoccion == "P",
                    onClick = { procesoCoccion = "P" },
                    label = { Text("🍳 Plancha") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = procesoCoccion == "C",
                    onClick = { procesoCoccion = "C" },
                    label = { Text("🍲 Cocina") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Parámetros de Cocción
            Text(
                text = "Parámetros de Cocción",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            OutlinedTextField(
                value = temperaturaCoccion,
                onValueChange = { temperaturaCoccion = it },
                label = { Text("Temperatura de Cocción (°C) *") },
                supportingText = { Text("Debe ser mayor a 80°C") },
                modifier = Modifier.fillMaxWidth(),
                suffix = { Text("°C") }
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            OutlinedTextField(
                value = tiempoCoccion,
                onValueChange = { tiempoCoccion = it },
                label = { Text("Tiempo de Cocción (minutos) *") },
                modifier = Modifier.fillMaxWidth(),
                suffix = { Text("min") }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Resultado de Conformidad (automático)
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (conformidad == "C") 
                        MaterialTheme.colorScheme.primaryContainer 
                    else 
                        MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Conformidad",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (conformidad == "C") 
                                "✓ Conforme (Temperatura > 80°C)" 
                            else 
                                "✗ No Conforme (Temperatura ≤ 80°C)",
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Acción Correctiva (obligatoria si no conforme)
            if (conformidad == "NC") {
                OutlinedTextField(
                    value = accionCorrectiva,
                    onValueChange = { accionCorrectiva = it },
                    label = { Text("Acción Correctiva *") },
                    supportingText = { Text("Obligatoria cuando no es conforme") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    isError = accionCorrectiva.isEmpty()
                )
            } else {
                OutlinedTextField(
                    value = accionCorrectiva,
                    onValueChange = { accionCorrectiva = it },
                    label = { Text("Acción Correctiva (opcional)") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2
                )
            }
            
            // Mensaje de error del servidor
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
            
            // Botón guardar
            Button(
                onClick = {
                    if (isFormValid) {
                        haccpViewModel.registrarControlCoccion(
                            productoCocinar = productoCocinar,
                            procesoCoccion = procesoCoccion,
                            temperatura = temperatura,
                            tiempoCoccion = tiempoCoccion.toIntOrNull() ?: 0,
                            accionCorrectiva = if (accionCorrectiva.isNotEmpty()) accionCorrectiva else null
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
                Text(if (uiState.isLoading) "Guardando..." else "Registrar Control de Cocción")
            }
            
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
    
    // Diálogo de éxito
    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { 
                showSuccessDialog = false
                haccpViewModel.resetFormSuccess()
                onNavigateBack()
            },
            icon = { Icon(Icons.Default.Check, contentDescription = null, tint = androidx.compose.ui.graphics.Color.Green) },
            title = { Text("¡Éxito!") },
            text = { Text(uiState.successMessage ?: "Control de cocción registrado correctamente") },
            confirmButton = {
                TextButton(onClick = { 
                    showSuccessDialog = false
                    haccpViewModel.resetFormSuccess()
                    onNavigateBack()
                }) {
                    Text("Aceptar")
                }
            }
        )
    }
}
