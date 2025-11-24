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
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.example.sistemadecalidad.R
import kotlinx.coroutines.tasks.await
import java.security.MessageDigest
import java.util.UUID

/**
 * Cliente para manejar autenticación con Google usando Credential Manager API y Firebase Auth
 */
class GoogleAuthUiClient(
    private val context: Context
) {
    private val credentialManager = CredentialManager.create(context)
    private val auth = FirebaseAuth.getInstance()
    
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
        val idToken: String // Token JWT de Google (para compatibilidad con backend actual)
    )
    
    /**
     * Iniciar el flujo de autenticación con Google y luego con Firebase
     */
    suspend fun signIn(): SignInResult {
        return try {
            val result = buildCredentialRequest()
            val googleToken = getGoogleIdToken(result)
            
            if (googleToken != null) {
                signInWithFirebase(googleToken)
            } else {
                SignInResult(
                    data = null,
                    errorMessage = "No se pudo obtener el token de Google"
                )
            }
        } catch (e: androidx.credentials.exceptions.NoCredentialException) {
            android.util.Log.e("GoogleAuthUiClient", "No credentials available", e)
            SignInResult(
                data = null,
                errorMessage = "No se encontraron cuentas de Google."
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
        val rawNonce = UUID.randomUUID().toString()
        val hashedNonce = hashNonce(rawNonce)
        
        // El Web Client ID debe estar configurado en strings.xml
        val clientId = context.getString(R.string.default_web_client_id)
        
        android.util.Log.d("GoogleAuthUiClient", "Using Client ID: $clientId")
        
        val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false) // Mostrar todas las cuentas, no solo autorizadas
            .setServerClientId(clientId)
            .setNonce(hashedNonce)
            .setAutoSelectEnabled(true) // Auto-seleccionar si solo hay una cuenta
            .build()
        
        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()
        
        return credentialManager.getCredential(
            request = request,
            context = context
        )
    }

    /**
     * Extraer el ID Token de la respuesta de Credential Manager
     */
    private fun getGoogleIdToken(result: GetCredentialResponse): String? {
        val credential = result.credential
        if (credential is CustomCredential && 
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            try {
                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                return googleIdTokenCredential.idToken
            } catch (e: GoogleIdTokenParsingException) {
                android.util.Log.e("GoogleAuthUiClient", "Error parseando token", e)
            }
        }
        return null
    }

    /**
     * Iniciar sesión en Firebase con el token de Google
     */
    private suspend fun signInWithFirebase(googleIdToken: String): SignInResult {
        return try {
            val credential = GoogleAuthProvider.getCredential(googleIdToken, null)
            val authResult = auth.signInWithCredential(credential).await()
            val user = authResult.user
            
            // NOTA: Usamos googleIdToken para el backend porque probablemente espera
            // validar contra Google directamente, no contra Firebase Admin.
            // Si el backend usara Firebase Admin, usaríamos user.getIdToken(true)
            
            if (user != null) {
                SignInResult(
                    data = UserData(
                        userId = user.uid,
                        username = user.displayName,
                        email = user.email,
                        profilePictureUrl = user.photoUrl?.toString(),
                        idToken = googleIdToken // Enviamos el token de Google original
                    ),
                    errorMessage = null
                )
            } else {
                SignInResult(
                    data = null,
                    errorMessage = "Error al obtener usuario de Firebase"
                )
            }
        } catch (e: Exception) {
            android.util.Log.e("GoogleAuthUiClient", "Error en Firebase Auth", e)
            SignInResult(
                data = null,
                errorMessage = "Error al iniciar sesión en Firebase: ${e.message}"
            )
        }
    }
    
    suspend fun signOut() {
        try {
            auth.signOut()
            credentialManager.clearCredentialState(androidx.credentials.ClearCredentialStateRequest())
        } catch (e: Exception) {
            android.util.Log.e("GoogleAuthUiClient", "Error en signOut", e)
        }
    }
    
    fun getSignedInUser(): UserData? {
        // No podemos obtener el idToken sincrónicamente desde currentUser
        // Este método solo se usa para verificar si hay sesión activa
        return null
    }
    
    private fun hashNonce(nonce: String): String {
        val bytes = nonce.toByteArray()
        val md = MessageDigest.getInstance("SHA-256")
        val digest = md.digest(bytes)
        return digest.fold("") { str, it -> str + "%02x".format(it) }
    }
}
