package com.example.sistemadecalidad.data.api

import android.content.Context
import android.util.Log
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.auth.AuthStateManager
import com.google.gson.Gson
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import java.io.IOException

/**
 * Interceptor para manejar automáticamente la autenticación y tokens expirados
 * Funcionalidades:
 * 1. Agrega automáticamente el token Bearer a todas las peticiones
 * 2. Detecta tokens expirados (401/403) y limpia la sesión
 * 3. Redirige automáticamente al login cuando es necesario
 */
class AuthInterceptor(
    private val context: Context,
    private val preferencesManager: PreferencesManager,
    private val authStateManager: AuthStateManager
) : Interceptor {

    companion object {
        private const val TAG = "AuthInterceptor"
        private const val HEADER_AUTHORIZATION = "Authorization"
        private const val BEARER_PREFIX = "Bearer "
        
        // Endpoints que NO requieren autenticación
        private val PUBLIC_ENDPOINTS = setOf(
            "auth/login",
            "health"
        )
    }

    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Verificar si el endpoint requiere autenticación
        if (isPublicEndpoint(originalRequest)) {
            Log.d(TAG, "🔓 Endpoint público, sin autenticación: ${originalRequest.url}")
            return chain.proceed(originalRequest)
        }

        // Obtener token de forma síncrona
        val token = runBlocking {
            try {
                preferencesManager.getToken().first()
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error obteniendo token: ${e.message}")
                null
            }
        }

        // Si no hay token, proceder sin autenticación (el servidor responderá 401)
        if (token.isNullOrBlank()) {
            Log.w(TAG, "⚠️ No hay token disponible para: ${originalRequest.url}")
            return chain.proceed(originalRequest)
        }

        // Agregar token a la petición
        val authenticatedRequest = originalRequest.newBuilder()
            .header(HEADER_AUTHORIZATION, if (token.startsWith(BEARER_PREFIX)) token else "$BEARER_PREFIX$token")
            .build()

        Log.d(TAG, "🔐 Agregando token a petición: ${authenticatedRequest.url}")

        // Ejecutar petición
        val response = chain.proceed(authenticatedRequest)

        // Manejar respuestas de autenticación fallida
        if (response.code == 401 || response.code == 403) {
            Log.w(TAG, "🚫 Token expirado o inválido (${response.code}) para: ${originalRequest.url}")
            handleTokenExpired()
        }

        return response
    }

    /**
     * Verifica si un endpoint es público (no requiere autenticación)
     */
    private fun isPublicEndpoint(request: Request): Boolean {
        val path = request.url.encodedPath.removePrefix("/api/")
        return PUBLIC_ENDPOINTS.any { endpoint -> path.startsWith(endpoint) }
    }

    /**
     * Maneja tokens expirados limpiando la sesión
     */
    private fun handleTokenExpired() {
        runBlocking {
            try {
                Log.i(TAG, "🧹 Limpiando sesión por token expirado...")
                
                // Notificar al AuthStateManager que el token expiró
                authStateManager.notifyTokenExpired()
                
                Log.i(TAG, "✅ Sesión limpiada exitosamente")
                
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error limpiando sesión: ${e.message}")
            }
        }
    }
}