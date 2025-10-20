package com.example.sistemadecalidad.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.sistemadecalidad.data.api.NetworkModule
import com.example.sistemadecalidad.data.repository.AuthRepository
import com.example.sistemadecalidad.data.repository.FichadoRepository
import com.example.sistemadecalidad.ui.screens.analitica.AnaliticaScreen
import com.example.sistemadecalidad.ui.screens.dashboard.DashboardScreen
import com.example.sistemadecalidad.ui.screens.historial.HistorialScreen
import com.example.sistemadecalidad.ui.screens.login.LoginScreen
import com.example.sistemadecalidad.ui.screens.marcaciones.MarcacionesScreen
// import com.example.sistemadecalidad.ui.screens.settings.NetworkSettingsScreen // ELIMINADO
// import com.example.sistemadecalidad.ui.screens.settings.LocationSettingsScreen // ELIMINADO - configuración GPS solo desde WebPanel
import com.example.sistemadecalidad.ui.screens.about.AboutScreen
import com.example.sistemadecalidad.ui.screens.welcome.WelcomeScreen
import com.example.sistemadecalidad.ui.screens.haccp.HaccpMenuScreen
import com.example.sistemadecalidad.ui.screens.haccp.RecepcionMercaderiaScreen
import com.example.sistemadecalidad.ui.screens.haccp.ControlCoccionScreen
import com.example.sistemadecalidad.ui.screens.haccp.LavadoFrutasScreen
import com.example.sistemadecalidad.ui.screens.haccp.LavadoManosScreen
import com.example.sistemadecalidad.ui.screens.haccp.TemperaturaCamarasScreen
import com.example.sistemadecalidad.ui.screens.haccp.RecepcionAbarrotesScreen
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.ui.viewmodel.AuthViewModel
import com.example.sistemadecalidad.ui.viewmodel.FichadoViewModel
import com.example.sistemadecalidad.utils.LocationManager
import com.google.gson.Gson

/**
 * Configuración principal de navegación para la aplicación HACCP
 * Temporalmente con instanciación manual de ViewModels
 */
