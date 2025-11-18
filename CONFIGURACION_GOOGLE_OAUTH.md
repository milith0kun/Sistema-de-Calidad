# Configuración de Google OAuth 2.0 para Sistema HACCP

## 📋 Información del Proyecto

- **Proyecto Google Cloud**: `sistema-haccp-wino`
- **Project ID**: `sistema-haccp-wino`
- **Project Number**: `802542269966`
- **Package Name**: `com.sistemahaccp.calidad`
- **Client ID**: `802542269966-jb3ubba1iiq9o4qpm7eakh7d7epheqqu.apps.googleusercontent.com`

---

## 🎯 Pasos de Configuración en Google Cloud Console

### 1. Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto `sistema-haccp-wino` (o créalo si no existe)

### 2. Habilitar APIs Necesarias

1. Ve a **APIs & Services** > **Library**
2. Busca y habilita las siguientes APIs:
   - ✅ **Google Identity Toolkit API** (para autenticación)
   - ✅ **Credential Manager API** (para Android)
   - ✅ **Google+ API** (opcional, para obtener información de perfil)

### 3. Configurar OAuth Consent Screen

1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** (o **Internal** si es solo para tu organización)
3. Completa la información:

   ```
   App name: Sistema HACCP Wino
   User support email: tu-email@gmail.com
   Developer contact email: tu-email@gmail.com
   ```

4. En **Scopes**, agrega:
   - `email`
   - `profile`
   - `openid`

5. En **Test users** (si es External), agrega los correos que usarás para pruebas
6. Guarda y continúa

### 4. Crear Credenciales OAuth 2.0

#### A. Obtener SHA-1 y SHA-256 de tu Keystore

##### Para Debug Keystore:

```powershell
# En Windows PowerShell
cd "d:\Programacion Fuera de la U\AppWino\Sistema de Calidad"

# SHA-1 y SHA-256 del keystore de debug
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**Valores esperados del debug keystore:**
```
SHA1: A4:xx:xx:xx:... (20 bytes en hexadecimal)
SHA256: xx:xx:xx:... (32 bytes en hexadecimal)
```

##### Para Release Keystore:

```powershell
# SHA-1 y SHA-256 del keystore de release (si tienes uno)
keytool -list -v -keystore "app\keystore\tu-keystore.jks" -alias tu-alias
```

**⚠️ IMPORTANTE:** Anota ambos valores (SHA-1 y SHA-256) ya que los necesitarás en el siguiente paso.

#### B. Crear Client ID en Google Cloud

1. Ve a **APIs & Services** > **Credentials**
2. Click en **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Selecciona **Android** como tipo de aplicación
4. Completa los campos:

   ```
   Name: Sistema HACCP Android
   Package name: com.sistemahaccp.calidad
   SHA-1 certificate fingerprint: [PEGA TU SHA-1 AQUÍ]
   ```

5. Click en **CREATE**
6. **REPITE EL PROCESO** para agregar el SHA-256:
   - Edita el Client ID creado
   - Agrega otro **SHA-1 certificate fingerprint** con el valor de SHA-256

**NOTA:** Aunque dice "SHA-1", Google acepta y valida también valores SHA-256.

#### C. Verificar el Client ID

Después de crear, verifica que tu **Client ID** sea:
```
802542269966-jb3ubba1iiq9o4qpm7eakh7d7epheqqu.apps.googleusercontent.com
```

Si es diferente, actualiza los siguientes archivos:

- `Sistema de Calidad/app/src/main/res/values/strings.xml`
- `Sistema de Calidad/app/google-services.json`

---

## 🔧 Configuración en Android Studio

### 1. Verificar google-services.json

El archivo `Sistema de Calidad/app/google-services.json` debe contener:

```json
{
  "project_info": {
    "project_number": "802542269966",
    "project_id": "sistema-haccp-wino"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:802542269966:android:...",
        "android_client_info": {
          "package_name": "com.sistemahaccp.calidad"
        }
      },
      "oauth_client": [
        {
          "client_id": "802542269966-jb3ubba1iiq9o4qpm7eakh7d7epheqqu.apps.googleusercontent.com",
          "client_type": 3
        }
      ]
    }
  ]
}
```

### 2. Verificar strings.xml

El archivo `Sistema de Calidad/app/src/main/res/values/strings.xml` debe tener:

```xml
<string name="google_client_id" translatable="false">802542269966-jb3ubba1iiq9o4qpm7eakh7d7epheqqu.apps.googleusercontent.com</string>
```

### 3. Verificar build.gradle.kts

```kotlin
android {
    defaultConfig {
        applicationId = "com.sistemahaccp.calidad"
        // ...
    }
}
```

---

## 🔑 Agregar Múltiples Huellas SHA

Si vas a compilar con **diferentes keystores** (debug, release, etc.), debes agregar **TODAS** las huellas SHA a Google Cloud:

### Agregar SHA adicionales:

1. Ve a **APIs & Services** > **Credentials**
2. Click en tu **OAuth 2.0 Client ID**
3. En la sección **SHA-1 certificate fingerprints**, click **+ ADD FINGERPRINT**
4. Agrega cada SHA-1 y SHA-256 de cada keystore que uses

**Ejemplo de configuración completa:**
```
✅ SHA-1 Debug: A4:XX:XX:...
✅ SHA-256 Debug: B2:XX:XX:...
✅ SHA-1 Release: C1:XX:XX:...
✅ SHA-256 Release: D3:XX:XX:...
```

---

## 🚀 Compilar y Probar la App

### 1. Limpiar y Reconstruir

```powershell
cd "d:\Programacion Fuera de la U\AppWino\Sistema de Calidad"

