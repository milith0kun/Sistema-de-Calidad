# Solución de Problemas - Google OAuth

## Problema Encontrado

**Error:** `BadAuthentication - Long live credential not available`

**Causa:** El SHA-256 del keystore usado para firmar la APK no estaba registrado en Google Cloud Console.

## Keystores Detectados

La app tiene DOS keystores diferentes:

### 1. Debug Keystore
- **Ubicación:** `app/keystore/debug.keystore`
- **SHA-1:** `31:FA:5A:E9:46:6D:CA:FC:B2:73:48:8B:E4:61:20:FB:3E:C8:98:9D`
- **SHA-256:** `E7:44:59:C4:87:D5:6C:A8:9B:89:C3:32:35:F6:A8:10:07:F5:D9:24:C3:DD:E7:6C:CA:0F:86:CB:2A:F0:BD:4E`

### 2. Release Keystore (El que usa Gradle)
- **SHA-1:** `60:E8:B3:C3:F1:1E:9E:6A:3D:E4:7F:06:AA:6D:25:8D:C9:3E:E7:E8`
- **SHA-256:** `75:31:8E:79:1D:E5:7C:68:1F:01:12:8F:B2:B7:81:DC:3C:67:FE:FD:8A:35:7F:5B:77:D8:01:41:B6:6B:EC:68`

## Solución Implementada

### Paso 1: Agregar SHA-256 en Google Cloud Console

1. Ir a: https://console.cloud.google.com/apis/credentials
2. Seleccionar proyecto: **sistema-haccp-wino**
3. Click en Client ID: `802542269966-bg9ron54a1qrtddc23osnbof1unte90v`
4. Agregar **AMBOS** SHA-256:
   - ✅ Debug: `E7:44:59:C4:87:D5:6C:A8:9B:89:C3:32:35:F6:A8:10:07:F5:D9:24:C3:DD:E7:6C:CA:0F:86:CB:2A:F0:BD:4E`
   - ✅ Release: `75:31:8E:79:1D:E5:7C:68:1F:01:12:8F:B2:B7:81:DC:3C:67:FE:FD:8A:35:7F:5B:77:D8:01:41:B6:6B:EC:68`
5. Nombre del paquete: `com.sistemahaccp.calidad`
6. Guardar cambios

### Paso 2: Esperar Propagación

⏳ **Tiempo de espera:** 10-15 minutos

Google necesita propagar los cambios en sus servidores de autenticación.

### Paso 3: Verificar Test Users

Asegurarse de que tu correo esté en la lista de Test Users:

1. Ir a: https://console.cloud.google.com/apis/credentials/consent
2. Sección: **Test users**
3. Verificar que tu email aparece en la lista
4. Estado de la app debe ser: **Testing** (no Producción todavía)

## Cómo Probar

1. Abrir app en el dispositivo
2. Click en **"Continuar con Google"**
3. **Debería aparecer:** Lista de correos de Gmail en tu dispositivo
4. Seleccionar tu cuenta
5. Confirmar permisos
6. Debería autenticarse correctamente

## Comandos para Depuración

### Ver logs de autenticación:
```powershell
adb logcat -c
adb logcat | Select-String -Pattern "GoogleAuth|Credential|sistemahaccp"
```

### Ver errores específicos:
```powershell
adb logcat -d | Select-String "BadAuth|NoCredential|UserRecoverableAuth"
```

### Obtener SHA-256 del keystore actual:
```powershell
cd "Sistema de Calidad"
.\gradlew signingReport | Select-String "SHA"
```

## Errores Comunes

### Error: "BadAuthentication"
- **Causa:** SHA no registrado o no propagado
- **Solución:** Verificar SHA en Google Cloud, esperar 10 minutos

### Error: "No credentials available"
- **Causa:** App no registrada en Google Console
- **Solución:** Verificar Client ID y nombre de paquete

### Error: "Cuenta no autorizada"
- **Causa:** Email no está en Test Users
- **Solución:** Agregar email en OAuth Consent Screen → Test Users

## Información del Proyecto

- **Google Cloud Project:** sistema-haccp-wino (802542269966)
- **Client ID:** 802542269966-bg9ron54a1qrtddc23osnbof1unte90v.apps.googleusercontent.com
- **Tipo:** Android (OAuth 2.0)
- **Package Name:** com.sistemahaccp.calidad
- **Backend URL:** http://18.216.180.19:3000/api/

## Próximos Pasos

1. ✅ SHA-256 agregado en Google Cloud Console
2. ⏳ Esperar 10 minutos para propagación
3. 🧪 Probar autenticación en dispositivo físico
4. 📝 Verificar que usuario se crea en base de datos
5. 🚀 Si funciona, desplegar backend actualizado al servidor

## Fecha de Configuración

**18 de noviembre de 2025**
- SHA-256 Release agregado a Google Cloud Console
- Esperando propagación de cambios
