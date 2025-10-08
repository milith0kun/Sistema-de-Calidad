package com.example.sistemadecalidad.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Diálogo que se muestra cuando el token de autenticación expira
 * Informa al usuario sobre la situación y permite redirigir al login
 */
@Composable
fun TokenExpiredDialog(
    onDismiss: () -> Unit,
    onGoToLogin: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = "Token expirado",
                tint = Color(0xFFF44336)
            )
        },
        title = {
            Text(
                text = "Sesión Expirada",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Text(
                text = "Tu sesión ha expirado por motivos de seguridad. Por favor, inicia sesión nuevamente para continuar.",
                fontSize = 16.sp
            )
        },
        confirmButton = {
            Button(
                onClick = {
                    onDismiss()
                    onGoToLogin()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Text("Iniciar Sesión")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cerrar")
            }
        }
    )
}