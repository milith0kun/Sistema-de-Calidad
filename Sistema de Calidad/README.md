# App Android - Sistema de Calidad HACCP

## 📋 Descripción

Aplicación móvil nativa para Android desarrollada en Kotlin con Jetpack Compose. Permite a los empleados fichar asistencias, registrar formularios HACCP y consultar su historial desde dispositivos móviles.

## 🛠️ Tecnologías

- **Lenguaje**: Kotlin 1.9
- **UI Framework**: Jetpack Compose (Material 3)
- **Arquitectura**: MVVM (Model-View-ViewModel)
- **Navegación**: Jetpack Navigation Compose
- **Red**: Retrofit 2.9 + OkHttp 4.12
- **Autenticación**: Firebase Auth + Google Credential Manager API
- **Inyección de Dependencias**: Manual (sin Hilt)
- **Async**: Kotlin Coroutines + Flow
- **Build**: Gradle 8.13 + Kotlin DSL
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 14)

## 📁 Estructura del Proyecto

```
app/
├── build.gradle.kts              # Configuración Gradle (dependencias, versiones)
├── google-services.json          # Configuración Firebase
├── proguard-rules.pro            # Reglas de ofuscación R8/ProGuard
├── keystore/
│   └── haccp-release-upload.jks  # Keystore para firmar releases
├── src/main/
│   ├── AndroidManifest.xml       # Permisos y configuración de la app
│   ├── java/com/example/sistemadecalidad/
│   │   ├── MainActivity.kt                      # Activity principal
│   │   ├── HaccpApplication.kt                  # Application class
│   │   ├── data/                                # Capa de datos
│   │   │   ├── model/
│   │   │   │   ├── User.kt                     # Modelos de usuario
│   │   │   │   ├── Fichaje.kt                  # Modelos de asistencia
│   │   │   │   ├── FormularioHaccp.kt          # Modelos HACCP
│   │   │   │   └── Dashboard.kt                # Modelos dashboard
│   │   │   ├── repository/
│   │   │   │   ├── AuthRepository.kt           # Repo de autenticación
│   │   │   │   ├── FichadoRepository.kt        # Repo de fichajes
│   │   │   │   └── HaccpRepository.kt          # Repo de formularios
│   │   │   ├── remote/
│   │   │   │   ├── ApiService.kt               # Interfaz Retrofit
│   │   │   │   └── RetrofitClient.kt           # Configuración Retrofit
│   │   │   └── auth/
│   │   │       └── GoogleAuthUiClient.kt       # Cliente Google OAuth
│   │   ├── ui/                                  # Capa de UI
│   │   │   ├── theme/
│   │   │   │   ├── Color.kt                    # Paleta de colores
│   │   │   │   ├── Type.kt                     # Tipografía
│   │   │   │   └── Theme.kt                    # Tema Material 3
│   │   │   └── screens/
│   │   │       ├── login/
│   │   │       │   ├── LoginScreen.kt          # Pantalla login
│   │   │       │   └── LoginViewModel.kt       # ViewModel login
│   │   │       ├── dashboard/
│   │   │       │   ├── DashboardScreen.kt      # Pantalla principal
│   │   │       │   └── DashboardViewModel.kt   # ViewModel dashboard
│   │   │       ├── fichado/
│   │   │       │   └── FichadoScreen.kt        # Registro asistencias
│   │   │       ├── haccp/
│   │   │       │   ├── RecepcionMercaderiaScreen.kt
│   │   │       │   ├── LavadoFrutasScreen.kt
│   │   │       │   └── ...
│   │   │       ├── perfil/
│   │   │       │   └── PerfilScreen.kt         # Perfil del usuario
│   │   │       └── register/
│   │   │           └── RegisterScreen.kt       # Registro manual
│   │   ├── navigation/
│   │   │   └── HaccpNavigation.kt              # Navegación de la app
│   │   └── utils/
│   │       ├── LocationHelper.kt               # Helper de GPS
│   │       ├── NotificationHelper.kt           # Notificaciones push
│   │       └── PreferencesManager.kt           # Almacenamiento local
│   └── res/
│       ├── values/
│       │   ├── strings.xml                     # Strings de la app
│       │   ├── colors.xml                      # Colores
│       │   └── themes.xml                      # Temas XML (legacy)
│       ├── drawable/                           # Iconos y recursos gráficos
│       └── mipmap/                             # Iconos de la app
```

