package com.example.sistemadecalidad.data.api

import android.content.Context
import com.example.sistemadecalidad.BuildConfig
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import android.util.Log
import com.example.sistemadecalidad.data.local.PreferencesManager
import com.example.sistemadecalidad.data.auth.AuthStateManager
import com.example.sistemadecalidad.data.repository.AuthRepository

/**
 * Módulo de red con detección automática de servidor
 * Encuentra automáticamente el servidor disponible sin configuración manual
 */
object NetworkModule {

    private const val TAG = "NetworkModule"

    // URL del servidor AWS EC2 - Producción
    private const val BASE_URL = BuildConfig.BASE_URL_AWS

    fun provideHttpLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    /**
     * Cliente HTTP con timeouts optimizados y headers requeridos
     */
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
            // Interceptor de retry automático para conexiones fallidas
            .addInterceptor { chain ->
                val request = chain.request()
                var response = chain.proceed(request)
                var tryCount = 0
                val maxRetries = 2 // Máximo 2 reintentos adicionales
                
                while (!response.isSuccessful && tryCount < maxRetries) {
                    tryCount++
                    Log.d(TAG, "🔄 Reintentando petición (intento $tryCount/$maxRetries): ${request.url}")
                    response.close()
                    
                    // Esperar un poco antes del reintento (backoff exponencial)
                    Thread.sleep(1000L * tryCount)
                    
                    response = chain.proceed(request)
                }
                
                if (!response.isSuccessful && tryCount >= maxRetries) {
                    Log.w(TAG, "❌ Petición falló después de $maxRetries reintentos: ${request.url}")
                }
                
                response
            }
            .connectTimeout(15, TimeUnit.SECONDS) // Reducido de 30 a 15 segundos
            .readTimeout(20, TimeUnit.SECONDS)    // Reducido de 30 a 20 segundos  
            .writeTimeout(15, TimeUnit.SECONDS)   // Reducido de 30 a 15 segundos
            .build()
    }

    /**
     * Configuración de Gson para parsing JSON
     * Incluye deserializador personalizado para el campo 'activo'
     */
    fun provideGson(): Gson {
        return GsonBuilder()
            //.setLenient() // Deprecated
            .registerTypeAdapter(Boolean::class.java, com.example.sistemadecalidad.data.model.BooleanDeserializer())
            .create()
    }

    /**
     * Cliente Retrofit para comunicación con el backend
     */
    fun provideRetrofit(
        gson: Gson,
        context: Context
    ): Retrofit {
        // Crear interceptores y cliente HTTP
        val loggingInterceptor = provideHttpLoggingInterceptor()
        val okHttpClient = provideOkHttpClient(loggingInterceptor, context)

        Log.d(TAG, "🚀 Retrofit configurado con URL: $BASE_URL")

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    /**
     * Servicio API
     */
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }

    /**
     * Crea un AuthStateManager temporal sin AuthRepository para evitar dependencia circular
     */
    private fun createTemporaryAuthStateManager(context: Context, preferencesManager: PreferencesManager): AuthStateManager {
        // Crear un AuthRepository temporal con un ApiService básico
        val tempRetrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
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
