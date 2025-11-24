# ✅ Checklist: Configuración Google OAuth para la App

## 📱 Información Actual de la App

**Datos ya configurados en el código:**
- ✅ **Package Name**: `com.sistemahaccp.calidad`
- ✅ **Google Client ID**: `802542269966-jb3ubba1iiq9o4qpm7eakh7d7epheqqu.apps.googleusercontent.com`
- ✅ **Backend URL**: `http://18.216.180.19:3000/api/`
- ✅ **Endpoint Google OAuth**: `/api/auth/google` (✅ YA IMPLEMENTADO)

---

## 🔑 Paso 1: Obtener SHA-1 y SHA-256 de tu Keystore

### Debug Keystore (para desarrollo):

```powershell
cd "d:\Programacion Fuera de la U\AppWino\Sistema de Calidad"

keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**Copia estos valores:**
```
Certificate fingerprints:
  SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
  SHA256: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

### Release Keystore (para producción):

**Primero verifica si tienes un keystore de release:**

```powershell
# Ver si existe archivo keystore.properties
cat "d:\Programacion Fuera de la U\AppWino\Sistema de Calidad\keystore.properties"
```

**Si existe, obtén los SHA:**
```powershell
# Reemplaza con la ruta de tu keystore
keytool -list -v -keystore "RUTA_DE_TU_KEYSTORE.jks" -alias TU_ALIAS
# Te pedirá la contraseña
```

**Si NO tienes keystore de release, usa el de debug por ahora.**

---

## 🌐 Paso 2: Configurar en Google Cloud Console

### A. Acceder a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona el proyecto: **`sistema-haccp-wino`**
   - Si no existe, créalo con ese nombre

### B. Habilitar APIs necesarias

1. Ve a: **APIs & Services** > **Library**
2. Busca y habilita:
   - ✅ **Google Identity Toolkit API**
   - ✅ **Google Sign-In API**

### C. Configurar OAuth Consent Screen

1. Ve a: **APIs & Services** > **OAuth consent screen**
2. Tipo de usuario: **External** (o Internal si es solo para tu organización)
3. Completa:
   ```
   App name: Sistema HACCP Wino
   User support email: [TU_EMAIL]
   Developer contact email: [TU_EMAIL]
   ```
4. En **Scopes**, agrega:
   - `email`
   - `profile`
   - `openid`
5. En **Test users** (MUY IMPORTANTE):
   - Agrega TODOS los emails de Google que usarás para probar
   - Ejemplo: `tumail@gmail.com`, `otro@gmail.com`
6. Click en **SAVE AND CONTINUE**

### D. Crear/Actualizar OAuth 2.0 Client ID

1. Ve a: **APIs & Services** > **Credentials**
2. Click en **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Application type: **Android**
4. Completa:
   ```
   Name: Sistema HACCP Android App
   Package name: com.sistemahaccp.calidad
   SHA-1 certificate fingerprint: [PEGA EL SHA-1 QUE OBTUVISTE]
   ```
5. Click **CREATE**

6. **IMPORTANTE**: Edita el Client ID creado y agrega también el SHA-256:
   - Click en el Client ID
   - Click en **+ ADD FINGERPRINT**
   - Pega el SHA-256
   - Click **SAVE**

### E. Verificar el Client ID

El Client ID generado debe ser:
```
802542269966-jb3ubba1iiq9o4qpm7eakh7d7epheqqu.apps.googleusercontent.com
```

**Si es diferente:**
1. Actualiza `Sistema de Calidad/app/src/main/res/values/strings.xml`:
   ```xml
   <string name="google_client_id" translatable="false">TU_NUEVO_CLIENT_ID</string>
   ```
2. Actualiza `Sistema de Calidad/app/google-services.json` en la sección `oauth_client`

---

## 🔍 Paso 3: Verificar Backend

### A. Verificar que el servidor está funcionando

```bash
# Desde tu máquina local
curl http://18.216.180.19:3000/api/health

# Debería responder:
# {"status":"OK","timestamp":"...","environment":"..."}
```

### B. Verificar endpoint de Google OAuth

```bash
curl -X POST http://18.216.180.19:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}'

# Debería responder con error de token inválido (es lo esperado):
# {"success":false,"error":"Token de Google inválido"...}
```

**Si el endpoint responde con 404**, el código no está actualizado:
```bash
# En el servidor
cd ~/SistemaWino
git pull origin mejoras-app
cd Backend
npm install
pm2 restart wino-backend
```

---

## 📱 Paso 4: Compilar y Probar la App

### A. Limpiar y compilar

