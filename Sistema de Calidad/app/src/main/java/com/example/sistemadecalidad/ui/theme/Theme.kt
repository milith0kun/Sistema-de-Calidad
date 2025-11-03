package com.example.sistemadecalidad.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Colores base más suaves y profesionales
private val LightGreen = Color(0xFF4CAF50)
private val LightGreenVariant = Color(0xFF81C784)
private val SoftBlue = Color(0xFF5C6BC0)
private val SoftBlueVariant = Color(0xFF9FA8DA)
private val WarmAmber = Color(0xFFFFB74D)
private val WarmAmberVariant = Color(0xFFFFCC02)
private val SoftRed = Color(0xFFE57373)
private val SoftRedVariant = Color(0xFFEF5350)

// Colores específicos para formularios HACCP - Paleta minimalista y variada
object HaccpColors {
    // Recepción de Frutas y Verduras - Verde suave
    val RecepcionFrutas = Color(0xFFE8F5E8)
    val RecepcionFrutasOnContainer = Color(0xFF2E7D32)
    
    // Control de Cocción - Naranja muy suave
    val ControlCoccion = Color(0xFFFFF3E0)
    val ControlCoccionOnContainer = Color(0xFFE65100)
    
    // Lavado de Frutas - Azul claro
    val LavadoFrutas = Color(0xFFE3F2FD)
    val LavadoFrutasOnContainer = Color(0xFF1565C0)
    
    // Lavado de Manos - Púrpura suave
    val LavadoManos = Color(0xFFF3E5F5)
    val LavadoManosOnContainer = Color(0xFF7B1FA2)
    
    // Temperatura de Cámaras - Cian suave
    val TemperaturaCamaras = Color(0xFFE0F2F1)
    val TemperaturaCamarasOnContainer = Color(0xFF00695C)
    
    // Recepción de Abarrotes - Ámbar muy suave
    val RecepcionAbarrotes = Color(0xFFFFF8E1)
    val RecepcionAbarrotesOnContainer = Color(0xFFFF8F00)
    
    // Control de Higiene Personal - Rosa suave
    val HigienePersonal = Color(0xFFFCE4EC)
    val HigienePersonalOnContainer = Color(0xFFC2185B)
    
    // Limpieza y Desinfección - Gris azulado suave
    val LimpiezaDesinfeccion = Color(0xFFECEFF1)
    val LimpiezaDesinfeccionOnContainer = Color(0xFF455A64)
}

// Colores para el tema claro - Paleta minimalista ultra clara y profesional
private val LightColorScheme = lightColorScheme(
    // Verde muy suave como color principal (confianza, calidad, seguridad)
    primary = Color(0xFF66BB6A),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFF1F8F4),
    onPrimaryContainer = Color(0xFF1B5E20),

    // Gris azulado ultra suave para acciones secundarias
    secondary = Color(0xFF78909C),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF5F7F8),
    onSecondaryContainer = Color(0xFF263238),

    // Verde lima muy claro para elementos terciarios
    tertiary = Color(0xFF9CCC65),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFF9FBF7),
    onTertiaryContainer = Color(0xFF558B2F),

    // Fondos ultra claros y limpios
    background = Color(0xFFFAFAFA),
    onBackground = Color(0xFF212121),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF212121),
    surfaceVariant = Color(0xFFF5F5F5),
    onSurfaceVariant = Color(0xFF616161),

    // Colores de error ultra suaves
    error = Color(0xFFEF9A9A),
    onError = Color.White,
    errorContainer = Color(0xFFFFF5F5),
    onErrorContainer = Color(0xFFC62828),

    // Colores adicionales para estados - muy sutiles
    outline = Color(0xFFE0E0E0),
    outlineVariant = Color(0xFFF0F0F0)
)

// Colores para el tema oscuro - Paleta minimalista adaptada
private val DarkColorScheme = darkColorScheme(
    // Verde más suave para modo oscuro
    primary = Color(0xFF81C784),
    onPrimary = Color(0xFF2E7D32),
    primaryContainer = Color(0xFF388E3C),
    onPrimaryContainer = Color(0xFFC8E6C9),
    
    // Azul grisáceo adaptado para modo oscuro
    secondary = Color(0xFF90A4AE),
    onSecondary = Color(0xFF37474F),
    secondaryContainer = Color(0xFF546E7A),
    onSecondaryContainer = Color(0xFFCFD8DC),
    
    // Verde lima suave para modo oscuro
    tertiary = Color(0xFFAED581),
    onTertiary = Color(0xFF689F38),
    tertiaryContainer = Color(0xFF8BC34A),
    onTertiaryContainer = Color(0xFFDCEDC8),
    
    // Fondos oscuros profesionales
    background = Color(0xFF121212),
    onBackground = Color(0xFFE0E0E0),
    surface = Color(0xFF1E1E1E),
    onSurface = Color(0xFFE0E0E0),
    surfaceVariant = Color(0xFF2C2C2C),
    onSurfaceVariant = Color(0xFFBDBDBD),
    
    // Colores de error suaves para modo oscuro
    error = Color(0xFFEF9A9A),
    onError = Color(0xFFC62828),
    errorContainer = Color(0xFFE57373),
    onErrorContainer = Color(0xFFFFCDD2),
    
    // Colores adicionales para estados en modo oscuro
    outline = Color(0xFF616161),
    outlineVariant = Color(0xFF424242)
)

/**
 * Tema principal de la aplicación Sistema de Calidad
 * Soporta modo claro y oscuro automáticamente
 */
@Composable
fun SistemaDeCalidadTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}