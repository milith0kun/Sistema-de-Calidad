# Sistema de Calidad HACCP

## 📋 Descripción General

Sistema integral de gestión de calidad basado en normativas HACCP (Hazard Analysis and Critical Control Points) para el control de procesos en cocinas de hoteles. Compuesto por tres aplicaciones interconectadas que permiten el registro, monitoreo y análisis de:

- ✅ **Asistencias de empleados** (fichaje con geolocalización)
- 📝 **Formularios de control HACCP** (recepción de mercadería, temperaturas, lavado, cocción)
- 📊 **Reportes y auditoría** en tiempo real
- 👥 **Gestión de usuarios** y roles

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIOS FINALES                        │
└───────────────┬──────────────────────┬──────────────────────┘
                │                      │
       ┌────────▼────────┐    ┌───────▼────────┐
       │   App Android   │    │   Panel Web    │
       │   (Empleados)   │    │ (Administración)│
       │                 │    │                 │
       │  Kotlin/Compose │    │   React/Vite   │
       │  Google OAuth   │    │   Material-UI  │
       └────────┬────────┘    └────────┬───────┘
                │                      │
                │   HTTP/JSON (API)    │
                │                      │
         ┌──────▼──────────────────────▼──────┐
         │         Backend REST API           │
         │       Node.js + Express            │
         │                                    │
         │  ┌──────────────────────────────┐ │
         │  │     SQLite Database          │ │
         │  │  - usuarios                  │ │
         │  │  - fichajes                  │ │
         │  │  - formularios_haccp         │ │
         │  │  - auditoria                 │ │
         │  └──────────────────────────────┘ │
         │                                    │
         │  JWT Auth | Cron Jobs | GPS       │
         └────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   AWS EC2       │
              │  18.216.180.19  │
              │   + Nginx       │
              └─────────────────┘
```

## 📦 Componentes del Sistema

### 1️⃣ [Backend - API REST](./Backend/README.md)

**Stack Tecnológico:**
- Node.js 18+ con Express 4.18
- SQLite3 como base de datos
- JWT + Google OAuth 2.0
- PM2 para gestión de procesos

**Funcionalidades:**
- API RESTful con 11 módulos de rutas
- Autenticación dual (local + Google)
- Validación de geolocalización GPS
- Tareas programadas (cron jobs)
- Exportación de reportes Excel
- Sistema de auditoría completo

**Servidor en producción:**
```
http://18.216.180.19:3000/api/
```

📖 **[Documentación completa del Backend](./Backend/README.md)**

---

### 2️⃣ [WebPanel - Panel Administrativo](./WebPanel/README.md)

**Stack Tecnológico:**
- React 18.2 con Vite 5.0
- Material-UI 5.14 (componentes y diseño)
- React Router DOM 6.20
- Zustand + Context API (estado)
- Recharts (gráficos)

**Funcionalidades:**
- Dashboard con estadísticas en tiempo real
- Gestión completa de usuarios (CRUD)
- Visualización de asistencias diarias
- Registro de formularios HACCP
- Exportación de reportes a Excel
- Sistema de auditoría visual

**Acceso web:**
```
http://18.216.180.19/
```

📖 **[Documentación completa del WebPanel](./WebPanel/README.md)**

---

### 3️⃣ [App Android - Aplicación Móvil](./Sistema%20de%20Calidad/README.md)

**Stack Tecnológico:**
- Kotlin 1.9 con Jetpack Compose
- Arquitectura MVVM
- Firebase Auth + Credential Manager
- Retrofit 2.9 (cliente HTTP)
- Material 3 Design

**Funcionalidades:**
- Login con Google (OAuth 2.0)
- Fichaje de entrada/salida con GPS
- Registro de formularios HACCP
- Consulta de historial personal
- Notificaciones push
- Modo offline (próximamente)

**Disponible en:**
- Google Play Store (com.sistemahaccp.calidad)
- Versión actual: **1.0.7**

📖 **[Documentación completa de la App Android](./Sistema%20de%20Calidad/README.md)**

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Backend**: Node.js 18+, PM2 (producción)
- **WebPanel**: Node.js 18+, npm
- **App Android**: Android Studio Hedgehog+, JDK 21, Android SDK 36

### 1. Clonar el Repositorio

```bash
git clone https://github.com/milith0kun/Sistema-de-Calidad.git
cd Sistema-de-Calidad
```

### 2. Configurar Backend

```bash
cd Backend

# Instalar dependencias
npm install

# Crear archivo .env
cat > .env << EOF
PORT=3000
HOST=0.0.0.0
JWT_SECRET=tu_secret_key_cambiar_en_produccion
GOOGLE_CLIENT_ID=<PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com
DB_PATH=./database/haccp.db
NODE_ENV=development
EOF

