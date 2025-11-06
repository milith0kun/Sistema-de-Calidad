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
import androidx.navigation.compose.rememberNavController
import com.example.sistemadecalidad.navigation.HaccpNavigation
import com.example.sistemadecalidad.ui.theme.SistemaDeCalidadTheme
import android.util.Log
// import dagger.hilt.android.AndroidEntryPoint

/**
 * Actividad principal de la aplicación HACCP
 * Con soporte para navegación desde notificaciones
 */
// @AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val TAG = "MainActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

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
}