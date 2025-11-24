# Diagnóstico de Google OAuth - Sistema HACCP

**Fecha:** 18 de noviembre de 2025, 20:15 hrs (actualizado 20:45 hrs)
**Estado:** ✅ CAMBIADO A MODO PRODUCCIÓN - Esperando propagación (5-30 min)

---

## ✅ Configuración Verificada

### Client ID (Android)
- **Nombre:** Sistema HACCP Android Debug
- **ID:** `802542269966-bg9ron54a1qrtddc23osnbof1unte90v.apps.googleusercontent.com`
- **Package Name:** `com.sistemahaccp.calidad` ✓
- **SHA-1:** `31:FA:5A:E9:46:6D:CA:FC:B2:73:48:8B:E4:61:20:FB:3E:C8:98:9D` ✓
- **Fecha de creación:** 18 nov 2025, 17:50:47 GMT-5
- **Tiempo desde creación:** ~2.5 horas

### Código de la App
- ✅ `strings.xml` tiene el Client ID correcto
- ✅ `GoogleAuthUiClient.kt` implementado correctamente con Credential Manager API
- ✅ `AuthViewModel` maneja el flujo correctamente
- ✅ APK compilado con el debug keystore correcto

---

## ❌ Error Actual

```
E AuthPII: [RequestTokenManager] getToken() -> BAD_AUTHENTICATION. 
   App: com.sistemahaccp.calidad, Service: oauth2:openid

E GoogleAuthUiClient: No credentials available - App not registered in Google Console

E AuthViewModel: Error Google: Autenticación con Google no configurada. 
   Contacta al administrador.
```

---

## 🔍 Causa Raíz IDENTIFICADA

### ✅ SOLUCIONADO: OAuth Consent Screen cambiado a modo PRODUCCIÓN

**Problema anterior:**
- OAuth Consent Screen estaba en modo "Testing"
- Solo usuarios en lista de "Usuarios de prueba" podían autenticarse
- Generaba error `BAD_AUTHENTICATION`

**Solución aplicada:**
- ✅ Cambiado a modo **PRODUCCIÓN**
- ✅ Ahora CUALQUIER usuario con cuenta de Google puede iniciar sesión
- ⏳ Esperando propagación de Google (5-30 minutos típicamente)

**Estado actual:**
- Configuración: CORRECTA ✅
- Client ID: Correcto ✅
- Package name: Correcto ✅
- SHA-1: Correcto ✅
- OAuth Consent: PRODUCCIÓN ✅
- Propagación: EN PROCESO ⏳

---

## 🧪 Pruebas Realizadas

### Logs Capturados (20:11:17)
```
11-18 20:11:17.739 D AuthViewModel: === INICIANDO LOGIN CON GOOGLE ===
11-18 20:11:17.757 I CredentialManager: starting executeGetCredential 
                      with callingPackage: com.sistemahaccp.calidad
11-18 20:11:17.966 E AuthPII: [RequestTokenManager] getToken() -> BAD_AUTHENTICATION
11-18 20:11:18.269 E GoogleAuthUiClient: No credentials available
11-18 20:11:18.270 E AuthViewModel: Error Google: Autenticación con Google no configurada
```

**Interpretación:**
1. ✅ La app inicia el flujo correctamente (`AuthViewModel` ejecuta)
2. ✅ Credential Manager intenta obtener credenciales
3. ❌ Google Play Services rechaza con `BAD_AUTHENTICATION`
4. ❌ No hay credenciales disponibles (app no reconocida por Google)

---

## 📋 Checklist de Verificación

- [x] Client ID creado correctamente
- [x] Package name coincide: `com.sistemahaccp.calidad`
- [x] SHA-1 correcto en Google Cloud Console
- [x] Código de la app implementado correctamente
- [x] APK compilado con debug keystore correcto
- [x] OAuth Consent Screen cambiado a PRODUCCIÓN ✅
- [ ] Propagación completa (esperando 5-30 minutos)
- [ ] Prueba exitosa con script `.\test-google-login.ps1`

---

## 🛠️ Script de Prueba

Ejecutar cada 30 minutos para verificar si ya funcionó:

```powershell
.\test-google-login.ps1
```

Este script:
1. Limpia caché de Google Play Services
2. Abre la app
3. Presiona el botón de Google
4. Captura logs
5. Analiza si funcionó o qué error tiene

---

## 📞 Próximos Pasos (ACTUALIZADOS)

### 1. Esperar propagación (INMEDIATO)
**Tiempo estimado:** 5-30 minutos desde el cambio a Producción

**Qué hacer:**
- ⏱️ Espera 10-15 minutos
- 🧪 Ejecuta el script de prueba: `.\test-google-login.ps1`
- 🔁 Si sigue fallando, espera otros 10-15 minutos y repite

### 2. Ejecutar script de prueba
```powershell
.\test-google-login.ps1
```

El script:
1. Limpia caché de Google Play Services
2. Abre la app
3. Presiona el botón de Google
4. Captura y analiza logs
5. Te dice si funcionó o qué error tiene

### 3. Prueba manual (alternativa)
Si el script no funciona:
1. Limpia caché: `adb shell pm clear com.google.android.gms`
2. Abre la app manualmente
3. Presiona "Continuar con Google"
4. Debería aparecer selector de cuentas de Google

### 4. Si después de 1 hora sigue fallando
- Verifica que el OAuth Consent Screen siga en modo "Producción"
- Revisa que el Client ID siga activo
- Contacta soporte de Google Cloud (raro que sea necesario)

---

## 🔗 Enlaces Útiles

- **Client ID:** https://console.cloud.google.com/apis/credentials/oauthclient/802542269966-bg9ron54a1qrtddc23osnbof1unte90v?project=sistema-haccp-wino
- **OAuth Consent:** https://console.cloud.google.com/apis/credentials/consent?project=sistema-haccp-wino
- **Proyecto:** https://console.cloud.google.com/apis/credentials?project=sistema-haccp-wino

---

## 📝 Notas

- El SHA-1 usado es del **debug keystore** (`app/keystore/debug.keystore`)
- Para producción, necesitarás agregar otro Client ID con el SHA-1 del **release keystore**
- La propagación de Google es variable: generalmente 15-30 min, pero puede tardar hasta 24 horas
