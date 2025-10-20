package com.example.sistemadecalidad.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.sistemadecalidad.data.model.User
import com.google.gson.Gson
// import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
// import javax.inject.Inject
// import javax.inject.Singleton

/**
 * Gestor de preferencias usando DataStore
 * Temporalmente sin Hilt para pruebas de compilación
 */
// @Singleton
class PreferencesManager /* @Inject constructor */ (
    /* @ApplicationContext */ private val context: Context,
    private val gson: Gson
) {
    
    companion object {
        private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "haccp_preferences")
        
        private val JWT_TOKEN_KEY = stringPreferencesKey("jwt_token")
        private val USER_DATA_KEY = stringPreferencesKey("user_data")
        private val IS_LOGGED_IN_KEY = stringPreferencesKey("is_logged_in")
        
        // Claves para configuración de ubicación
        private val TARGET_LATITUDE_KEY = stringPreferencesKey("target_latitude")
        private val TARGET_LONGITUDE_KEY = stringPreferencesKey("target_longitude")
        private val ALLOWED_RADIUS_KEY = stringPreferencesKey("allowed_radius")
        private val GPS_VALIDATION_ENABLED_KEY = stringPreferencesKey("gps_validation_enabled")
    }
    
    private val dataStore = context.dataStore
    
    /**
     * Guardar token JWT y marcar como logueado
     */
    suspend fun saveToken(token: String) {
        dataStore.edit { preferences ->
            preferences[JWT_TOKEN_KEY] = token
            preferences[IS_LOGGED_IN_KEY] = "true"
        }
    }
    
    /**
     * Obtener token JWT
     */
    fun getToken(): Flow<String?> {
        return dataStore.data.map { preferences ->
            preferences[JWT_TOKEN_KEY]
        }
    }
    
    /**
     * Guardar datos del usuario
     */
    suspend fun saveUser(user: User) {
        android.util.Log.d("PreferencesManager", "=== GUARDANDO USUARIO ===")
        android.util.Log.d("PreferencesManager", "Usuario a guardar: $user")
        android.util.Log.d("PreferencesManager", "JSON a guardar: ${gson.toJson(user)}")
        
        dataStore.edit { preferences ->
            preferences[USER_DATA_KEY] = gson.toJson(user)
            preferences[IS_LOGGED_IN_KEY] = "true"
        }
        
        android.util.Log.d("PreferencesManager", "Usuario guardado exitosamente")
        android.util.Log.d("PreferencesManager", "========================")
    }
    
    /**
     * Obtener datos del usuario
     */
    fun getUser(): Flow<User?> {
        return dataStore.data.map { preferences ->
            val userJson = preferences[USER_DATA_KEY]
            android.util.Log.d("PreferencesManager", "=== RECUPERANDO USUARIO ===")
            android.util.Log.d("PreferencesManager", "JSON recuperado: $userJson")
            
            if (userJson != null) {
                try {
                    val user = gson.fromJson(userJson, User::class.java)
                    android.util.Log.d("PreferencesManager", "Usuario deserializado: $user")
                    android.util.Log.d("PreferencesManager", "===========================")
                    user
                } catch (e: Exception) {
                    android.util.Log.e("PreferencesManager", "Error deserializando usuario: ${e.message}")
                    android.util.Log.d("PreferencesManager", "===========================")
                    null
                }
            } else {
                android.util.Log.d("PreferencesManager", "No hay datos de usuario guardados")
                android.util.Log.d("PreferencesManager", "===========================")
                null
            }
        }
    }
    
    /**
     * Verificar si el usuario está logueado
     */
    fun isLoggedIn(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[IS_LOGGED_IN_KEY] == "true" && 
            preferences[JWT_TOKEN_KEY] != null &&
            preferences[USER_DATA_KEY] != null
        }
    }
    
    /**
     * Cerrar sesión (limpiar todos los datos)
     */
    suspend fun logout() {
        dataStore.edit { preferences ->
            preferences.remove(JWT_TOKEN_KEY)
            preferences.remove(USER_DATA_KEY)
            preferences.remove(IS_LOGGED_IN_KEY)
        }
    }
    
    /**
     * Limpiar solo el token (mantener datos del usuario para re-login)
     */
    suspend fun clearToken() {
        dataStore.edit { preferences ->
            preferences.remove(JWT_TOKEN_KEY)
        }
    }
    
    // Métodos para configuración de ubicación
    suspend fun saveLocationConfig(
        latitude: Double,
        longitude: Double,
        radius: Int,
        gpsEnabled: Boolean
    ) {
        dataStore.edit { preferences ->
            preferences[TARGET_LATITUDE_KEY] = latitude.toString()
            preferences[TARGET_LONGITUDE_KEY] = longitude.toString()
            preferences[ALLOWED_RADIUS_KEY] = radius.toString()
            preferences[GPS_VALIDATION_ENABLED_KEY] = gpsEnabled.toString()
        }
    }
    
    /**
     * Limpiar configuración GPS guardada para forzar nueva sincronización
     */
    suspend fun clearLocationConfig() {
        dataStore.edit { preferences ->
            preferences.remove(TARGET_LATITUDE_KEY)
            preferences.remove(TARGET_LONGITUDE_KEY)
            preferences.remove(ALLOWED_RADIUS_KEY)
            preferences.remove(GPS_VALIDATION_ENABLED_KEY)
        }
        android.util.Log.i("PreferencesManager", "🧹 Configuración GPS limpiada - se usarán valores por defecto hasta nueva sincronización")
    }

    fun getLocationConfig(): Flow<LocationConfig?> {
        return dataStore.data.map { preferences ->
            val lat = preferences[TARGET_LATITUDE_KEY]?.toDoubleOrNull()
            val lon = preferences[TARGET_LONGITUDE_KEY]?.toDoubleOrNull()
            val radius = preferences[ALLOWED_RADIUS_KEY]?.toIntOrNull()
            val gpsEnabled = preferences[GPS_VALIDATION_ENABLED_KEY]?.toBooleanStrictOrNull()
            
            if (lat != null && lon != null && radius != null && gpsEnabled != null) {
                LocationConfig(lat, lon, radius, gpsEnabled)
            } else {
                null
            }
        }
    }
}

// Data class para configuración de ubicación
data class LocationConfig(
    val latitude: Double,
    val longitude: Double,
    val radius: Int,
    val gpsValidationEnabled: Boolean
)