# 🔑 Credenciales y Configuración de Google OAuth

## ✅ Credenciales ACTUALES en uso

### Proyecto Firebase

- **Nombre**: Sistema de Calidad HACCP
- **Project ID**: `<FIREBASE_PROJECT_ID>` *(ver Firebase Console del proyecto)*
- **Project Number**: `<FIREBASE_PROJECT_NUMBER>`
- **Console**: https://console.firebase.google.com/

### Web Client ID (OAuth 2.0)

```
<PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com
```

> El Web Client ID real está en: Firebase Console → Project Settings → General → Web app, y se inyecta en `strings.xml` y backend desde variables de entorno (no se commitea).

**Usado en**:
- `Backend/routes/auth.js` (línea 12) - Hardcodeado para validar tokens
- `Sistema de Calidad/app/src/main/res/values/strings.xml` - Como `default_web_client_id`
- `Sistema de Calidad/app/google-services.json` - En el campo `client_id` tipo 3

**Propósito**: 
- La app Android obtiene un Google ID Token
- El token tiene como `audience` este Web Client ID
- El backend lo valida con `google-auth-library` y verifica que el `audience` coincida

### Certificados SHA-1 Registrados en Firebase

1. **Debug Keystore** (desarrollo local):
   ```
   <SHA1_DEBUG_KEYSTORE>
   ```
   - Keystore: `~/.android/debug.keystore`
   - Alias: `androiddebugkey`
   - Password: `android` (default público de Android SDK)

2. **Upload Keystore** (firma de AAB para Play Console):
   ```
   <SHA1_UPLOAD_KEYSTORE>
   ```
   - Keystore: `Sistema de Calidad/app/keystore/haccp-release-upload.jks` *(no en git)*
   - Alias: `haccp-key`
   - Password: (en `keystore.properties`, no en git)

3. **Play Store Signing Key** (Google Play re-firma automáticamente):
   ```
   <SHA1_PLAY_STORE_SIGNING>
   ```
   - Manejado por Google Play Console → App Integrity
   - **ESTE es el más importante para producción**

> Los valores reales de los SHA-1 se obtienen con `keytool -list -v ...` (ver sección "Cómo obtener SHA-1") y están registrados en Firebase Console → Project Settings → SHA fingerprints. No es necesario commitearlos.

### API Key de Firebase

```
<FIREBASE_API_KEY>
```

**Ubicación**: `Sistema de Calidad/app/google-services.json` (el archivo real, no este doc)

**Propósito**:
- Autenticación con servicios de Firebase (Auth, Firestore, etc.)
- Técnicamente NO es secreto en el sentido tradicional (Firebase la diseña para estar en el cliente Android)
- **PERO** debe estar protegida en Google Cloud Console con:
  - Restricciones de package name (`com.sistemahaccp.calidad`)
  - Restricciones de SHA-1 (solo APKs firmados con keystores registrados)
  - Firebase Security Rules estrictas

> Aun así, evita pegarla en docs públicos. Mantén el valor solo en `google-services.json`.

---

## ❌ Credenciales OBSOLETAS (ya eliminadas)

### Proyecto Antiguo: app-bienestar (revocado)

- **Client ID**: `<OLD_CLIENT_ID>.apps.googleusercontent.com` ❌ **REVOCADO**
- **Client Secret**: `[REDACTED]` ❌ **REVOCADO Y ELIMINADO**
- **Archivo**: `Sistema de Calidad/app/client_secret.json` ❌ **ELIMINADO**

**Por qué se eliminó**:
1. Era de un proyecto Firebase diferente (`app-bienestar-478220`)
2. La app NO usa `client_secret` - solo usa `google-services.json`
3. Contenía un Client Secret que NO es necesario para apps nativas Android
4. GitHub Secret Scanning lo detectó como credencial expuesta
5. **Las credenciales del proyecto antiguo fueron revocadas** - no son válidas

---

## 🔄 Flujo de Autenticación Actual

