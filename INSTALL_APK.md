# Instrucciones de Instalación - APK v1.0.4

## APK Compilado
- **Archivo**: `SistemaHACCP-v1.0.4-debug.apk`
- **Ubicación**: `Sistema de Calidad/app/build/outputs/apk/debug/`
- **Tamaño**: 28 MB
- **Versión**: 1.0.4 (versionCode 5)

## Pasos para Instalar en Android

### 1. Habilitar Instalación de Orígenes Desconocidos
1. Abre **Configuración** en tu celular
2. Ve a **Seguridad** o **Privacidad**
3. Busca **Instalar aplicaciones desconocidas** o **Orígenes desconocidos**
4. Activa la opción para el navegador o gestor de archivos que usarás

### 2. Transferir el APK al Celular
**Opción A - USB:**
1. Conecta el celular a la PC con USB
2. Copia `SistemaHACCP-v1.0.4-debug.apk` a la carpeta **Descargas** del celular

**Opción B - Email/Drive:**
1. Envía el APK por email o súbelo a Google Drive
2. Descárgalo desde el celular

**Opción C - ADB (Desarrolladores):**
```bash
adb install "Sistema de Calidad/app/build/outputs/apk/debug/SistemaHACCP-v1.0.4-debug.apk"
```

### 3. Instalar el APK
1. Abre el **Gestor de Archivos** en el celular
2. Ve a la carpeta **Descargas**
3. Toca el archivo `SistemaHACCP-v1.0.4-debug.apk`
4. Toca **Instalar**
5. Espera a que termine la instalación
6. Toca **Abrir** o busca "Sistema HACCP" en las apps

## Si No Se Puede Instalar

### Error: "No se puede instalar la aplicación"
**Causa**: Versión anterior instalada con firma diferente

**Solución**:
1. Desinstala la versión anterior:
   - Ve a **Configuración** > **Aplicaciones**
   - Busca "Sistema HACCP"
   - Toca **Desinstalar**
2. Intenta instalar de nuevo el APK

### Error: "Aplicación no instalada"
**Causa**: Espacio insuficiente

**Solución**:
1. Libera al menos 100 MB de espacio
2. Intenta de nuevo

### Error: "El paquete parece estar dañado"
**Causa**: Descarga incompleta

**Solución**:
1. Elimina el APK del celular
2. Vuelve a transferirlo/descargarlo
3. Verifica que el tamaño sea 28 MB

## Verificación Post-Instalación
1. Abre la app "Sistema HACCP"
2. Deberías ver la pantalla de login
3. Verifica que aparezca el botón "Continuar con Google"

## Características de esta Versión
✅ Login con email/password  
✅ Login con Google (OAuth 2.0)  
✅ Recordar credenciales  
✅ Control de temperaturas de cámaras (3 cámaras)  
✅ Formularios HACCP  
✅ Sistema de fichado  
✅ Notificaciones  

## Requisitos
- **Android**: 7.0 (API 24) o superior
- **Espacio**: 100 MB libres
- **Internet**: Conexión requerida para login y sincronización
- **Google Play Services**: Requerido para login con Google

## Troubleshooting

### La app no abre
1. Reinicia el celular
2. Desinstala e instala de nuevo
3. Verifica que tengas Android 7.0+

### No puedo hacer login con Google
1. Verifica que tengas Google Play Services actualizado
2. Verifica conexión a internet
3. Intenta con login tradicional (email/contraseña)

### La app se cierra sola
1. Ve a **Configuración** > **Aplicaciones** > **Sistema HACCP**
2. Toca **Permisos**
3. Activa todos los permisos (Internet, Ubicación, Notificaciones)

## Soporte
Si tienes problemas, verifica:
1. Versión de Android (debe ser 7.0+)
2. Espacio disponible (100+ MB)
3. Permisos de la app
4. Conexión a internet

## Notas para Desarrollo
- Este es un APK **debug** firmado con clave de desarrollo
- Para producción, usar APK **release** con firma de producción
- El login con Google requiere backend con endpoint `/auth/google`
