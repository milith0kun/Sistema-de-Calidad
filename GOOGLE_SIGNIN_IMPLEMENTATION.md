# Implementación de Google Sign-In

## Resumen
Se implementó autenticación con Google OAuth 2.0 usando Credential Manager API (moderna, recomendada por Google desde Android 14).

## Credenciales OAuth 2.0
**IMPORTANTE**: Las credenciales OAuth están en el archivo `app/src/main/res/values/secrets.xml` (no incluido en Git por seguridad).

Crear el archivo `secrets.xml` con:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="google_client_id">TU_CLIENT_ID_AQUI</string>
    <string name="google_client_secret">TU_CLIENT_SECRET_AQUI</string>
</resources>
```

- **Fecha creación**: 18 de noviembre de 2025
- **Estado**: Habilitada

## Cambios Implementados

### 1. Dependencias (build.gradle.kts)
```kotlin
// Google Sign-In
implementation("com.google.android.gms:play-services-auth:21.0.0")
implementation("androidx.credentials:credentials:1.2.2")
implementation("androidx.credentials:credentials-play-services-auth:1.2.2")
implementation("com.google.android.libraries.identity.googleid:googleid:1.1.0")
```

### 2. Configuración
- **strings.xml**: Agregadas credenciales OAuth
- **google-services.json**: Configuración del proyecto Firebase/Google Cloud

### 3. Código Implementado

#### GoogleAuthUiClient.kt
Clase para manejar autenticación con Google usando Credential Manager API:
- `signIn()`: Inicia flujo de autenticación
- `signOut()`: Cierra sesión
- Genera nonce SHA-256 para seguridad
- Retorna `SignInResult` con datos del usuario e ID token

#### AuthViewModel.kt
Nuevo método `loginWithGoogle()`:
1. Llama a `GoogleAuthUiClient.signIn()`
2. Obtiene ID token de Google
3. Envía token al backend para validación
4. Guarda sesión local
5. Inicia notificaciones

#### AuthRepository.kt
Nuevo método `loginWithGoogle(idToken: String)`:
- Envía ID token al endpoint `/auth/google`
- Retorna `LoginResponse` con token JWT del backend

#### ApiService.kt
Nuevo endpoint:
```kotlin
@POST("auth/google")
suspend fun loginWithGoogle(@Body request: Map<String, String>): Response<LoginResponse>
```

#### LoginScreen.kt
- Agregado botón "Continuar con Google"
- Divisor visual "O" entre login tradicional y Google
- UI consistente con Material Design 3

### 4. Flujo de Autenticación

```
Usuario → Tap "Continuar con Google"
    ↓
App → GoogleAuthUiClient.signIn()
    ↓
Google → Muestra selector de cuentas
    ↓
Usuario → Selecciona cuenta
    ↓
Google → Retorna ID Token JWT
    ↓
App → Envía ID Token al backend (/auth/google)
    ↓
Backend → Valida token con Google API
    ↓
Backend → Crea/actualiza usuario en DB
    ↓
Backend → Genera JWT propio
    ↓
Backend → Retorna LoginResponse
    ↓
App → Guarda sesión (token + user data)
    ↓
App → Navega a Dashboard
```

## Pendiente Backend

### Endpoint requerido: POST /auth/google

```javascript
// Backend/routes/auth.js
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Validar token con Google
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    
    // Buscar o crear usuario
    let user = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (!user) {
      // Crear nuevo usuario
      const [nombre, apellido] = name.split(' ');
      await db.run(
        'INSERT INTO usuarios (email, nombre, apellido, rol) VALUES (?, ?, ?, ?)',
        [email, nombre, apellido || '', 'usuario']
      );
      user = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
    }
    
    // Generar JWT propio
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        cargo: user.cargo
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token de Google inválido' });
  }
});
```

### Variables de entorno necesarias:
```bash
# Usar las mismas credenciales configuradas en secrets.xml del app
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
```

### Dependencia backend:
```bash
npm install google-auth-library
```

## Versión
- **versionCode**: 5
- **versionName**: 1.0.4

## Notas de Seguridad
- El ID token de Google se valida en el backend, no solo en el cliente
- Se genera nonce SHA-256 para prevenir ataques de replay
- El token de Google NO se almacena localmente, solo el JWT del backend
- OAuth tiene límite de 100 usuarios hasta verificar pantalla de consentimiento

## Testing
1. Compilar APK release
2. Instalar en dispositivo con Google Play Services
3. Tap "Continuar con Google"
4. Seleccionar cuenta de Google
5. Verificar que backend valide correctamente
6. Confirmar navegación a Dashboard

## Referencias
- [Credential Manager API](https://developer.android.com/training/sign-in/credential-manager)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