```
┌─────────────────┐
│   App Android   │
│   (Credential   │
│   Manager API)  │
└────────┬────────┘
         │ 1. Usuario selecciona cuenta Google
         ▼
┌─────────────────┐
│  Google OAuth   │
│    Servers      │
└────────┬────────┘
         │ 2. Retorna Google ID Token
         │    audience: <WEB_CLIENT_ID>
         ▼
┌─────────────────┐
│   App Android   │
└────────┬────────┘
         │ 3. POST /api/auth/google
         │    body: { idToken: "..." }
         ▼
┌─────────────────┐
│  Backend API    │
│  (Node.js)      │
│                 │
│  google-auth-   │
│  library valida │
│  el token       │
└────────┬────────┘
         │ 4. Token válido ✓
         │    Extrae: email, nombre, googleId
         │    Crea/actualiza usuario en SQLite
         ▼
┌─────────────────┐
│  Backend API    │
│  Genera JWT     │
│  propio         │
└────────┬────────┘
         │ 5. Retorna JWT del backend
         │    + datos de usuario
         ▼
┌─────────────────┐
│   App Android   │
│   Guarda JWT    │
│   en Shared     │
│   Preferences   │
└─────────────────┘
```

---

## 📝 Cómo obtener SHA-1

### Debug Keystore (desarrollo local)

```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

### Upload Keystore (para subir a Play Store)

```bash
keytool -list -v -keystore "Sistema de Calidad/app/keystore/haccp-release-upload.jks" \
  -alias haccp-key
# Pedirá password (ver keystore.properties)
```

### Play Store Signing Key (producción)

1. Ir a: https://play.google.com/console
2. Seleccionar app: Sistema de Calidad HACCP
3. Setup → App Integrity
4. Sección "App signing key certificate"
5. Copiar SHA-1 del certificado

---

## 🛡️ Seguridad

### Archivos que SÍ deben estar en Git

- ✅ `google-services.json` - Configuración pública del proyecto
- ✅ `deployment_cert.der` - Certificado de deployment de Play Console
- ✅ `upload_cert.der` - Certificado de upload keystore
- ✅ `strings.xml` con `default_web_client_id` - Client ID público

### Archivos que NO deben estar en Git

- ❌ `client_secret.json` - Contiene OAuth Client Secret (ya ignorado)
- ❌ `*.jks` - Keystores de firma (contienen claves privadas)
- ❌ `keystore.properties` - Contraseñas de keystores
- ❌ `.env` - Variables de entorno con secretos del backend

### ¿Por qué google-services.json puede estar en Git?

- No contiene secretos privados
- La API Key está protegida por:
  - Restricciones de package name (`com.sistemahaccp.calidad`)
  - Restricciones de SHA-1 (solo APKs firmados con keystores registrados)
  - Firebase Security Rules

---

## 🔧 Mantenimiento

### Si necesitas regenerar credenciales

1. **No toques el Web Client ID** - romperías la autenticación existente
2. Si cambias keystores:
   - Obtén nuevo SHA-1: `keytool -list -v ...`
   - Agrégalo en Firebase Console → Project Settings → Add Fingerprint
   - Descarga nuevo `google-services.json`
   - Reemplaza en `app/`
3. Si subes nueva versión a Play Store:
   - Google Play auto-firma con su propio certificado
   - El SHA-1 ya está registrado (ver Firebase Console)
   - No requiere cambios

### Si el login de Google falla

1. Verificar que los 3 SHA-1 estén en Firebase Console
2. Verificar que `default_web_client_id` en `strings.xml` coincida con Firebase
3. Verificar que backend use el mismo Client ID en `routes/auth.js`
4. Revisar logs:
   - Android: `adb logcat | Select-String "GoogleAuthUiClient"`
   - Backend: `pm2 logs haccp-backend`

---

**Última actualización**: 24 de noviembre de 2025  
**Responsable**: Sistema de Calidad Team