# Inicializar base de datos
node scripts/setup_camaras.js

# Iniciar servidor
npm run dev  # Desarrollo (con auto-reload)
npm start    # Producción
```

### 3. Configurar WebPanel

```bash
cd WebPanel

# Instalar dependencias
npm install

# Iniciar servidor desarrollo
npm run dev  # http://localhost:5173

# Build para producción
npm run build
```

### 4. Configurar App Android

```bash
cd "Sistema de Calidad"

# Abrir proyecto en Android Studio
# File → Open → seleccionar carpeta "Sistema de Calidad"

# Crear keystore.properties en la raíz:
RELEASE_STORE_FILE=app/keystore/haccp-release-upload.jks
RELEASE_STORE_PASSWORD=tu_password
RELEASE_KEY_ALIAS=haccp-key
RELEASE_KEY_PASSWORD=tu_password

# Compilar APK debug
./gradlew assembleDebug

# Compilar AAB release (Play Store)
./gradlew bundleRelease
```

## 🔑 Configuración de Autenticación Google

### Firebase Console

**Proyecto Firebase**: `<FIREBASE_PROJECT_ID>`  
**Web Client ID**: `<PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com`

1. Ir a: https://console.firebase.google.com/project/<FIREBASE_PROJECT_ID>
2. Project Settings → Your apps → Sistema de Calidad (Android)
3. **Verificar 3 certificados SHA-1** estén registrados:
   - **Debug**: `<SHA1_DEBUG_KEYSTORE>`
   - **Upload**: `<SHA1_UPLOAD_KEYSTORE>`
   - **Play Store**: `<SHA1_PLAY_STORE_SIGNING>` ✅
4. Descargar `google-services.json` (ya está en `Sistema de Calidad/app/`)

### Cómo funciona la autenticación

1. **App Android**: 
   - Usa Credential Manager API + Firebase Auth
   - Obtiene Google ID Token del usuario
   - Envía `idToken` al Backend vía `POST /api/auth/google`

2. **Backend Node.js**:
   - Valida el `idToken` con `google-auth-library`
   - Verifica que el `audience` sea el Web Client ID correcto
   - Crea/actualiza usuario en SQLite
   - Retorna JWT propio para sesiones

3. **WebPanel React**:
   - Usa login tradicional (email/password)
   - NO implementa Google OAuth directamente

### Obtener SHA-1 de Google Play

```bash
# Acceder a Google Play Console
1. Google Play Console → Tu App → Setup → App Integrity
2. Copiar SHA-1 del "App signing key certificate"
3. Agregarlo en Firebase Console → Project Settings → Add Fingerprint
```pp Android** (`strings.xml`):
```xml
<!-- Web Client ID de Firebase (proyecto: <FIREBASE_PROJECT_ID>) -->
<string name="default_web_client_id"><PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com</string>
```

## 📡 Endpoints Principales de la API

Base URL: `http://18.216.180.19:3000/api/`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login con email/contraseña |
| POST | `/auth/google` | Login con Google OAuth |
| POST | `/fichado/marcar` | Registrar entrada/salida |
| GET | `/dashboard/stats` | Estadísticas del sistema |
| GET | `/haccp/:tipo` | Formularios HACCP por tipo |
| POST | `/haccp/:tipo` | Crear formulario HACCP |
| GET | `/usuarios` | Listar usuarios (admin) |
| GET | `/reportes/asistencias` | Excel de asistencias |
| GET | `/auditoria` | Logs de actividad |
| GET | `/health` | Health check del servidor |