```powershell
cd "d:\Programacion Fuera de la U\AppWino\Sistema de Calidad"

# Limpiar proyecto
.\gradlew clean

# Compilar APK de debug
.\gradlew assembleDebug
```

### B. Instalar en dispositivo

```powershell
# Verificar que el dispositivo está conectado
adb devices

# Instalar APK
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

### C. Probar login con Google

1. Abre la app
2. Click en **"Continuar con Google"**
3. Selecciona tu cuenta de Google
4. **Resultado esperado**: Login exitoso y entrada a la app

---

## 🚨 Solución de Problemas

### Error: "No credentials available"

**Causa:** SHA-1/SHA-256 no coincide con el registrado en Google Cloud.

**Solución:**
1. Verifica que el SHA del APK instalado coincida con el registrado
2. Espera 5-10 minutos después de agregar SHA en Google Cloud
3. Desinstala la app y vuelve a instalar

### Error: "Cuenta no autorizada" o "Sign-in failed"

**Causa:** Tu cuenta de Google no está en la lista de Test Users.

**Solución:**
1. Ve a **OAuth consent screen** > **Test users**
2. Agrega tu email de Google
3. Espera 2-3 minutos
4. Intenta de nuevo

### Error: "Token de Google inválido" en el backend

**Causa:** El Client ID configurado en la app no coincide con el del backend.

**Solución:**
1. Verifica que `strings.xml` tenga el Client ID correcto
2. Verifica que el backend tenga el mismo Client ID en `Backend/routes/auth.js`
3. Recompila la app

### Error: "Error validando con el servidor"

**Causa:** El backend no está accesible o no tiene el endpoint implementado.

**Solución:**
1. Verifica que el servidor responda: `curl http://18.216.180.19:3000/api/health`
2. Actualiza el código del servidor con `git pull`
3. Reinicia PM2: `pm2 restart wino-backend`

### App se cierra al hacer login con Google

**Causa:** Crash por falta de permisos o configuración incorrecta.

**Solución:**
1. Conecta el dispositivo y ve los logs:
   ```bash
   adb logcat | grep -i "google\|oauth\|credential"
   ```
2. Busca el error específico en los logs

---

## 📋 Checklist Final

Marca cada punto cuando lo completes:

### Google Cloud Console
- [ ] Proyecto `sistema-haccp-wino` creado/seleccionado
- [ ] APIs habilitadas (Google Identity Toolkit, Google Sign-In)
- [ ] OAuth Consent Screen configurado
- [ ] Test users agregados (tus emails de Google)
- [ ] OAuth 2.0 Client ID creado (tipo Android)
- [ ] SHA-1 del debug keystore agregado
- [ ] SHA-256 del debug keystore agregado
- [ ] Client ID verificado en la app

### Backend
- [ ] Servidor respondiendo en `http://18.216.180.19:3000/api/health`
- [ ] Endpoint `/api/auth/google` funcionando
- [ ] Librería `google-auth-library` instalada
- [ ] PM2 corriendo sin errores

### App Android
- [ ] Package name correcto: `com.sistemahaccp.calidad`
- [ ] Client ID correcto en `strings.xml`
- [ ] `google-services.json` actualizado
- [ ] APK compilado con el keystore correcto
- [ ] SHA del APK coincide con Google Cloud

### Pruebas
- [ ] App instalada en dispositivo
- [ ] Login con email/password funciona
- [ ] Botón "Continuar con Google" visible
- [ ] Selector de cuenta de Google aparece
- [ ] Login con Google exitoso
- [ ] Usuario se crea automáticamente en BD

---

## 📝 Credenciales que Necesito Verificar

**Envíame esta información para ayudarte mejor:**

1. **SHA-1 de tu keystore de debug** (output del comando keytool)
2. **SHA-256 de tu keystore de debug** (output del comando keytool)
3. **Email(s) de Google que usarás para probar** (para verificar Test Users)
4. **Screenshot del OAuth Consent Screen** (para verificar configuración)
5. **Screenshot de las Credentials** (para verificar Client ID y SHAs)
6. **Logs de la app** si hay error (usar `adb logcat`)

---

## 🎯 Resumen Rápido

**Lo que YA está listo:**
- ✅ Backend con endpoint Google OAuth
- ✅ App con botón de Google Sign-In
- ✅ Client ID configurado
- ✅ Código de autenticación completo

**Lo que DEBES hacer:**
1. Obtener SHA-1 y SHA-256 de tu keystore
2. Agregarlos en Google Cloud Console
3. Agregar tu email a Test Users
4. Compilar e instalar la app
5. Probar login con Google

**Tiempo estimado:** 15-20 minutos

---

**Última actualización:** 18 de noviembre de 2025
