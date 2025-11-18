# Configuración de Google OAuth 2.0

## ⚠️ Problema Actual

La app muestra: **"No credentials available"** al intentar login con Google.

**Causa**: El SHA-1 fingerprint del APK no está registrado en Google Cloud Console.

## 🔑 SHA-1 Fingerprints de tu App

### Debug (para desarrollo):
```
SHA-1: 31:FA:5A:E9:46:6D:CA:FC:B2:73:48:8B:E4:61:20:FB:3E:C8:98:9D
Package Name: com.sistemahaccp.calidad
```

### Release (para producción):
```
SHA-1: 60:E8:B3:C3:F1:1E:9E:6A:3D:E4:7F:06:AA:6D:25:8D:C9:3E:E7:E8
Package Name: com.sistemahaccp.calidad
```

## 📋 Pasos para Configurar Google Cloud Console

### 1. Ir a Google Cloud Console
1. Abre: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google

### 2. Seleccionar/Crear Proyecto
1. En la parte superior, haz clic en el selector de proyectos
2. Si ya tienes el proyecto "sistema-haccp-wino", selecciónalo
3. Si no, crea uno nuevo:
   - Clic en "Nuevo Proyecto"
   - Nombre: `sistema-haccp-wino`
   - Clic en "Crear"

### 3. Habilitar Google Sign-In API
1. En el menú lateral → **APIs y servicios** → **Biblioteca**
2. Busca: `Google Sign-In API` o `Google Identity`
3. Clic en **Habilitar**

### 4. Configurar Pantalla de Consentimiento OAuth
1. Ve a: **APIs y servicios** → **Pantalla de consentimiento de OAuth**
2. Selecciona **Externo** (o Interno si es Workspace)
3. Completa la información:
   - **Nombre de la app**: Sistema HACCP
   - **Correo de asistencia**: tu-email@gmail.com
   - **Logo** (opcional)
   - **Dominios autorizados**: (déjalo vacío por ahora)
   - **Correo del desarrollador**: tu-email@gmail.com
4. Clic en **Guardar y continuar**
5. En **Alcances**: Clic en **Guardar y continuar** (usa los predeterminados)
6. En **Usuarios de prueba**: 
   - Agrega tu email y emails de usuarios que probarán la app
   - Clic en **Guardar y continuar**

### 5. Crear Credenciales OAuth 2.0

#### A. Crear Client ID tipo "Web Application" (IMPORTANTE)
1. Ve a: **APIs y servicios** → **Credenciales**
2. Clic en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth 2.0**
3. Tipo de aplicación: **Aplicación web**
4. Nombre: `Sistema HACCP Web Client`
5. **Orígenes de JavaScript autorizados**: (déjalo vacío)
6. **URIs de redireccionamiento autorizados**: (déjalo vacío)
7. Clic en **Crear**
8. **GUARDA EL CLIENT ID** (formato: `XXXXXXX-XXXXXXXXXXXXXXXX.apps.googleusercontent.com`)

#### B. Agregar SHA-1 Fingerprints (CRÍTICO)
1. En la misma página de **Credenciales**
2. Busca la sección **Claves de API** o crea una nueva credencial:
   - Clic en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth 2.0**
   - Tipo: **Android**
3. Configura:
   - **Nombre**: `Sistema HACCP Android Debug`
   - **Nombre del paquete**: `com.sistemahaccp.calidad`
   - **Huella digital del certificado SHA-1**: 
     ```
     31:FA:5A:E9:46:6D:CA:FC:B2:73:48:8B:E4:61:20:FB:3E:C8:98:9D
     ```
4. Clic en **Crear**

5. **Repite para Release**:
   - Nombre: `Sistema HACCP Android Release`
   - Nombre del paquete: `com.sistemahaccp.calidad`
   - SHA-1:
     ```
     60:E8:B3:C3:F1:1E:9E:6A:3D:E4:7F:06:AA:6D:25:8D:C9:3E:E7:E8
     ```

### 6. Verificar Client ID en la App

1. Abre: `Sistema de Calidad/app/src/main/res/values/strings.xml`
2. Verifica que `google_client_id` sea el **Web Application Client ID** (NO el Android Client ID):
   ```xml
   <string name="google_client_id">TU-WEB-CLIENT-ID.apps.googleusercontent.com</string>
   ```

### 7. Esperar Propagación
⏰ **Importante**: Los cambios pueden tardar **5-10 minutos** en propagarse.

## 🧪 Probar la Configuración

### Método 1: Recompilar e Instalar
```bash
cd "Sistema de Calidad"
.\gradlew clean assembleDebug
adb install -r app/build/outputs/apk/debug/SistemaHACCP-v1.0.4-debug.apk
```

### Método 2: Verificar en Logs
```bash
adb logcat | Select-String "GoogleAuth|Credential"
```

Si ves:
- ✅ "Successfully signed in" → Funciona!
- ❌ "not registered" → Verifica SHA-1 y Client ID
- ❌ "No credentials" → Espera 5-10 minutos

## 🔧 Comandos Útiles

### Obtener SHA-1 en cualquier momento:
```bash
cd "Sistema de Calidad"
.\gradlew signingReport
```

### Verificar package name instalado:
```bash
adb shell pm list packages | Select-String "haccp"
```

### Ver Client ID configurado en la app:
```bash
adb shell "cat /data/app/*/com.sistemahaccp.calidad*/base.apk" | Select-String "client_id"
```

## ✅ Checklist Final

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google Sign-In API habilitada
- [ ] Pantalla de consentimiento configurada
- [ ] Client ID tipo "Web Application" creado
- [ ] SHA-1 Debug agregado (tipo Android)
- [ ] SHA-1 Release agregado (tipo Android)
- [ ] Client ID correcto en `strings.xml`
- [ ] Esperado 5-10 minutos
- [ ] App recompilada e instalada
- [ ] Probado login con Google

## 🆘 Troubleshooting

### Error: "not registered to use OAuth2.0"
- Verifica que el SHA-1 esté correctamente copiado (sin espacios)
- Confirma que el package name sea exactamente: `com.sistemahaccp.calidad`
- Espera 10 minutos y vuelve a intentar

### Error: "No credentials available"
- Verifica que uses el **Web Application Client ID**, NO el Android Client ID
- Confirma que Google Play Services esté actualizado en el celular

### Error: "API key not valid"
- Verifica que Google Sign-In API esté habilitada
- Revisa que no haya restricciones en el Client ID

### Login funciona pero backend falla
- Implementa el endpoint `/auth/google` en el backend
- Verifica que el backend valide el ID token con Google

## 📚 Referencias

- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android/start-integrating)
- [Credential Manager](https://developer.android.com/training/sign-in/credential-manager)
- [OAuth 2.0 Console](https://console.cloud.google.com/apis/credentials)

## 🎯 Próximo Paso

Una vez configurado Google Cloud Console, el login con Google funcionará correctamente en la app.
