package com.example.sistemadecalidad.data.auth

import android.content.Context
import android.content.Intent
import android.content.IntentSender
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import com.example.sistemadecalidad.R
import java.security.MessageDigest
import java.util.UUID

/**
 * Cliente para manejar autenticación con Google usando Credential Manager API
 * Implementación moderna recomendada por Google (reemplaza GoogleSignInClient)
 */
class GoogleAuthUiClient(
    private val context: Context
) {
    private val credentialManager = CredentialManager.create(context)
    
    /**
     * Datos del usuario autenticado con Google
     */
    data class SignInResult(
        val data: UserData?,
        val errorMessage: String?
    )
    
    data class UserData(
        val userId: String,
        val username: String?,
        val email: String?,
        val profilePictureUrl: String?,
        val idToken: String  // Token JWT de Google para enviar al backend
    )
    
    /**
     * Iniciar el flujo de autenticación con Google
     * Usa Credential Manager API (Android 14+) con fallback a Play Services
     */
    suspend fun signIn(): SignInResult {
        return try {
            val result = buildCredentialRequest()
            handleSignInResult(result)
        } catch (e: androidx.credentials.exceptions.NoCredentialException) {
            android.util.Log.e("GoogleAuthUiClient", "No credentials available - App not registered in Google Console", e)
            SignInResult(
                data = null,
                errorMessage = "Autenticación con Google no configurada. Contacta al administrador."
            )
        } catch (e: androidx.credentials.exceptions.GetCredentialException) {
            android.util.Log.e("GoogleAuthUiClient", "Credential error: ${e.message}", e)
            SignInResult(
                data = null,
                errorMessage = "Error de autenticación: ${e.message}"
            )
        } catch (e: Exception) {
            android.util.Log.e("GoogleAuthUiClient", "Error en signIn: ${e.message}", e)
            SignInResult(
                data = null,
                errorMessage = "Error inesperado: ${e.message}"
            )
        }
    }
    
    /**
     * Construir la solicitud de credenciales de Google
     */
    private suspend fun buildCredentialRequest(): GetCredentialResponse {
        // Generar nonce único para seguridad (previene ataques de replay)
        val rawNonce = UUID.randomUUID().toString()
        val hashedNonce = hashNonce(rawNonce)
        
        // Configurar opciones para Google ID
        val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false) // Mostrar todas las cuentas de Google
            .setServerClientId(context.getString(R.string.google_client_id))
            .setNonce(hashedNonce) // Prevenir ataques de replay
            .setAutoSelectEnabled(true) // Auto-seleccionar si solo hay una cuenta
            .build()
        
        // Crear request con opciones de Google
        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()
        
        // Ejecutar request (mostrará UI de Google para seleccionar cuenta)
        return credentialManager.getCredential(
            request = request,
            context = context
        )
    }
    
    /**
     * Procesar el resultado de autenticación
     */
    private fun handleSignInResult(result: GetCredentialResponse): SignInResult {
        return when (val credential = result.credential) {
            is CustomCredential -> {
                if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    try {
                        // Parsear credencial de Google
                        val googleIdTokenCredential = GoogleIdTokenCredential
                            .createFrom(credential.data)
                        
                        // Extraer datos del usuario
                        SignInResult(
                            data = UserData(
                                userId = googleIdTokenCredential.id,
                                username = googleIdTokenCredential.displayName,
                                email = googleIdTokenCredential.id, // El ID de Google es el email
                                profilePictureUrl = googleIdTokenCredential.profilePictureUri?.toString(),
                                idToken = googleIdTokenCredential.idToken // Token JWT para backend
                            ),
                            errorMessage = null
                        )
                    } catch (e: GoogleIdTokenParsingException) {
                        android.util.Log.e("GoogleAuthUiClient", "Error parseando token: ${e.message}", e)
                        SignInResult(
                            data = null,
                            errorMessage = "Error al procesar credenciales de Google"
                        )
                    }
                } else {
                    android.util.Log.e("GoogleAuthUiClient", "Tipo de credencial no soportado: ${credential.type}")
                    SignInResult(
                        data = null,
                        errorMessage = "Tipo de credencial no soportado"
                    )
                }
            }
            else -> {
                android.util.Log.e("GoogleAuthUiClient", "Tipo de credencial desconocido")
                SignInResult(
                    data = null,
                    errorMessage = "Error: tipo de credencial desconocido"
                )
            }
        }
    }
    
    /**
     * Cerrar sesión de Google (limpiar caché de Credential Manager)
     * Nota: Credential Manager no tiene método de logout explícito,
     * el logout se maneja desde el AuthViewModel limpiando la sesión local
     */
    suspend fun signOut() {
        // No hay acción específica necesaria con Credential Manager
        // La sesión se limpia desde PreferencesManager en el ViewModel
        android.util.Log.d("GoogleAuthUiClient", "Sesión de Google limpiada")
    }
    
    /**
     * Obtener usuario actual (si existe sesión activa)
     * Con Credential Manager, no hay concepto de "usuario actual" persistente
     * La sesión se maneja completamente desde el backend
     */
    suspend fun getSignedInUser(): UserData? {
        return null // Credential Manager no mantiene estado de sesión
    }
    
    /**
     * Hash del nonce para seguridad
     */
    private fun hashNonce(nonce: String): String {
        val bytes = nonce.toByteArray()
        val md = MessageDigest.getInstance("SHA-256")
        val digest = md.digest(bytes)
        return digest.fold("") { str, it -> str + "%02x".format(it) }
    }
}
