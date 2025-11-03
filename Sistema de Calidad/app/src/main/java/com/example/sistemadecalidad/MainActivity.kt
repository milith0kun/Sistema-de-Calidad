package com.example.sistemadecalidad

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.rememberNavController
import com.example.sistemadecalidad.navigation.HaccpNavigation
import com.example.sistemadecalidad.ui.theme.SistemaDeCalidadTheme
import com.example.sistemadecalidad.data.api.AutoNetworkDetector
import com.example.sistemadecalidad.utils.NetworkConfig
import kotlinx.coroutines.launch
import android.util.Log
// import dagger.hilt.android.AndroidEntryPoint

/**
 * Actividad principal de la aplicación HACCP
 * Con detección automática de red al inicio y soporte para navegación desde notificaciones
 */
// @AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val TAG = "MainActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Inicializar detección automática de red al inicio
        initializeAutoNetworkDetection()

        // Obtener destino de navegación desde notificación (si existe)
        val notificationDestination = intent?.getStringExtra("navigate_to")

        if (notificationDestination != null) {
            Log.d(TAG, "📱 Abriendo desde notificación, destino: $notificationDestination")
        }

        enableEdgeToEdge()
        setContent {
            SistemaDeCalidadTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // Navegación principal de la aplicación
                    val navController = rememberNavController()
                    HaccpNavigation(
                        navController = navController,
                        notificationDestination = notificationDestination
                    )
                }
            }
        }
    }

    /**
     * Manejar nuevos intents cuando la actividad ya está en ejecución
     */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)

        val notificationDestination = intent.getStringExtra("navigate_to")
        if (notificationDestination != null) {
            Log.d(TAG, "📱 Nuevo intent desde notificación, destino: $notificationDestination")
            // TODO: Implementar navegación en caliente si la app ya está abierta
        }
    }
    
    /**
     * Inicializa la detección automática de red
     * Encuentra automáticamente la mejor URL del servidor disponible
     */
    private fun initializeAutoNetworkDetection() {
        lifecycleScope.launch {
            try {
                Log.d(TAG, "🔍 Iniciando detección automática de red...")
                
                val detector = AutoNetworkDetector(this@MainActivity)
                val bestUrl = detector.detectBestServerUrl()
                
                if (bestUrl != null) {
                    Log.d(TAG, "✅ Servidor encontrado automáticamente: $bestUrl")
                    NetworkConfig.setCustomUrl(this@MainActivity, bestUrl)
                } else {
                    Log.w(TAG, "⚠️ No se pudo detectar servidor automáticamente, usando configuración por defecto")
                    // Usar la configuración por defecto del NetworkConfig
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error en detección automática de red: ${e.message}")
                // Continuar con configuración por defecto en caso de error
            }
        }
    }
}