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
import androidx.compose.ui.unit.dp
import com.example.sistemadecalidad.utils.TimeUtils
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ControlTemperaturaScreen(
    onNavigateBack: () -> Unit,
    onSubmit: (ControlTemperaturaData) -> Unit
) {
    var tipoAlimento by remember { mutableStateOf("CALIENTE") }
    var nombreAlimento by remember { mutableStateOf("") }
    var temperaturaRegistrada by remember { mutableStateOf("") }
    var temperaturaMinima by remember { mutableStateOf("") }
    var temperaturaMaxima by remember { mutableStateOf("") }
    var ubicacionExhibicion by remember { mutableStateOf("") }
    var accionCorrectiva by remember { mutableStateOf("") }
    
    val scrollState = rememberScrollState()
    val currentPeruDate = TimeUtils.getCurrentPeruDate()
    val peruCalendar = Calendar.getInstance(TimeUtils.getPeruTimeZone())
    peruCalendar.time = currentPeruDate
    
    // Calcular conformidad automáticamente
    val tempReg = temperaturaRegistrada.toDoubleOrNull() ?: 0.0
    val tempMin = temperaturaMinima.toDoubleOrNull() ?: 0.0
    val tempMax = temperaturaMaxima.toDoubleOrNull() ?: Double.MAX_VALUE
    val conformidad = if (tempReg >= tempMin && tempReg <= tempMax) "C" else "NC"
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Control de Temperatura") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    val data = ControlTemperaturaData(
                        mes = peruCalendar.get(Calendar.MONTH) + 1,
                        anio = peruCalendar.get(Calendar.YEAR),
                        dia = peruCalendar.get(Calendar.DAY_OF_MONTH),
                        fecha = TimeUtils.formatDateForBackend(currentPeruDate),
                        hora = TimeUtils.formatTimeForBackend(currentPeruDate),
                        tipoAlimento = tipoAlimento,
                        nombreAlimento = nombreAlimento,
                        temperaturaRegistrada = tempReg,
                        temperaturaMinima = tempMin,
                        temperaturaMaxima = tempMax,
                        conformidad = conformidad,
                        ubicacionExhibicion = ubicacionExhibicion,
                        accionCorrectiva = accionCorrectiva.ifEmpty { null }
                    )
                    onSubmit(data)
                }
            ) {
                Icon(Icons.Default.Check, "Guardar")
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
            Text(
                text = "Control de Temperatura de Alimentos",
                style = MaterialTheme.typography.titleLarge
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Tipo de Alimento
            Text("Tipo de Alimento", style = MaterialTheme.typography.labelMedium)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = tipoAlimento == "CALIENTE",
                    onClick = { 
                        tipoAlimento = "CALIENTE"
                        // Sugerir rangos típicos para alimentos calientes
                        if (temperaturaMinima.isEmpty()) temperaturaMinima = "60"
                        if (temperaturaMaxima.isEmpty()) temperaturaMaxima = "100"
                    },
                    label = { Text("🔥 Caliente") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = tipoAlimento == "FRIO",
                    onClick = { 
                        tipoAlimento = "FRIO"
                        // Sugerir rangos típicos para alimentos fríos
                        if (temperaturaMinima.isEmpty()) temperaturaMinima = "0"
                        if (temperaturaMaxima.isEmpty()) temperaturaMaxima = "5"
                    },
                    label = { Text("❄️ Frío") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Información del Alimento
            OutlinedTextField(
                value = nombreAlimento,
                onValueChange = { nombreAlimento = it },
                label = { Text("Nombre del Alimento *") },
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            OutlinedTextField(
                value = ubicacionExhibicion,
                onValueChange = { ubicacionExhibicion = it },
                label = { Text("Ubicación de Exhibición *") },
                supportingText = { Text("Ejemplo: Barra de buffet, Vitrina refrigerada") },
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Parámetros de Temperatura
            Text(
                text = "Rangos de Temperatura Permitidos",
                style = MaterialTheme.typography.titleMedium
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                )
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = if (tipoAlimento == "CALIENTE") 
                            "Alimentos Calientes: > 60°C" 
                        else 
                            "Alimentos Fríos: 0°C - 5°C",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = temperaturaMinima,
                    onValueChange = { temperaturaMinima = it },
                    label = { Text("Temp. Mínima *") },
                    modifier = Modifier.weight(1f),
                    suffix = { Text("°C") }
                )
                OutlinedTextField(
                    value = temperaturaMaxima,
                    onValueChange = { temperaturaMaxima = it },
                    label = { Text("Temp. Máxima *") },
                    modifier = Modifier.weight(1f),
                    suffix = { Text("°C") }
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            OutlinedTextField(
                value = temperaturaRegistrada,
                onValueChange = { temperaturaRegistrada = it },
                label = { Text("Temperatura Registrada *") },
                supportingText = { Text("Temperatura medida del alimento") },
                modifier = Modifier.fillMaxWidth(),
                suffix = { Text("°C") }
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
                    Text(
                        text = if (conformidad == "C") 
                            "✓ Conforme (Temperatura dentro del rango permitido)" 
                        else 
                            "✗ No Conforme (Temperatura fuera del rango)",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    if (conformidad == "C" && tempReg > 0.0) {
                        Text(
                            text = "Temperatura: $tempReg°C (Rango: $tempMin°C - $tempMax°C)",
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(top = 4.dp)
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
            
            Spacer(modifier = Modifier.height(80.dp)) // Espacio para FAB
        }
    }
}

data class ControlTemperaturaData(
    val mes: Int,
    val anio: Int,
    val dia: Int,
    val fecha: String,
    val hora: String,
    val tipoAlimento: String,
    val nombreAlimento: String,
    val temperaturaRegistrada: Double,
    val temperaturaMinima: Double,
    val temperaturaMaxima: Double,
    val conformidad: String,
    val ubicacionExhibicion: String,
    val accionCorrectiva: String?
)