## 🏗️ Arquitectura MVVM

```
┌─────────────┐
│   Screen    │  ← Composables (UI)
│  (Compose)  │
└──────┬──────┘
       │ observa StateFlow
┌──────▼──────┐
│  ViewModel  │  ← Lógica de presentación
└──────┬──────┘
       │ llama métodos
┌──────▼──────┐
│ Repository  │  ← Lógica de negocio
└──────┬──────┘
       │ usa
┌──────▼──────┐
│  ApiService │  ← Capa de red (Retrofit)
│   (Retrofit)│
└─────────────┘
```

### Ejemplo de flujo:

```kotlin
// 1. Screen (UI)
@Composable
fun DashboardScreen(viewModel: DashboardViewModel) {
    val state by viewModel.state.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadDashboard()
    }
    
    when (state) {
        is DashboardState.Loading -> CircularProgressIndicator()
        is DashboardState.Success -> DashboardContent(state.data)
        is DashboardState.Error -> ErrorMessage(state.message)
    }
}

// 2. ViewModel
class DashboardViewModel : ViewModel() {
    private val _state = MutableStateFlow<DashboardState>(DashboardState.Loading)
    val state: StateFlow<DashboardState> = _state.asStateFlow()
    
    fun loadDashboard() {
        viewModelScope.launch {
            try {
                val data = repository.getDashboardStats()
                _state.value = DashboardState.Success(data)
            } catch (e: Exception) {
                _state.value = DashboardState.Error(e.message ?: "Error")
            }
        }
    }
}

// 3. Repository
class DashboardRepository(private val apiService: ApiService) {
    suspend fun getDashboardStats(): DashboardData {
        return apiService.getDashboardStats()
    }
}

// 4. ApiService (Retrofit)
interface ApiService {
    @GET("dashboard/stats")
    suspend fun getDashboardStats(): DashboardData
}
```

## 🔐 Autenticación Google OAuth

### Configuración Firebase (ya completada ✅)

**Proyecto Firebase**: `<FIREBASE_PROJECT_ID>`  
**Package Name**: `com.sistemahaccp.calidad`  
**Web Client ID**: `<PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com`

1. **Archivo `google-services.json`** (ya está en `app/`):
   - Contiene configuración del proyecto Firebase
   - Tiene registrados 3 OAuth clients (Debug, Upload, Play Store)
   - **NO modificar** este archivo manualmente

2. **Certificados SHA-1 registrados en Firebase** (3 de 3 ✅):
   ```
   Debug:      <SHA1_DEBUG_KEYSTORE>
   Upload:     <SHA1_UPLOAD_KEYSTORE>
   Play Store: <SHA1_PLAY_STORE_SIGNING>
   ```

3. **Web Client ID en `app/src/main/res/values/strings.xml`**:
   ```xml
   <!-- Este es el Client ID que usa GoogleAuthUiClient.kt -->
   <string name="default_web_client_id"><PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com</string>
   ```

### ⚠️ IMPORTANTE: Credenciales correctas

- ✅ **USAR**: Web Client ID de Firebase (<WEB_CLIENT_ID_HASH>)
- ❌ **NO USAR**: Archivo `client_secret.json` (ya eliminado - era de proyecto antiguo)
- La app usa **Credential Manager API** (no GoogleSignInClient legacy)
- El backend valida tokens con `google-auth-library` en Node.js

### Flujo de autenticación

