# Configuración de Google Maps

## Pasos para configurar Google Maps en la aplicación

### 1. Obtener API Key de Google Maps
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Maps para Android
4. Crea credenciales (API Key)
5. Configura las restricciones de la API Key para Android

### 2. Configurar la API Key en la aplicación
1. Abre el archivo `app/src/main/AndroidManifest.xml`
2. Busca la línea que contiene `YOUR_GOOGLE_MAPS_API_KEY_HERE`
3. Reemplaza `YOUR_GOOGLE_MAPS_API_KEY_HERE` con tu API Key real

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="TU_API_KEY_AQUI" />
```

### 3. Funcionalidades implementadas
- ✅ Mapa integrado en la pantalla de marcaciones
- ✅ Marcador de ubicación objetivo (cocina) en rojo
- ✅ Marcador de ubicación actual del usuario en azul
- ✅ Círculo que muestra el radio permitido
- ✅ Zoom automático para mostrar ambas ubicaciones
- ✅ Actualización en tiempo real de la ubicación del usuario
- ✅ Indicador visual de si está dentro o fuera del rango

### 4. Archivos modificados
- `app/build.gradle.kts` - Dependencias de Google Maps añadidas
- `AndroidManifest.xml` - Configuración de API Key
- `GoogleMapView.kt` - Componente del mapa creado
- `MarcacionesScreen.kt` - Integración del mapa en la pantalla de asistencia

### 5. Permisos requeridos
Los siguientes permisos ya están configurados en el AndroidManifest.xml:
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`

### 6. Notas importantes
- El mapa se actualiza automáticamente cada vez que cambia la ubicación del usuario
- Si no se tienen permisos de ubicación, el mapa mostrará solo la ubicación objetivo
- El componente es completamente funcional y listo para usar una vez configurada la API Key