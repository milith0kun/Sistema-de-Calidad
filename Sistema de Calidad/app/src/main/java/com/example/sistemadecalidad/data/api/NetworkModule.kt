package com.example.sistemadecalidad.data.api

import android.content.Context
import com.google.gson.Gson
import com.google.gson.GsonBuilder
// Imports de Dagger Hilt comentados temporalmente
// import dagger.Module
// import dagger.Provides
// import dagger.hilt.InstallIn
// import dagger.hilt.android.qualifiers.ApplicationContext
// import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
// import javax.inject.Singleton
import kotlinx.coroutines.runBlocking
import android.util.Log
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.auth.AuthStateManager
import com.example.sistemadecalidad.data.repository.AuthRepository

/**
 * Módulo de red con detección automática de servidor
 * Encuentra automáticamente el servidor disponible sin configuración manual
 */
// Anotaciones de Dagger Hilt comentadas temporalmente
// @Module
// @InstallIn(SingletonComponent::class)
object NetworkModule {
    
    private const val TAG = "NetworkModule"
    
    // URL base por defecto - AWS Producción (EC2)
    private const val DEFAULT_BASE_URL = "http://18.216.180.19:3000/api/"

    // URL actual (por defecto servidor local)
    @Volatile
    private var currentBaseUrl: String = DEFAULT_BASE_URL

    /**
     * Detecta automáticamente la mejor URL del servidor
     */
    suspend fun detectAndSetBestUrl(context: Context) {
        try {
            Log.d(TAG, "🔍 Iniciando detección automática de servidor...")
            val detector = AutoNetworkDetector(context)
            val detectedUrl = detector.detectBestServerUrl()
            
            if (detectedUrl != null) {
                currentBaseUrl = detectedUrl
                Log.d(TAG, "✅ Servidor detectado automáticamente: $currentBaseUrl")
            } else {
                Log.w(TAG, "⚠️ No se detectó servidor, usando URL de respaldo: $currentBaseUrl")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error en detección automática: ${e.message}")
            Log.d(TAG, "🔄 Usando URL de respaldo: $currentBaseUrl")
        }
    }
    
    /**
     * Obtiene la URL base actual
     */
    fun getCurrentBaseUrl(): String = currentBaseUrl
    
    /**
     * Configura una URL personalizada (para casos especiales)
     */
    fun setCustomBaseUrl(url: String) {
        currentBaseUrl = if (url.endsWith("/")) url else "$url/"
        Log.d(TAG, "🔧 URL personalizada configurada: $currentBaseUrl")
    }

    // Anotaciones de Dagger Hilt comentadas temporalmente
    // @Provides
    // @Singleton
    fun provideHttpLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    /**
     * Cliente HTTP con timeouts optimizados y headers requeridos
     */
    // Anotaciones de Dagger Hilt comentadas temporalmente
    // @Provides
    // @Singleton
    fun provideOkHttpClient(
        loggingInterceptor: HttpLoggingInterceptor,
        context: Context
    ): OkHttpClient {
        val gson = provideGson()
        val preferencesManager = PreferencesManager(context, gson)
        // Crear AuthStateManager temporal sin AuthRepository para evitar dependencia circular
        val authStateManager = createTemporaryAuthStateManager(context, preferencesManager)
        val authInterceptor = AuthInterceptor(context, preferencesManager, authStateManager)
        
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            // Interceptor de autenticación (debe ir ANTES del interceptor de headers)
            .addInterceptor(authInterceptor)
            // Interceptor para agregar headers requeridos automáticamente
            .addInterceptor { chain ->
                val originalRequest = chain.request()
                val newRequest = originalRequest.newBuilder()
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("User-Agent", "SistemaDeCalidad-Android/1.0")
                    .build()
                chain.proceed(newRequest)
            }
            .connectTimeout(30, TimeUnit.SECONDS)     // Timeout de conexión - 30000ms
            .readTimeout(30, TimeUnit.SECONDS)        // Timeout de lectura - 30000ms  
            .writeTimeout(30, TimeUnit.SECONDS)       // Timeout de escritura - 30000ms
            .build()
    }

    /**
     * Configuración de Gson para parsing JSON
     */
    // Anotaciones de Dagger Hilt comentadas temporalmente
    // @Provides
    // @Singleton
    fun provideGson(): Gson {
        return GsonBuilder()
            .setLenient()
            .create()
    }

    /**
     * Cliente Retrofit con URL dinámica
     */
    // Anotaciones de Dagger Hilt comentadas temporalmente
    // @Provides
    // @Singleton
    fun provideRetrofit(
        gson: Gson,
        context: Context
    ): Retrofit {
        // Detectar automáticamente la mejor URL al crear Retrofit
        runBlocking {
            detectAndSetBestUrl(context)
        }
        
        // Crear interceptores y cliente HTTP
        val loggingInterceptor = provideHttpLoggingInterceptor()
        val okHttpClient = provideOkHttpClient(loggingInterceptor, context)
        
        Log.d(TAG, "🚀 Retrofit configurado con URL: $currentBaseUrl")
        
        return Retrofit.Builder()
            .baseUrl(currentBaseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    /**
     * Servicio API
     */
    // Anotaciones de Dagger Hilt comentadas temporalmente
    // @Provides
    // @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
    
    /**
     * Crea un AuthStateManager temporal sin AuthRepository para evitar dependencia circular
     */
    private fun createTemporaryAuthStateManager(context: Context, preferencesManager: PreferencesManager): AuthStateManager {
        // Crear un AuthRepository temporal con un ApiService básico
        val tempRetrofit = Retrofit.Builder()
            .baseUrl(currentBaseUrl)
            .addConverterFactory(GsonConverterFactory.create(provideGson()))
            .build()
        val tempApiService = tempRetrofit.create(ApiService::class.java)
        val tempAuthRepository = AuthRepository(tempApiService)
        
        return AuthStateManager.getInstance(context, preferencesManager, tempAuthRepository)
    }
    
    /**
     * Configura el AuthStateManager completo con el AuthRepository final
     */
    fun configureAuthStateManager(context: Context, authRepository: AuthRepository): AuthStateManager {
        val gson = provideGson()
        val preferencesManager = PreferencesManager(context, gson)
        return AuthStateManager.getInstance(context, preferencesManager, authRepository)
    }
}