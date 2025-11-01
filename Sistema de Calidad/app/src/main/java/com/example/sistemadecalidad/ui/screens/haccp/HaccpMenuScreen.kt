package com.example.sistemadecalidad.ui.screens.haccp

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HaccpMenuScreen(
    onNavigateBack: () -> Unit,
    onNavigateToForm: (String) -> Unit
) {
    val formularios = listOf(
        FormularioHaccp(
            id = "recepcion_mercaderia",
            titulo = "Recepción de Frutas y Verduras",
            descripcion = "Control de calidad en recepción de frutas y verduras",
            icono = Icons.Default.LocalShipping,
            color = MaterialTheme.colorScheme.primaryContainer
        ),
        FormularioHaccp(
            id = "control_coccion",
            titulo = "Control de Cocción",
            descripcion = "Temperatura y tiempo de cocción",
            icono = Icons.Default.LocalFireDepartment,
            color = MaterialTheme.colorScheme.secondaryContainer
        ),
        FormularioHaccp(
            id = "lavado_frutas",
            titulo = "Lavado y Desinfección de Frutas",
            descripcion = "Proceso de limpieza de frutas y verduras",
            icono = Icons.Default.CleaningServices,
            color = MaterialTheme.colorScheme.tertiaryContainer
        ),
        FormularioHaccp(
            id = "lavado_manos",
            titulo = "Lavado de Manos",
            descripcion = "Control de higiene del personal",
            icono = Icons.Default.CleanHands,
            color = MaterialTheme.colorScheme.primaryContainer
        ),
        FormularioHaccp(
            id = "temperatura_camaras",
            titulo = "Temperatura de Cámaras",
            descripcion = "Control de refrigeración y congelación (2 turnos diarios)",
            icono = Icons.Default.Kitchen,
            color = MaterialTheme.colorScheme.secondaryContainer
        ),
        FormularioHaccp(
            id = "recepcion_abarrotes",
            titulo = "Recepción de Abarrotes",
            descripcion = "Control de calidad en recepción de mercadería de abarrotes en general",
            icono = Icons.Default.ShoppingCart,
            color = MaterialTheme.colorScheme.tertiaryContainer
        ),
        FormularioHaccp(
            id = "control_higiene_personal",
            titulo = "Control de Higiene Personal",
            descripcion = "Verificación de uniformes y estado de salud del personal",
            icono = Icons.Default.HealthAndSafety,
            color = MaterialTheme.colorScheme.primaryContainer
        ),
        FormularioHaccp(
            id = "limpieza_desinfeccion",
            titulo = "Limpieza y Desinfección",
            descripcion = "Control de limpieza de equipos y superficies",
            icono = Icons.Default.CleaningServices,
            color = MaterialTheme.colorScheme.secondaryContainer
        )
    )
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Formularios HACCP") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver")
                    }
                }
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
            item {
                Text(
                    text = "Seleccione un formulario",
                    style = MaterialTheme.typography.titleLarge
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            items(formularios) { formulario ->
                FormularioCard(
                    formulario = formulario,
                    onClick = { onNavigateToForm(formulario.id) }
                )
            }
        }
    }
}

@Composable
fun FormularioCard(
    formulario: FormularioHaccp,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = formulario.color
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = formulario.icono,
                contentDescription = null,
                modifier = Modifier.size(48.dp)
            )
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = formulario.titulo,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = formulario.descripcion,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "Ir al formulario"
            )
        }
    }
}

data class FormularioHaccp(
    val id: String,
    val titulo: String,
    val descripcion: String,
    val icono: ImageVector,
    val color: androidx.compose.ui.graphics.Color
)