# Limpiar proyecto
.\gradlew clean

# Construir APK de debug
.\gradlew assembleDebug

# O construir APK de release
.\gradlew assembleRelease
```

### 2. Instalar en Dispositivo

```powershell
# Instalar debug APK
adb install -r app\build\outputs\apk\debug\app-debug.apk

# O instalar release APK
adb install -r app\build\outputs\apk\release\app-release.apk
```

### 3. Probar Login con Google

1. Abre la app
2. Click en **Iniciar sesión con Google**
3. Selecciona tu cuenta de Google
4. Deberías ver la pantalla de inicio después de autenticarte

---

## 🔍 Solución de Problemas

### Error: "No credentials available"

**Causa:** El SHA-1/SHA-256 no coincide o no está registrado en Google Cloud.

**Solución:**
1. Verifica el SHA con `keytool`
2. Asegúrate de agregarlo a Google Cloud Console
3. Espera 5-10 minutos para que se propague
4. Recompila e instala la app

### Error: "Token de Google inválido"

**Causa:** El Client ID no coincide o el token está mal formado.

**Solución:**
1. Verifica que `strings.xml` tenga el Client ID correcto
2. Verifica que `google-services.json` esté actualizado
3. Limpia y recompila la app

### Error: "Cuenta de Google no autorizada"

**Causa:** El correo no está en la lista de Test Users (si la app está en modo Testing).

**Solución:**
1. Ve a **OAuth consent screen** > **Test users**
2. Agrega el correo que estás usando
3. Intenta de nuevo

### Error: "App not registered in Google Console"

**Causa:** El Package Name no coincide.

**Solución:**
1. Verifica que `applicationId` en `build.gradle.kts` sea `com.sistemahaccp.calidad`
2. Verifica que el Package Name en Google Cloud sea el mismo
3. Recompila la app

---

## 📊 Base de Datos - Manejo de Usuarios

### Estructura de Tabla `usuarios`

```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,                          -- NULL para usuarios de Google
    google_id TEXT UNIQUE,                  -- ID único de Google
    google_photo TEXT,                      -- URL de foto de perfil
    auth_provider TEXT DEFAULT 'local',     -- 'local' o 'google'
    rol TEXT NOT NULL,
    cargo TEXT,
    area TEXT,
    activo BOOLEAN DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Diferencias entre Usuarios Locales y Google

| Campo | Usuario Local | Usuario Google |
|-------|--------------|----------------|
| `email` | ✅ Requerido | ✅ Requerido (de Google) |
| `password` | ✅ Hash bcrypt | ❌ NULL |
| `google_id` | ❌ NULL | ✅ ID de Google (`sub`) |
| `google_photo` | ❌ NULL | ✅ URL de foto |
| `auth_provider` | `'local'` | `'google'` |

### Flujo de Login con Google

1. **App** envía `idToken` al backend
2. **Backend** verifica el token con Google Auth Library
3. **Backend** busca usuario por `google_id` o `email`
4. Si existe:
   - Actualiza `google_photo` si cambió
   - Retorna token JWT
5. Si no existe:
   - Crea nuevo usuario con rol `Supervisor`
   - Retorna token JWT

**NO hay conflictos entre cuentas locales y Google** porque:
- Si un usuario local (con password) inicia sesión con Google usando el mismo email, se actualiza a cuenta Google
- El campo `auth_provider` identifica el tipo de cuenta
- `google_id` es único y solo existe para cuentas Google

---

## 🌐 Configuración del Backend

### Endpoint: POST /api/auth/google

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response exitosa:**
```json
{
  "success": true,
  "message": "Login con Google exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@gmail.com",
    "rol": "Supervisor",
    "cargo": "Personal",
    "area": "General",
    "activo": true,
    "google_photo": "https://lh3.googleusercontent.com/...",
    "auth_provider": "google"
  }
}
```

### Dependencia instalada:

```json
{
  "dependencies": {
    "google-auth-library": "^9.x.x"
  }
}
```

---

## ✅ Checklist Final

Antes de publicar en producción:

- [ ] SHA-1 y SHA-256 del release keystore agregados a Google Cloud
- [ ] OAuth Consent Screen completado y publicado (si es External)
- [ ] Test users agregados (si está en modo Testing)
- [ ] `google-services.json` actualizado con producción
- [ ] Client ID verificado en `strings.xml`
- [ ] Backend en producción con endpoint `/auth/google`
- [ ] Base de datos actualizada con columnas de Google
- [ ] Probado login con múltiples cuentas de Google
- [ ] Probado que usuarios locales siguen funcionando

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Android Studio (Logcat)
2. Revisa los logs del backend (PM2 logs o consola)
3. Verifica la configuración en Google Cloud Console
4. Asegúrate de esperar 5-10 minutos después de cambios en Google Cloud

---

## 🔐 Seguridad

**⚠️ NO COMPARTIR:**
- Archivo `keystore.properties`
- Keystores (`.jks`, `.keystore`)
- Claves privadas
- Tokens JWT

**✅ SÍ PUEDES COMPARTIR:**
- SHA-1 y SHA-256 (son públicos)
- Client ID (es público)
- `google-services.json` (solo tiene IDs públicos)

---

**Última actualización:** 18 de noviembre de 2025
**Versión:** 1.0.0
