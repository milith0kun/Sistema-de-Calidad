package com.example.sistemadecalidad.ui.screens.register

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
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
import com.example.sistemadecalidad.ui.viewmodel.AuthViewModel

/**
 * Pantalla de registro de nuevos usuarios
 * Incluye validaciones completas y prevención de duplicados
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel
) {
    var nombre by remember { mutableStateOf("") }
    var apellido by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var cargo by remember { mutableStateOf("") }
    var area by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    
    // Estados de validación
    var nombreError by remember { mutableStateOf<String?>(null) }
    var apellidoError by remember { mutableStateOf<String?>(null) }
    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }
    var confirmPasswordError by remember { mutableStateOf<String?>(null) }
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val isAuthenticated by viewModel.isAuthenticated.collectAsStateWithLifecycle()
    
    // Función de validación
    fun isValidEmail(email: String): Boolean {
        return email.contains("@") && email.contains(".") && email.length > 5
    }
    
    fun validateFields(): Boolean {
        var isValid = true
        
        // Validar nombre
        when {
            nombre.isBlank() -> {
                nombreError = "El nombre es obligatorio"
                isValid = false
            }
            nombre.length < 2 -> {
                nombreError = "El nombre debe tener al menos 2 caracteres"
                isValid = false
            }
            else -> nombreError = null
        }
        
        // Validar apellido
        when {
            apellido.isBlank() -> {
                apellidoError = "El apellido es obligatorio"
                isValid = false
            }
            apellido.length < 2 -> {
                apellidoError = "El apellido debe tener al menos 2 caracteres"
                isValid = false
            }
            else -> apellidoError = null
        }
        
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
            password.length < 6 -> {
                passwordError = "La contraseña debe tener al menos 6 caracteres"
                isValid = false
            }
            else -> passwordError = null
        }
        
        // Validar confirmación de contraseña
        when {
            confirmPassword.isBlank() -> {
                confirmPasswordError = "Confirma tu contraseña"
                isValid = false
            }
            password != confirmPassword -> {
                confirmPasswordError = "Las contraseñas no coinciden"
                isValid = false
            }
            else -> confirmPasswordError = null
        }
        
        return isValid
    }
    
    // Verificar campos completos
    val areFieldsComplete = nombre.isNotBlank() && 
                           apellido.isNotBlank() && 
                           email.isNotBlank() && 
                           password.isNotBlank() && 
                           confirmPassword.isNotBlank() &&
                           isValidEmail(email) &&
                           password.length >= 6 &&
                           password == confirmPassword
    
    // Navegar si el registro fue exitoso
    LaunchedEffect(isAuthenticated) {
        if (isAuthenticated) {
            onRegisterSuccess()
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(32.dp))
        
        // Título
        Text(
            text = "Crear Cuenta",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Text(
            text = "Completa tus datos para registrarte",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        // Campo de nombre
        OutlinedTextField(
            value = nombre,
            onValueChange = { 
                nombre = it
                nombreError = null
                viewModel.clearError()
            },
            label = { Text("Nombre *") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            singleLine = true,
            enabled = !uiState.isLoading,
            isError = nombreError != null,
            supportingText = nombreError?.let { { Text(it, color = MaterialTheme.colorScheme.error) } }
        )
        
        // Campo de apellido
        OutlinedTextField(
            value = apellido,
            onValueChange = { 
                apellido = it
                apellidoError = null
                viewModel.clearError()
            },
            label = { Text("Apellido *") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            singleLine = true,
            enabled = !uiState.isLoading,
            isError = apellidoError != null,
            supportingText = apellidoError?.let { { Text(it, color = MaterialTheme.colorScheme.error) } }
        )
        
        // Campo de email
        OutlinedTextField(
            value = email,
            onValueChange = { 
                email = it
                emailError = null
                viewModel.clearError()
            },
            label = { Text("Email *") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            singleLine = true,
            enabled = !uiState.isLoading,
            isError = emailError != null,
            supportingText = emailError?.let { { Text(it, color = MaterialTheme.colorScheme.error) } }
        )
        
        // Campo de contraseña
        OutlinedTextField(
            value = password,
            onValueChange = { 
                password = it
                passwordError = null
                viewModel.clearError()
            },
            label = { Text("Contraseña *") },
            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
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
        
        // Campo de confirmar contraseña
        OutlinedTextField(
            value = confirmPassword,
            onValueChange = { 
                confirmPassword = it
                confirmPasswordError = null
                viewModel.clearError()
            },
            label = { Text("Confirmar Contraseña *") },
            visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            singleLine = true,
            enabled = !uiState.isLoading,
            isError = confirmPasswordError != null,
            supportingText = confirmPasswordError?.let { { Text(it, color = MaterialTheme.colorScheme.error) } },
            trailingIcon = {
                IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                    Icon(
                        imageVector = if (confirmPasswordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                        contentDescription = if (confirmPasswordVisible) "Ocultar contraseña" else "Mostrar contraseña"
                    )
                }
            }
        )
        
        // Campo de cargo (opcional)
        OutlinedTextField(
            value = cargo,
            onValueChange = { cargo = it },
            label = { Text("Cargo (Opcional)") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            singleLine = true,
            enabled = !uiState.isLoading
        )
        
        // Campo de área (opcional)
        OutlinedTextField(
            value = area,
            onValueChange = { area = it },
            label = { Text("Área (Opcional)") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            singleLine = true,
            enabled = !uiState.isLoading
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
        
        // Botón de registro
        Button(
            onClick = {
                if (validateFields()) {
                    viewModel.register(
                        nombre = nombre,
                        apellido = apellido,
                        email = email,
                        password = password,
                        cargo = cargo.ifBlank { "" },
                        area = area.ifBlank { "" }
                    )
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
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
                    Text("Creando cuenta...")
                }
            } else {
                Text(
                    text = "Registrarse",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Enlace para volver al login
        TextButton(
            onClick = onNavigateToLogin,
            enabled = !uiState.isLoading
        ) {
            Text("¿Ya tienes cuenta? Inicia sesión")
        }
    }
}
