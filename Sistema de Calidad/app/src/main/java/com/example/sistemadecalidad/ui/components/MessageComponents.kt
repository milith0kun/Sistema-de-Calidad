package com.example.sistemadecalidad.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

/**
 * Tipos de mensaje disponibles
 */
enum class MessageType {
    SUCCESS, ERROR, WARNING, INFO
}

/**
 * Componente para mostrar mensajes con diferentes tipos y estilos
 */
@Composable
fun MessageCard(
    message: String,
    type: MessageType,
    modifier: Modifier = Modifier,
    onDismiss: (() -> Unit)? = null,
    autoDismissAfter: Long? = null
) {
    // Auto-dismiss después del tiempo especificado
    LaunchedEffect(message, autoDismissAfter) {
        if (autoDismissAfter != null && onDismiss != null) {
            delay(autoDismissAfter)
            onDismiss()
        }
    }
    
    val (backgroundColor, contentColor, icon) = when (type) {
        MessageType.SUCCESS -> Triple(
            Color(0xFF4CAF50).copy(alpha = 0.1f),
            Color(0xFF2E7D32),
            Icons.Default.CheckCircle
        )
        MessageType.ERROR -> Triple(
            Color(0xFFF44336).copy(alpha = 0.1f),
            Color(0xFFC62828),
            Icons.Default.Error
        )
        MessageType.WARNING -> Triple(
            Color(0xFFFF9800).copy(alpha = 0.1f),
            Color(0xFFE65100),
            Icons.Default.Warning
        )
        MessageType.INFO -> Triple(
            Color(0xFF2196F3).copy(alpha = 0.1f),
            Color(0xFF1565C0),
            Icons.Default.Info
        )
    }
    
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = contentColor,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Text(
                text = message,
                color = contentColor,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
            
            if (onDismiss != null) {
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Cerrar",
                        tint = contentColor,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

/**
 * Componente específico para mensajes de éxito
 */
@Composable
fun SuccessMessage(
    message: String,
    modifier: Modifier = Modifier,
    onDismiss: (() -> Unit)? = null,
    autoDismissAfter: Long = 3000L
) {
    MessageCard(
        message = message,
        type = MessageType.SUCCESS,
        modifier = modifier,
        onDismiss = onDismiss,
        autoDismissAfter = autoDismissAfter
    )
}

/**
 * Componente específico para mensajes de error
 */
@Composable
fun ErrorMessage(
    message: String,
    modifier: Modifier = Modifier,
    onDismiss: (() -> Unit)? = null,
    autoDismissAfter: Long? = null
) {
    MessageCard(
        message = message,
        type = MessageType.ERROR,
        modifier = modifier,
        onDismiss = onDismiss,
        autoDismissAfter = autoDismissAfter
    )
}

/**
 * Componente para mostrar el progreso de carga con mensaje
 */
@Composable
fun LoadingMessage(
    message: String = "Guardando...",
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                strokeWidth = 2.dp
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

/**
 * Snackbar personalizado para mensajes rápidos
 */
@Composable
fun CustomSnackbar(
    message: String,
    type: MessageType,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val (backgroundColor, contentColor, icon) = when (type) {
        MessageType.SUCCESS -> Triple(
            Color(0xFF4CAF50),
            Color.White,
            Icons.Default.CheckCircle
        )
        MessageType.ERROR -> Triple(
            Color(0xFFF44336),
            Color.White,
            Icons.Default.Error
        )
        MessageType.WARNING -> Triple(
            Color(0xFFFF9800),
            Color.White,
            Icons.Default.Warning
        )
        MessageType.INFO -> Triple(
            Color(0xFF2196F3),
            Color.White,
            Icons.Default.Info
        )
    }
    
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = contentColor,
                modifier = Modifier.size(20.dp)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Text(
                text = message,
                color = contentColor,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.weight(1f)
            )
        }
    }
}