```kotlin
// GoogleAuthUiClient.kt
class GoogleAuthUiClient(private val context: Context) {
    suspend fun signIn(): GoogleAuthResult {
        val clientId = context.getString(R.string.default_web_client_id)
        
        // Credential Manager API (Android 14+)
        val request = GetCredentialRequest.Builder()
            .addCredentialOption(
                GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId(clientId)
                    .setAutoSelectEnabled(true)
                    .build()
            )
            .build()
        
        try {
            val result = credentialManager.getCredential(context, request)
            val credential = result.credential
            
            if (credential is CustomCredential && 
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                
                val googleIdToken = GoogleIdTokenCredential
                    .createFrom(credential.data)
                    .idToken
                
                // Enviar token al backend para validación
                return GoogleAuthResult.Success(googleIdToken)
            }
        } catch (e: GetCredentialException) {
            return GoogleAuthResult.Error("No se encontraron cuentas de Google")
        }
    }
}
```

### Backend valida el token

```kotlin
// AuthRepository.kt
suspend fun googleLogin(idToken: String): User {
    val response = apiService.googleLogin(GoogleLoginRequest(idToken))
    // Backend valida con google-auth-library y retorna JWT
    return response.user
}
```

## 🌐 Configuración de Red (Retrofit)

```kotlin
// RetrofitClient.kt
object RetrofitClient {
    private const val BASE_URL = "http://18.216.180.19:3000/api/"
    
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val token = getToken()  // Leer de SharedPreferences
            val request = chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .addHeader("Content-Type", "application/json")
                .build()
            chain.proceed(request)
        }
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) 
                HttpLoggingInterceptor.Level.BODY 
            else 
                HttpLoggingInterceptor.Level.NONE
        })
        .build()
    
    val apiService: ApiService = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)
}
```

## 📍 Permisos en AndroidManifest.xml

```xml
<!-- Permisos necesarios -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Opcional para optimizar -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 🔨 Compilación y Build

### Requisitos

- Android Studio Hedgehog | 2023.1.1 o superior
- JDK 21
- Android SDK 36 (Android 14)
- Gradle 8.13

### Configuración del Keystore

Crear archivo `keystore.properties` en la raíz del proyecto:

```properties
RELEASE_STORE_FILE=app/keystore/haccp-release-upload.jks
RELEASE_STORE_PASSWORD=tu_password_del_keystore
RELEASE_KEY_ALIAS=haccp-key
RELEASE_KEY_PASSWORD=tu_password_de_la_key
```

**⚠️ IMPORTANTE**: Este archivo **NO** debe estar en Git (.gitignore)

### Versiones

Configuradas en `app/build.gradle.kts`:

```kotlin
defaultConfig {
    applicationId = "com.sistemahaccp.calidad"
    minSdk = 24
    targetSdk = 36
    versionCode = 8        // Incrementar en cada release
    versionName = "1.0.7"  // Versión visible para usuarios
}
```

### Build Types

```kotlin
buildTypes {
    debug {
        isMinifyEnabled = false
        isShrinkResources = false
        isDebuggable = true
        signingConfig = signingConfigs.getByName("debug")
    }
    
    release {
        isMinifyEnabled = true      // R8 habilitado (ofuscación)
        isShrinkResources = true    // Eliminar recursos no usados
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
        signingConfig = signingConfigs.getByName("release")
        
        ndk {
            debugSymbolLevel = "FULL"  // Símbolos de depuración nativos
        }
    }
}
```

### ProGuard Rules (`proguard-rules.pro`)

```proguard
# Google Identity & Credential Manager
-keep class com.google.android.libraries.identity.googleid.** { *; }
-keep class androidx.credentials.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }

# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }

# Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
```

## 🚀 Comandos de Build

### APK Debug (desarrollo local)

```bash
# Desde la raíz del proyecto
cd "Sistema de Calidad"

# Limpiar build anterior
./gradlew clean

# Compilar APK debug
./gradlew assembleDebug

# Instalar en dispositivo conectado
./gradlew installDebug

# APK generado en:
# app/build/outputs/apk/debug/app-debug.apk
```

### AAB Release (Google Play Store)

```bash
# Compilar Android App Bundle
./gradlew bundleRelease

