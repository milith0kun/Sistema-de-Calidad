package com.example.sistemadecalidad.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.example.sistemadecalidad.navigation.BottomNavItem
import com.example.sistemadecalidad.navigation.NavigationDestinations

/**
 * Barra de navegación inferior para las pantallas principales
 */
@Composable
fun BottomNavigationBar(navController: NavController) {
    val items = listOf(
        BottomNavItem.Dashboard,
        BottomNavItem.Marcaciones,
        BottomNavItem.Historial,
        BottomNavItem.Calidad
    )
    
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    NavigationBar {
        items.forEach { item ->
            NavigationBarItem(
                icon = { 
                    Icon(
                        imageVector = getIconForRoute(item.route),
                        contentDescription = item.title
                    )
                },
                label = { Text(item.title) },
                selected = currentRoute == item.route,
                onClick = {
                    if (currentRoute != item.route) {
                        navController.navigate(item.route) {
                            // Evitar múltiples copias de la misma pantalla
                            popUpTo(navController.graph.startDestinationId) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }
    }
}

/**
 * Obtiene el icono correspondiente para cada ruta
 */
private fun getIconForRoute(route: String): ImageVector {
    return when (route) {
        NavigationDestinations.DASHBOARD -> Icons.Default.Home
        NavigationDestinations.MARCACIONES -> Icons.Default.Info
        NavigationDestinations.HISTORIAL -> Icons.AutoMirrored.Filled.List
        NavigationDestinations.HACCP_MENU -> Icons.Default.CheckCircle
        else -> Icons.Default.Home
    }
}