📖 **[Ver documentación completa de endpoints](./Backend/README.md#-endpoints-principales)**

## 🗄️ Modelo de Datos

### Tabla: `usuarios`
```sql
id, nombre, apellido, email, password, google_id, 
google_photo, auth_provider, rol, activo, fecha_creacion
```

### Tabla: `fichajes`
```sql
id, usuario_id, tipo, fecha, hora, timestamp, gps_lat, gps_lon
```

### Tabla: `formularios_haccp`
```sql
id, tipo, fecha, hora, usuario_id, datos (JSON), observaciones, timestamp
```

### Tabla: `auditoria`
```sql
id, usuario_id, accion, tabla_afectada, detalles, ip_address, timestamp
```

📖 **[Ver esquema completo de base de datos](./Backend/README.md#-modelo-de-datos-sqlite)**

## 🔐 Seguridad

### Autenticación
- **JWT** con expiración de 24 horas
- **Google OAuth 2.0** validado con `google-auth-library`
- Tokens almacenados en:
  - Backend: Sin almacenamiento (stateless)
  - WebPanel: `localStorage`
  - App Android: `SharedPreferences` (encriptado)

### Autorización (Roles)
- **admin**: CRUD completo, configuración global
- **supervisor**: Consultas y reportes
- **empleado**: Fichaje y formularios propios

### HTTPS y CORS
- Producción: Nginx con proxy reverso
- CORS: Configurado para aceptar orígenes específicos
- Headers de seguridad: `X-Content-Type-Options`, `X-Frame-Options`

## 🌍 Deployment en AWS EC2

### Servidor de Producción

**IP**: `18.216.180.19`  
**OS**: Ubuntu 22.04 LTS  
**Servicios**:
- Backend: PM2 (puerto 3000)
- WebPanel: Nginx (puerto 80)
- Base de datos: SQLite (archivo local)

### Configuración Nginx

```nginx
server {
    listen 80;
    server_name 18.216.180.19;
    
    # Frontend (WebPanel)
    root /var/www/webpanel;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 (Gestión de Backend)

```bash
# Iniciar backend
pm2 start ecosystem.config.js --env production

# Ver logs
pm2 logs haccp-backend

# Reiniciar
pm2 restart haccp-backend

# Monitorear
pm2 monit
```

## 📊 Monitoreo y Logs

### Backend
```bash
# Logs de PM2
pm2 logs haccp-backend --lines 100

# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs de auditoría (base de datos)
sqlite3 database/haccp.db "SELECT * FROM auditoria ORDER BY timestamp DESC LIMIT 50;"
```

### App Android
```bash
# Logs en tiempo real
adb logcat | Select-String "com.sistemahaccp.calidad"

# Filtrar por tag
adb logcat -s GoogleAuthUiClient:D
```

### Health Checks
```bash
# Backend
curl http://18.216.180.19:3000/health

# WebPanel (index.html)
curl -I http://18.216.180.19/
```

## 🧪 Testing

### Backend
```bash
cd Backend

# Instalar dependencias de testing (si existen)
npm install --save-dev jest supertest

# Ejecutar tests
npm test
```

### WebPanel
```bash
cd WebPanel

# Linter
npm run lint

# Preview build
npm run preview
```

### App Android
```bash
cd "Sistema de Calidad"

# Unit tests
./gradlew test

# Instrumented tests (requiere emulador/dispositivo)
./gradlew connectedAndroidTest
```

## 📝 Convenciones de Código

### Backend (JavaScript/Node.js)
- **Style**: CommonJS (require/module.exports)
- **Naming**: camelCase para variables/funciones
- **Async**: Usar `async/await` (no callbacks)

### WebPanel (JavaScript/React)
- **Style**: ES6+ con JSX
- **Naming**: PascalCase para componentes, camelCase para funciones
- **State**: Hooks (`useState`, `useEffect`)
- **Routing**: React Router DOM v6

### App Android (Kotlin)
- **Style**: Kotlin official style guide
- **Naming**: PascalCase para clases, camelCase para funciones/variables
- **Async**: Coroutines + Flow
- **UI**: Jetpack Compose con Material 3

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m "feat: agregar nueva funcionalidad"`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### Convención de commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato de código
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

## 🐛 Reportar Problemas

Crear un issue en GitHub con:
- **Título**: Descripción breve del problema
- **Descripción**: Pasos para reproducir
- **Entorno**: Backend/WebPanel/App Android
- **Versión**: Número de versión afectada
- **Logs**: Adjuntar logs relevantes

## 📄 Licencia

Este proyecto es propietario y de uso interno.

## 👥 Equipo

- **Desarrollo**: Sistema de Calidad Team
- **Contacto**: [GitHub Issues](https://github.com/milith0kun/Sistema-de-Calidad/issues)

## 📚 Documentación Adicional

- [Documentación Backend](./Backend/README.md) - API REST, endpoints, base de datos
- [Documentación WebPanel](./WebPanel/README.md) - Panel web, componentes, deployment
- [Documentación App Android](./Sistema%20de%20Calidad/README.md) - App móvil, compilación, Google OAuth

## 🔗 Enlaces Útiles

- [Firebase Console](https://console.firebase.google.com/project/<FIREBASE_PROJECT_ID>)
- [Google Play Console](https://play.google.com/console)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=<FIREBASE_PROJECT_ID>)
- [AWS EC2 Dashboard](https://console.aws.amazon.com/ec2/)

---

**Versión**: 1.0.0  
**Última actualización**: 24 de noviembre de 2025  
**Repositorio**: https://github.com/milith0kun/Sistema-de-Calidad