# AAB generado en:
# app/build/outputs/bundle/release/app-release.aab

# Renombrar con versión
mv app/build/outputs/bundle/release/app-release.aab \
   app/build/outputs/bundle/release/SistemaHACCP-v1.0.7-release.aab
```

### Archivos adicionales para Play Store

```bash
# ProGuard mapping (para decodificar crashes)
app/build/outputs/mapping/release/mapping.txt  (207 MB)

# Símbolos de depuración nativos
app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip  (27 KB)
```

## 📦 Subir a Google Play Console

1. **Ir a Play Console**: https://play.google.com/console
2. **Crear nueva versión** (Prueba interna/cerrada/producción)
3. **Subir archivos**:
   - `SistemaHACCP-v1.0.7-release.aab`
   - `mapping.txt` (en "Archivos de desofuscación")
   - `native-debug-symbols.zip` (opcional)
4. **Completar información**:
   - Nombre de versión: `v1.0.7 — Autenticación Google corregida`
   - Notas de versión (es-419):
     ```
     - Corrección del inicio de sesión con Google
     - Se agregó la huella de firma de Google Play a Firebase
     - Mejoras de rendimiento y optimización (R8)
     - Correcciones menores y estabilidad
     ```
5. **Enviar a revisión**

## 🎨 Tema y Diseño (Material 3)

```kotlin
// Color.kt
val PrimaryColor = Color(0xFF6366F1)      // Indigo
val SecondaryColor = Color(0xFF4ADE80)    // Verde menta
val TertiaryColor = Color(0xFFFBBF24)     // Amarillo

