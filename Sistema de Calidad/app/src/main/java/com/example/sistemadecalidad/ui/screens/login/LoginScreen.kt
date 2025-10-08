package com.example.sistemadecalidad.ui.screens.login

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
// import androidx.hilt.navigation.compose.hiltViewModel
import com.example.sistemadecalidad.ui.viewmodel.AuthViewModel

/**
 * Pantalla de login con validación de credenciales
 * Implementa validaciones según especificaciones:
 * - Email debe tener formato válido
 * - Contraseña no puede estar vacía
 * - Deshabilitar botón si campos están incompletos
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToNetworkSettings: () -> Unit = {},
    viewModel: AuthViewModel // = hiltViewModel()
) {
    // Credenciales por defecto según especificaciones del backend
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) } // Toggle para mostrar/ocultar contraseña
    
    // Estados de validación local
    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }
    
    // Observar el estado del ViewModel
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val isAuthenticated by viewModel.isAuthenticated.collectAsStateWithLifecycle()
    
    // Función de validación de email
    fun isValidEmail(email: String): Boolean {
        return email.contains("@") && email.contains(".") && email.length > 5
    }
    
    // Función para validar campos
    fun validateFields(): Boolean {
        var isValid = true
        
        // Validar email
        when {
            email.isBlank() -> {
                emailError = "El email es obligatorio"
                isValid = false
            }
            !isValidEmail(email) -> {
                emailError = "Formato de email inválido"
                isValid = false
            }
            else -> emailError = null
        }
        
        // Validar contraseña
        when {
            password.isBlank() -> {
                passwordError = "La contraseña es obligatoria"
                isValid = false
            }
            password.length < 3 -> {
                passwordError = "La contraseña debe tener al menos 3 caracteres"
                isValid = false
            }
            else -> passwordError = null
        }
        
        return isValid
    }
    
    // Verificar si los campos están completos para habilitar el botón
    val areFieldsComplete = email.isNotBlank() && password.isNotBlank() && isValidEmail(email)
    
    // Navegar automáticamente si ya está autenticado
    LaunchedEffect(isAuthenticated) {
        if (isAuthenticated) {
            onLoginSuccess()
        }
    }
    
    // Verificar conexión al servidor al iniciar
    LaunchedEffect(Unit) {
        viewModel.checkServerConnection()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Título
        Text(
            text = "Iniciar Sesión",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 32.dp)
        )
        
        // Campo de email con validación
        OutlinedTextField(
            value = email,
            onValueChange = { 
                email = it
                emailError = null // Limpiar error local al escribir
                viewModel.clearError() // Limpiar error del servidor
            },
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            singleLine = true,
            enabled = !uiState.isLoading,
            isError = emailError != null,
            supportingText = emailError?.let { { Text(it, color = MaterialTheme.colorScheme.error) } }
        )
        
        // Campo de contraseña con toggle para mostrar/ocultar
        OutlinedTextField(
            value = password,
            onValueChange = { 
                password = it
                passwordError = null // Limpiar error local al escribir
                viewModel.clearError() // Limpiar error del servidor
            },
            label = { Text("Contraseña") },
            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            singleLine = true,
            enabled = !uiState.isLoading,
            isError = passwordError != null,
            supportingText = passwordError?.let { { Text(it, color = MaterialTheme.colorScheme.error) } },
            trailingIcon = {
                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                    Icon(
                        imageVector = if (passwordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                        contentDescription = if (passwordVisible) "Ocultar contraseña" else "Mostrar contraseña"
                    )
                }
            }
        )
        
        // Mensaje de error del servidor
        uiState.errorMessage?.let { message ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Text(
                    text = message,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.padding(16.dp),
                    fontSize = 14.sp
                )
            }
        }
        
        // Botón de login - Deshabilitado si campos están incompletos
        Button(
            onClick = {
                if (validateFields()) {
                    viewModel.login(email, password)
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp), // Altura según especificaciones
            enabled = !uiState.isLoading && areFieldsComplete,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary,
                disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            if (uiState.isLoading) {
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Autenticando...")
                }
            } else {
                Text(
                    text = "Iniciar Sesión",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
        
        // Información de conexión al servidor
        if (uiState.isServerConnected == false) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "⚠️ Sin conexión al servidor",
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        fontWeight = FontWeight.Medium
                    )
                    
                    TextButton(
                        onClick = { viewModel.checkServerConnection() }
                    ) {
                        Text("Verificar conexión")
                    }
                }
            }
        }
        
        // Botón de configuración de red eliminado: la app detecta automáticamente AWS y no requiere configuración manual
        // (Se ha retirado el acceso directo a NetworkSettings desde el login para evitar confusiones)
        
        // Texto de ayuda
        TextButton(
            onClick = { /* TODO: Implementar recuperación de contraseña */ },
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("¿Olvidaste tu contraseña?")
        }
        
        // Tarjeta de credenciales por defecto eliminada para evitar mostrar credenciales en la pantalla de login
    }
}