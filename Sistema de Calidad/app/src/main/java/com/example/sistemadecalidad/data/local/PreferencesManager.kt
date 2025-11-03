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

        // Claves para configuración de notificaciones
        private val NOTIFICATIONS_ENABLED_KEY = stringPreferencesKey("notifications_enabled")
        private val WORK_TIME_NOTIFICATIONS_KEY = stringPreferencesKey("work_time_notifications")
        private val HACCP_NOTIFICATIONS_KEY = stringPreferencesKey("haccp_notifications")
        private val NOTIFICATION_SOUND_KEY = stringPreferencesKey("notification_sound")
        private val NOTIFICATION_VIBRATION_KEY = stringPreferencesKey("notification_vibration")

        // Claves para credenciales guardadas (login)
        private val SAVED_EMAIL_KEY = stringPreferencesKey("saved_email")
        private val SAVED_PASSWORD_KEY = stringPreferencesKey("saved_password")
        private val REMEMBER_ME_KEY = stringPreferencesKey("remember_me")
        private val REMEMBER_PASSWORD_KEY = stringPreferencesKey("remember_password")
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

    // ==================== MÉTODOS PARA NOTIFICACIONES ====================

    /**
     * Guardar configuración general de notificaciones
     */
    suspend fun saveNotificationSettings(
        enabled: Boolean,
        workTimeEnabled: Boolean,
        haccpEnabled: Boolean,
        soundEnabled: Boolean,
        vibrationEnabled: Boolean
    ) {
        dataStore.edit { preferences ->
            preferences[NOTIFICATIONS_ENABLED_KEY] = enabled.toString()
            preferences[WORK_TIME_NOTIFICATIONS_KEY] = workTimeEnabled.toString()
            preferences[HACCP_NOTIFICATIONS_KEY] = haccpEnabled.toString()
            preferences[NOTIFICATION_SOUND_KEY] = soundEnabled.toString()
            preferences[NOTIFICATION_VIBRATION_KEY] = vibrationEnabled.toString()
        }
        android.util.Log.d("PreferencesManager", "🔔 Configuración de notificaciones guardada")
    }

    /**
     * Obtener configuración de notificaciones
     */
    fun getNotificationSettings(): Flow<NotificationSettings> {
        return dataStore.data.map { preferences ->
            NotificationSettings(
                enabled = preferences[NOTIFICATIONS_ENABLED_KEY]?.toBooleanStrictOrNull() ?: true,
                workTimeEnabled = preferences[WORK_TIME_NOTIFICATIONS_KEY]?.toBooleanStrictOrNull() ?: true,
                haccpEnabled = preferences[HACCP_NOTIFICATIONS_KEY]?.toBooleanStrictOrNull() ?: true,
                soundEnabled = preferences[NOTIFICATION_SOUND_KEY]?.toBooleanStrictOrNull() ?: true,
                vibrationEnabled = preferences[NOTIFICATION_VIBRATION_KEY]?.toBooleanStrictOrNull() ?: true
            )
        }
    }

    /**
     * Habilitar/deshabilitar todas las notificaciones
     */
    suspend fun setNotificationsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[NOTIFICATIONS_ENABLED_KEY] = enabled.toString()
        }
        android.util.Log.d("PreferencesManager", "🔔 Notificaciones ${if (enabled) "habilitadas" else "deshabilitadas"}")
    }

    /**
     * Habilitar/deshabilitar notificaciones de tiempo de trabajo
     */
    suspend fun setWorkTimeNotificationsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[WORK_TIME_NOTIFICATIONS_KEY] = enabled.toString()
        }
        android.util.Log.d("PreferencesManager", "⏰ Notificaciones de tiempo de trabajo ${if (enabled) "habilitadas" else "deshabilitadas"}")
    }

    /**
     * Habilitar/deshabilitar notificaciones HACCP
     */
    suspend fun setHaccpNotificationsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[HACCP_NOTIFICATIONS_KEY] = enabled.toString()
        }
        android.util.Log.d("PreferencesManager", "📝 Notificaciones HACCP ${if (enabled) "habilitadas" else "deshabilitadas"}")
    }

    /**
     * Verificar si las notificaciones están habilitadas
     */
    fun areNotificationsEnabled(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[NOTIFICATIONS_ENABLED_KEY]?.toBooleanStrictOrNull() ?: true
        }
    }

    // ==================== MÉTODOS PARA CREDENCIALES DE LOGIN ====================

    /**
     * Guardar email para autocompletado en login
     */
    suspend fun saveLoginCredentials(
        email: String, 
        password: String = "",
        rememberEmail: Boolean = false,
        rememberPassword: Boolean = false
    ) {
        dataStore.edit { preferences ->
            // Guardar email si se solicita
            if (rememberEmail) {
                preferences[SAVED_EMAIL_KEY] = email
                preferences[REMEMBER_ME_KEY] = "true"
                android.util.Log.d("PreferencesManager", "💾 Email guardado para autocompletado")
            } else {
                preferences.remove(SAVED_EMAIL_KEY)
                preferences[REMEMBER_ME_KEY] = "false"
                android.util.Log.d("PreferencesManager", "🗑️ Email eliminado")
            }
            
            // Guardar contraseña si se solicita (codificada en Base64 para seguridad básica)
            if (rememberPassword && password.isNotEmpty()) {
                val encodedPassword = android.util.Base64.encodeToString(
                    password.toByteArray(), 
                    android.util.Base64.DEFAULT
                )
                preferences[SAVED_PASSWORD_KEY] = encodedPassword
                preferences[REMEMBER_PASSWORD_KEY] = "true"
                android.util.Log.d("PreferencesManager", "🔐 Contraseña guardada de forma segura")
            } else {
                preferences.remove(SAVED_PASSWORD_KEY)
                preferences[REMEMBER_PASSWORD_KEY] = "false"
                android.util.Log.d("PreferencesManager", "🗑️ Contraseña eliminada")
            }
        }
    }

    /**
     * Obtener email guardado
     */
    fun getSavedEmail(): Flow<String?> {
        return dataStore.data.map { preferences ->
            preferences[SAVED_EMAIL_KEY]
        }
    }

    /**
     * Obtener contraseña guardada (decodificada)
     */
    fun getSavedPassword(): Flow<String?> {
        return dataStore.data.map { preferences ->
            val encodedPassword = preferences[SAVED_PASSWORD_KEY]
            if (encodedPassword != null) {
                try {
                    val decodedBytes = android.util.Base64.decode(encodedPassword, android.util.Base64.DEFAULT)
                    String(decodedBytes)
                } catch (e: Exception) {
                    android.util.Log.e("PreferencesManager", "Error decodificando contraseña: ${e.message}")
                    null
                }
            } else {
                null
            }
        }
    }

    /**
     * Verificar si el usuario eligió recordar email
     */
    fun isRememberMeEnabled(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[REMEMBER_ME_KEY]?.toBooleanStrictOrNull() ?: false
        }
    }

    /**
     * Verificar si el usuario eligió recordar contraseña
     */
    fun isRememberPasswordEnabled(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[REMEMBER_PASSWORD_KEY]?.toBooleanStrictOrNull() ?: false
        }
    }

    /**
     * Obtener credenciales completas guardadas
     */
    fun getSavedCredentials(): Flow<SavedCredentials> {
        return dataStore.data.map { preferences ->
            val email = preferences[SAVED_EMAIL_KEY]
            val encodedPassword = preferences[SAVED_PASSWORD_KEY]
            val rememberEmail = preferences[REMEMBER_ME_KEY]?.toBooleanStrictOrNull() ?: false
            val rememberPassword = preferences[REMEMBER_PASSWORD_KEY]?.toBooleanStrictOrNull() ?: false
            
            val password = if (encodedPassword != null) {
                try {
                    val decodedBytes = android.util.Base64.decode(encodedPassword, android.util.Base64.DEFAULT)
                    String(decodedBytes)
                } catch (e: Exception) {
                    android.util.Log.e("PreferencesManager", "Error decodificando contraseña: ${e.message}")
                    null
                }
            } else {
                null
            }
            
            SavedCredentials(
                email = email,
                password = password,
                rememberEmail = rememberEmail,
                rememberPassword = rememberPassword
            )
        }
    }

    /**
     * Limpiar credenciales guardadas
     */
    suspend fun clearSavedCredentials() {
        dataStore.edit { preferences ->
            preferences.remove(SAVED_EMAIL_KEY)
            preferences.remove(SAVED_PASSWORD_KEY)
            preferences.remove(REMEMBER_ME_KEY)
            preferences.remove(REMEMBER_PASSWORD_KEY)
        }
        android.util.Log.d("PreferencesManager", "🗑️ Todas las credenciales de login limpiadas")
    }
}

// Data class para configuración de ubicación
data class LocationConfig(
    val latitude: Double,
    val longitude: Double,
    val radius: Int,
    val gpsValidationEnabled: Boolean
)

// Data class para configuración de notificaciones
data class NotificationSettings(
    val enabled: Boolean = true,
    val workTimeEnabled: Boolean = true,
    val haccpEnabled: Boolean = true,
    val soundEnabled: Boolean = true,
    val vibrationEnabled: Boolean = true
)

/**
 * Clase de datos para credenciales guardadas
 */
data class SavedCredentials(
    val email: String? = null,
    val password: String? = null,
    val rememberEmail: Boolean = false,
    val rememberPassword: Boolean = false
)