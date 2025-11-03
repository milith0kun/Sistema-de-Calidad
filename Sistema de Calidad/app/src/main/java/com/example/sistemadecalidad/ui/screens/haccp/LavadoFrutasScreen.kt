package com.example.sistemadecalidad.ui.screens.haccp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.sistemadecalidad.utils.TimeUtils
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LavadoFrutasScreen(
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
    var productoQuimico by remember { mutableStateOf("Cloro") }
    var concentracionProducto by remember { mutableStateOf("") }
    var nombreFrutaVerdura by remember { mutableStateOf("") }
    var lavadoAguaPotable by remember { mutableStateOf("C") }
    var desinfeccionProductoQuimico by remember { mutableStateOf("C") }
    var concentracionCorrect by remember { mutableStateOf("C") }
    var tiempoDesinfeccion by remember { mutableStateOf("") }
    var accionesCorrectivas by remember { mutableStateOf("") }
    
    val uiState by haccpViewModel.uiState.collectAsState()
    val usuario by preferencesManager.getUser().collectAsState(initial = null)
    
    var showSuccessDialog by remember { mutableStateOf(false) }
    
    val scrollState = rememberScrollState()
    
    // Validación del formulario
    val isFormValid = productoQuimico.isNotEmpty() && 
                     concentracionProducto.isNotEmpty() &&
                     nombreFrutaVerdura.isNotEmpty() &&
                     tiempoDesinfeccion.isNotEmpty() &&
                     (tiempoDesinfeccion.toIntOrNull() ?: 0) in 0..10 &&
                     // Si alguno es NC, se requiere acciones correctivas
                     ((lavadoAguaPotable == "C" && desinfeccionProductoQuimico == "C" && concentracionCorrect == "C") || 
                      accionesCorrectivas.isNotEmpty())
    
    // Mostrar diálogo de éxito
    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            showSuccessDialog = true
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Lavado y Desinfección de Frutas/Verduras") },
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
                text = "REGISTRO HACCP CONTROL DE LAVADO Y DESINFECCIÓN DE FRUTAS Y VERDURAS",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            HorizontalDivider()
            
            // DATOS DEL SUPERVISOR (automático del usuario logueado)
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("SUPERVISOR", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                    Text("Nombre: ${usuario?.nombreCompleto ?: "..."}")
                    Text("Cargo: ${usuario?.cargo ?: "..."}")
                    Text("Área: ${usuario?.area ?: "..."}")
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
            
            HorizontalDivider()
            
            // PRODUCTO QUÍMICO
            Text("PRODUCTO QUÍMICO", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            OutlinedTextField(
                value = productoQuimico,
                onValueChange = { productoQuimico = it },
                label = { Text("Producto Químico (ej: Cloro)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            
            OutlinedTextField(
                value = concentracionProducto,
                onValueChange = { concentracionProducto = it },
                label = { Text("Concentración (ppm o %)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                supportingText = { Text("Ejemplo: 100ppm, 0.5%, etc.") }
            )
            
            HorizontalDivider()
            
            // FRUTA/VERDURA
            Text("NOMBRE FRUTA/VERDURA *", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            OutlinedTextField(
                value = nombreFrutaVerdura,
                onValueChange = { nombreFrutaVerdura = it },
                label = { Text("Tipo de fruta o verdura") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text("Ej: Lechugas, Tomates, Zanahorias") }
            )
            
            HorizontalDivider()
            
            // CONFORMIDAD DEL PROCESO
            Text("CONFORMIDAD DEL PROCESO", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            // Lavado con agua potable
            Text("Lavado con agua potable:", style = MaterialTheme.typography.bodyMedium)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                FilterChip(
                    selected = lavadoAguaPotable == "C",
                    onClick = { lavadoAguaPotable = "C" },
                    label = { Text("✓ Conforme") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = lavadoAguaPotable == "NC",
                    onClick = { lavadoAguaPotable = "NC" },
                    label = { Text("✗ No Conforme") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            // Desinfección con producto químico
            Text("Desinfección con producto químico:", style = MaterialTheme.typography.bodyMedium)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                FilterChip(
                    selected = desinfeccionProductoQuimico == "C",
                    onClick = { desinfeccionProductoQuimico = "C" },
                    label = { Text("✓ Conforme") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = desinfeccionProductoQuimico == "NC",
                    onClick = { desinfeccionProductoQuimico = "NC" },
                    label = { Text("✗ No Conforme") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            // Concentración del producto químico
            Text("Concentración del producto químico:", style = MaterialTheme.typography.bodyMedium)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                FilterChip(
                    selected = concentracionCorrect == "C",
                    onClick = { concentracionCorrect = "C" },
                    label = { Text("✓ Conforme") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = concentracionCorrect == "NC",
                    onClick = { concentracionCorrect = "NC" },
                    label = { Text("✗ No Conforme") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            HorizontalDivider()
            
            // TIEMPO DE DESINFECCIÓN
            Text("TIEMPO DE DESINFECCIÓN *", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            OutlinedTextField(
                value = tiempoDesinfeccion,
                onValueChange = { tiempoDesinfeccion = it },
                label = { Text("Tiempo (minutos)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                supportingText = { Text("Debe estar entre 0 - 10 minutos") }
            )
            
            HorizontalDivider()
            
            // ACCIONES CORRECTIVAS
            Text("ACCIONES CORRECTIVAS", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            
            val requiereAcciones = lavadoAguaPotable == "NC" || desinfeccionProductoQuimico == "NC" || concentracionCorrect == "NC"
            
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
                    haccpViewModel.registrarLavadoFrutas(
                        mes = mes,
                        anio = anio,
                        productoQuimico = productoQuimico,
                        concentracion = concentracionProducto.toDoubleOrNull() ?: 0.0,
                        nombreFruta = nombreFrutaVerdura,
                        lavadoAgua = lavadoAguaPotable,
                        desinfeccion = desinfeccionProductoQuimico,
                        concentracionCorrecta = concentracionCorrect,
                        tiempoDesinfeccion = tiempoDesinfeccion.toIntOrNull() ?: 0,
                        accionesCorrectivas = accionesCorrectivas.ifEmpty { null }
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
                Text("Registrar Control de Lavado y Desinfección")
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
            text = { Text(uiState.successMessage ?: "Control de lavado de frutas registrado correctamente") },
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
