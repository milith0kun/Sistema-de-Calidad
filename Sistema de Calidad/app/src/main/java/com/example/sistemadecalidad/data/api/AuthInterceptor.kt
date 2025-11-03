package com.example.sistemadecalidad.data.api

import android.content.Context
import android.util.Log
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.auth.AuthStateManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import java.io.IOException
import java.util.concurrent.atomic.AtomicReference

/**
 * Interceptor para manejar automáticamente la autenticación y tokens expirados
 * Funcionalidades:
 * 1. Agrega automáticamente el token Bearer a todas las peticiones
 * 2. Detecta tokens expirados (401/403) y limpia la sesión
 * 3. Usa caché atómico para evitar bloquear el thread principal
 *
 * MEJORA: Evita runBlocking usando caché atómico actualizado en background
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

    // Caché atómico del token (evita runBlocking - MEJORA)
    private val tokenCache = AtomicReference<String?>(null)
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    init {
        // Observar cambios en el token y actualizar caché en background
        scope.launch {
            preferencesManager.getToken().collect { token ->
                tokenCache.set(token)
                Log.d(TAG, "📝 Token actualizado en caché")
            }
        }
    }

    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // Verificar si el endpoint requiere autenticación
        if (isPublicEndpoint(originalRequest)) {
            Log.d(TAG, "🔓 Endpoint público, sin autenticación: ${originalRequest.url}")
            return chain.proceed(originalRequest)
        }

        // Obtener token del caché (sin bloquear)
        val token = tokenCache.get()

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
     * Maneja tokens expirados limpiando la sesión (sin bloquear)
     */
    private fun handleTokenExpired() {
        scope.launch {
            try {
                Log.i(TAG, "🧹 Limpiando sesión por token expirado...")

                // Limpiar caché inmediatamente
                tokenCache.set(null)

                // Notificar al AuthStateManager que el token expiró
                authStateManager.notifyTokenExpired()

                Log.i(TAG, "✅ Sesión limpiada exitosamente")

            } catch (e: Exception) {
                Log.e(TAG, "❌ Error limpiando sesión: ${e.message}")
            }
        }
    }
}