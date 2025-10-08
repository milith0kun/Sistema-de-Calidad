package com.example.sistemadecalidad.navigation

/**
 * Definición de rutas de navegación para la aplicación HACCP
 */
object NavigationDestinations {
    const val WELCOME = "welcome"
    const val LOGIN = "login"
    const val DASHBOARD = "dashboard"
    const val MARCACIONES = "marcaciones"
    const val HISTORIAL = "historial"
    const val ANALITICA = "analitica"
    const val HACCP_MENU = "haccp_menu"
    const val ABOUT = "about"
    // const val LOCATION_SETTINGS = "location_settings" // ELIMINADO - configuración GPS solo desde WebPanel
    
    // Rutas de formularios HACCP (solo los que existen en la base de datos)
    const val RECEPCION_MERCADERIA = "recepcion_mercaderia"
    const val CONTROL_COCCION = "control_coccion"
    const val LAVADO_FRUTAS = "lavado_frutas"
    const val LAVADO_MANOS = "lavado_manos"
    const val TEMPERATURA_CAMARAS = "temperatura_camaras"
    const val RECEPCION_ABARROTES = "recepcion_abarrotes"
}

/**
 * Items de navegación inferior
 */
sealed class BottomNavItem(
    val route: String,
    val title: String,
    val icon: String
) {
    object Dashboard : BottomNavItem(
        route = NavigationDestinations.DASHBOARD,
        title = "Dashboard",
        icon = "home"
    )
    
    object Marcaciones : BottomNavItem(
        route = NavigationDestinations.MARCACIONES,
        title = "Marcaciones",
        icon = "access_time"
    )
    
    object Historial : BottomNavItem(
        route = NavigationDestinations.HISTORIAL,
        title = "Historial",
        icon = "list"
    )
    
    object Calidad : BottomNavItem(
        route = NavigationDestinations.HACCP_MENU,
        title = "Calidad",
        icon = "assignment"
    )
}