// Theme.kt
@Composable
fun SistemaDeCalidadTheme(content: @Composable () -> Unit) {
    val colorScheme = lightColorScheme(
        primary = PrimaryColor,
        secondary = SecondaryColor,
        tertiary = TertiaryColor,
        background = Color(0xFFF8F9FA),
        surface = Color.White
    )
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

## 🧭 Navegación

```kotlin
// HaccpNavigation.kt
@Composable
fun HaccpNavGraph(navController: NavHostController) {
    NavHost(navController, startDestination = "login") {
        composable("login") {
            LoginScreen(onNavigateToDashboard = {
                navController.navigate("dashboard") {
                    popUpTo("login") { inclusive = true }
                }
            })
        }
        
        composable("dashboard") {
            DashboardScreen(
                onNavigateToFichado = { navController.navigate("fichado") },
                onNavigateToPerfil = { navController.navigate("perfil") }
            )
        }
        
        composable("fichado") {
            FichadoScreen(onNavigateBack = { navController.popBackStack() })
        }
        
        // ... más rutas HACCP
    }
}
```

## 📲 Funcionalidades Principales

### 1. Fichado de Asistencia

```kotlin
@Composable
fun FichadoScreen(viewModel: FichadoViewModel) {
    val location by viewModel.location.collectAsState()
    
    Button(onClick = {
        viewModel.marcarEntrada(location)
    }) {
        Text("Marcar Entrada")
    }
}

// ViewModel
suspend fun marcarEntrada(location: Location?) {
    val fichaje = FichajeRequest(
        tipo = "entrada",
        gps_lat = location?.latitude,
        gps_lon = location?.longitude
    )
    repository.marcarFichaje(fichaje)
}
```

### 2. Formularios HACCP

```kotlin
@Composable
fun RecepcionMercaderiaScreen() {
    var proveedor by remember { mutableStateOf("") }
    var temperatura by remember { mutableStateOf("") }
    var cumpleNormas by remember { mutableStateOf(true) }
    
    OutlinedTextField(
        value = proveedor,
        onValueChange = { proveedor = it },
        label = { Text("Proveedor") }
    )
    
    OutlinedTextField(
        value = temperatura,
        onValueChange = { temperatura = it },
        label = { Text("Temperatura (°C)") },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
    )
    
    Row {
        Text("¿Cumple normas HACCP?")
        Switch(checked = cumpleNormas, onCheckedChange = { cumpleNormas = it })
    }
    
    Button(onClick = {
        viewModel.guardarFormulario(
            tipo = "recepcion_mercaderia",
            datos = FormularioData(proveedor, temperatura, cumpleNormas)
        )
    }) {
        Text("Guardar")
    }
}
```

### 3. Dashboard con Estadísticas

```kotlin
@Composable
fun DashboardContent(stats: DashboardStats) {
    LazyColumn {
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                StatCard(
                    title = "Empleados activos",
                    value = stats.empleadosActivos.toString(),
                    icon = Icons.Default.People
                )
                StatCard(
                    title = "Fichajes hoy",
                    value = stats.fichajesHoy.toString(),
                    icon = Icons.Default.CheckCircle
                )
            }
        }
        
        item {
            Card {
                Text("Formularios pendientes", style = MaterialTheme.typography.headlineSmall)
                stats.formulariosPendientes.forEach { form ->
                    ListItem(
                        headlineContent = { Text(form.nombre) },
                        supportingContent = { Text("Vence: ${form.fechaLimite}") }
                    )
                }
            }
        }
    }
}
```

## 🐛 Debugging

### Logs en Android Studio

```kotlin
// Usar android.util.Log
android.util.Log.d("TAG", "Mensaje de debug")
android.util.Log.e("TAG", "Error", exception)

// Ver logs en Logcat (filtrar por tag o paquete)
adb logcat | Select-String "com.sistemahaccp.calidad"
```

### Inspeccionar Base de Datos (si usas Room)

```bash
adb shell
run-as com.sistemahaccp.calidad
cd databases
sqlite3 haccp.db
.tables
SELECT * FROM usuarios;
```

### Network Inspector (Android Studio)

- View → Tool Windows → App Inspection → Network Inspector
- Ver todas las peticiones HTTP en tiempo real

## 🔧 Troubleshooting

### Error: Google Sign-In no encuentra cuentas

**Causa**: SHA-1 de Google Play no está registrado en Firebase.

**Solución**:
1. Ir a Play Console → App Integrity → App signing key certificate
2. Copiar SHA-1: `<SHA1_PLAY_STORE_SIGNING>`
3. Ir a Firebase Console → Project Settings → Your apps → Add fingerprint
4. Pegar SHA-1 y guardar
5. Descargar nuevo `google-services.json` y reemplazar en `app/`
6. Recompilar y subir nueva versión

### Error: `INSTALL_FAILED_UPDATE_INCOMPATIBLE`

**Causa**: Intentas instalar un APK firmado con certificado diferente al que ya está instalado.

**Solución**:
```bash
adb uninstall com.sistemahaccp.calidad
./gradlew installRelease
```

### Error: R8 rompe Retrofit/Gson

**Solución**: Verificar reglas en `proguard-rules.pro`:
```proguard
-keepattributes Signature
-keep class com.example.sistemadecalidad.data.model.** { *; }
```

## 📚 Dependencias Clave

```kotlin
dependencies {
    // Jetpack Compose
    implementation("androidx.compose.ui:ui:1.7.6")
    implementation("androidx.compose.material3:material3:1.3.1")
    implementation("androidx.navigation:navigation-compose:2.8.5")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    
    // Retrofit
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    
    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-auth-ktx")
    
    // Google Sign In
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    
    // Location
    implementation("com.google.android.gms:play-services-location:21.3.0")
}
```

## 🔗 Enlaces Relacionados

- [Backend (API REST)](../Backend/README.md)
- [WebPanel (Frontend Web)](../WebPanel/README.md)
- [Documentación Principal](../README.md)
- [Google Play Console](https://play.google.com/console)
- [Firebase Console](https://console.firebase.google.com/project/<FIREBASE_PROJECT_ID>)

---

**Versión**: 1.0.7  
**Última actualización**: 24 de noviembre de 2025  
**Package**: `com.sistemahaccp.calidad`