@Composable
fun HaccpNavigation(
    navController: NavHostController,
    startDestination: String = NavigationDestinations.WELCOME
) {
    // Crear instancias temporales de dependencias
    val context = LocalContext.current
    val gson = Gson()
    val preferencesManager = PreferencesManager(context, gson)
    val networkModule = NetworkModule
    val apiService = networkModule.provideApiService(
        networkModule.provideRetrofit(
            networkModule.provideGson(),
            context
        )
    )
    val authRepository = AuthRepository(apiService)
    val fichadoRepository = FichadoRepository(apiService)
    val haccpRepository = com.example.sistemadecalidad.data.repository.HaccpRepository(apiService)
    val locationManager = LocationManager(context)
    val authStateManager = networkModule.configureAuthStateManager(context, authRepository)
    val authViewModel = AuthViewModel(authRepository, preferencesManager, authStateManager)
    val fichadoViewModel = FichadoViewModel(fichadoRepository, preferencesManager, locationManager, authStateManager)
    val haccpViewModel = com.example.sistemadecalidad.ui.viewmodel.HaccpViewModel(haccpRepository, preferencesManager)
    
    // Observar el estado de autenticación (solo para lectura, sin redirecciones automáticas)
    val isAuthenticated by authViewModel.isAuthenticated.collectAsStateWithLifecycle()
    
    // NO USAR LaunchedEffect para redirecciones automáticas
    // El logout manual debe manejarse directamente en las pantallas
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Pantalla de bienvenida
        composable(NavigationDestinations.WELCOME) {
            WelcomeScreen(
                onNavigateToLogin = {
                    navController.navigate(NavigationDestinations.LOGIN) {
                        popUpTo(NavigationDestinations.WELCOME) { inclusive = true }
                    }
                }
            )
        }
        
        // Pantalla de login
        composable(NavigationDestinations.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(NavigationDestinations.DASHBOARD) {
                        popUpTo(NavigationDestinations.LOGIN) { inclusive = true }
                    }
                },
                viewModel = authViewModel
            )
        }
        
        // Pantalla principal - Dashboard
        composable(NavigationDestinations.DASHBOARD) {
            DashboardScreen(
                onNavigateToAnalitica = {
                    navController.navigate(NavigationDestinations.ANALITICA)
                },
                onNavigateToMarcaciones = {
                    navController.navigate(NavigationDestinations.MARCACIONES)
                },
                onNavigateToHistorial = {
                    navController.navigate(NavigationDestinations.HISTORIAL)
                },
                onNavigateToHaccp = {
                    navController.navigate(NavigationDestinations.HACCP_MENU)
                },
                onNavigateToAbout = {
                    navController.navigate(NavigationDestinations.ABOUT)
                },
                onLogout = {
                    navController.navigate(NavigationDestinations.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                authViewModel = authViewModel,
                fichadoViewModel = fichadoViewModel
            )
        }
        
        // Pantalla de marcaciones (fichado)
        composable(NavigationDestinations.MARCACIONES) {
            MarcacionesScreen(
                fichadoViewModel = fichadoViewModel,
                onNavigateToDashboard = {
                    navController.navigate(NavigationDestinations.DASHBOARD) {
                        popUpTo(NavigationDestinations.DASHBOARD) { inclusive = true }
                    }
                },
                onNavigateToHistorial = {
                    navController.navigate(NavigationDestinations.HISTORIAL)
                },
                onNavigateToHaccp = {
                    navController.navigate(NavigationDestinations.HACCP_MENU)
                },
                onLogout = {
                    navController.navigate(NavigationDestinations.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
                // onNavigateToLocationSettings eliminado - configuración GPS solo desde WebPanel
            )
        }
        
        // Pantalla de historial
        composable(NavigationDestinations.HISTORIAL) {
            HistorialScreen(
                fichadoViewModel = fichadoViewModel,
                authViewModel = authViewModel,
                onNavigateToDashboard = {
                    navController.navigate(NavigationDestinations.DASHBOARD) {
                        popUpTo(NavigationDestinations.DASHBOARD) { inclusive = true }
                    }
                },
                onNavigateToMarcaciones = {
                    navController.navigate(NavigationDestinations.MARCACIONES)
                },
                onNavigateToHaccp = {
                    navController.navigate(NavigationDestinations.HACCP_MENU)
                },
                onLogout = {
                    navController.navigate(NavigationDestinations.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
        
        // Pantalla de analítica de datos
        composable(NavigationDestinations.ANALITICA) {
            AnaliticaScreen(fichadoViewModel = fichadoViewModel)
        }
        
        // Pantalla de configuración de red - ELIMINADA
        // La configuración de red ahora es automática
        
        // Menú principal de formularios HACCP
        composable(NavigationDestinations.HACCP_MENU) {
            HaccpMenuScreen(
                onNavigateBack = {
                    navController.popBackStack()
                },
                onNavigateToForm = { formId ->
                    navController.navigate(formId)
                }
            )
        }
        
        // Pantalla de configuración de ubicación - ELIMINADA
        // La configuración GPS ahora se realiza únicamente desde el WebPanel por Admins/Supervisores
        // composable(NavigationDestinations.LOCATION_SETTINGS) {
        //     LocationSettingsScreen(
        //         onNavigateBack = {
        //             navController.popBackStack()
        //         }
        //     )
        // }
        
        // Pantalla Acerca de
        composable(NavigationDestinations.ABOUT) {
            AboutScreen(
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        // Formularios HACCP individuales
        composable(NavigationDestinations.RECEPCION_MERCADERIA) {
            RecepcionMercaderiaScreen(
                haccpViewModel = haccpViewModel,
                usuario = preferencesManager.getUser().collectAsState(initial = null).value,
                preferencesManager = preferencesManager,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(NavigationDestinations.CONTROL_COCCION) {
            ControlCoccionScreen(
                haccpViewModel = haccpViewModel,
                preferencesManager = preferencesManager,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(NavigationDestinations.LAVADO_FRUTAS) {
            LavadoFrutasScreen(
                haccpViewModel = haccpViewModel,
                preferencesManager = preferencesManager,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(NavigationDestinations.LAVADO_MANOS) {
            LavadoManosScreen(
                haccpViewModel = haccpViewModel,
                preferencesManager = preferencesManager,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(NavigationDestinations.TEMPERATURA_CAMARAS) {
            TemperaturaCamarasScreen(
                haccpViewModel = haccpViewModel,
                preferencesManager = preferencesManager,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(NavigationDestinations.RECEPCION_ABARROTES) {
            RecepcionAbarrotesScreen(
                haccpViewModel = haccpViewModel,
                preferencesManager = preferencesManager,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}