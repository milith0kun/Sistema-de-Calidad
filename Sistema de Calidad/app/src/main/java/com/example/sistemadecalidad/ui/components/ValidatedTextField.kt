package com.example.sistemadecalidad.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp

/**
 * Campo de texto con validación integrada
 * Proporciona feedback visual inmediato al usuario
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ValidatedTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    isRequired: Boolean = false,
    errorMessage: String? = null,
    keyboardType: KeyboardType = KeyboardType.Text,
    maxLines: Int = 1,
    enabled: Boolean = true,
    placeholder: String? = null,
    validator: ((String) -> String?)? = null
) {
    var hasBeenFocused by remember { mutableStateOf(false) }
    var currentError by remember { mutableStateOf<String?>(null) }
    
    // Validar cuando el valor cambia y el campo ha sido enfocado
    LaunchedEffect(value, hasBeenFocused) {
        if (hasBeenFocused) {
            currentError = when {
                isRequired && value.isBlank() -> "$label es obligatorio"
                validator != null -> validator(value)
                else -> null
            }
        }
    }
    
    // Usar el error externo si está disponible, sino usar el error interno
    val displayError = errorMessage ?: currentError
    val isError = displayError != null
    
    Column(modifier = modifier) {
        OutlinedTextField(
            value = value,
            onValueChange = { newValue ->
                onValueChange(newValue)
                // Validar inmediatamente si el campo ya ha sido enfocado
                if (hasBeenFocused) {
                    currentError = when {
                        isRequired && newValue.isBlank() -> "$label es obligatorio"
                        validator != null -> validator(newValue)
                        else -> null
                    }
                }
            },
            label = { 
                Text(
                    text = if (isRequired) "$label *" else label,
                    color = if (isError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            placeholder = placeholder?.let { { Text(it) } },
            isError = isError,
            enabled = enabled,
            maxLines = maxLines,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            colors = OutlinedTextFieldDefaults.colors(
                errorBorderColor = MaterialTheme.colorScheme.error,
                errorLabelColor = MaterialTheme.colorScheme.error,
                errorTextColor = MaterialTheme.colorScheme.onSurface
            ),
            modifier = Modifier
                .fillMaxWidth()
                .then(
                    if (!hasBeenFocused) {
                        Modifier.onFocusChanged { focusState ->
                            if (focusState.isFocused) {
                                hasBeenFocused = true
                            }
                        }
                    } else Modifier
                )
        )
        
        // Mostrar mensaje de error
        if (isError && displayError != null) {
            Text(
                text = displayError,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(start = 16.dp, top = 4.dp)
            )
        }
    }
}

/**
 * Validadores comunes para usar con ValidatedTextField
 */
object FieldValidators {
    
    fun required(fieldName: String): (String) -> String? = { value ->
        if (value.isBlank()) "$fieldName es obligatorio" else null
    }
    
    fun positiveNumber(fieldName: String, maxValue: Double? = null): (String) -> String? = { value ->
        when {
            value.isBlank() -> "$fieldName es obligatorio"
            value.toDoubleOrNull() == null -> "$fieldName debe ser un número válido"
            value.toDouble() <= 0 -> "$fieldName debe ser mayor a 0"
            maxValue != null && value.toDouble() > maxValue -> "$fieldName no puede ser mayor a $maxValue"
            else -> null
        }
    }
    
    fun nonEmptySelection(fieldName: String): (String) -> String? = { value ->
        if (value.isBlank()) "Debe seleccionar $fieldName" else null
    }
    
    fun minLength(fieldName: String, minLength: Int): (String) -> String? = { value ->
        when {
            value.isBlank() -> "$fieldName es obligatorio"
            value.length < minLength -> "$fieldName debe tener al menos $minLength caracteres"
            else -> null
        }
    }
    
    fun maxLength(fieldName: String, maxLength: Int): (String) -> String? = { value ->
        if (value.length > maxLength) "$fieldName no puede tener más de $maxLength caracteres" else null
    }
}