# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **HACCP Quality Control System** with three main components:

1. **Backend**: Node.js + Express + SQLite REST API (`Backend/`)
2. **Android App**: Kotlin + Jetpack Compose mobile app (`Sistema de Calidad/`)
3. **Web Panel**: React + Vite admin panel (`WebPanel/`)

The system manages attendance tracking with GPS validation and HACCP food safety control forms (temperature, washing, cooking, reception).

## Development Commands

### Backend (Node.js + Express)
**Location**: `Backend/`

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Server auto-detects environment (AWS/Local)
# - Local: http://localhost:3000/api
# - AWS Production: http://18.216.180.19:3000/api
```

**Key Configuration**:
- Database: SQLite at `Backend/database/database.db`
- JWT authentication (24h expiration)
- Default users: `empleador@hotel.com` / `empleador123`, `supervisor@hotel.com` / `supervisor123`

### Android App (Kotlin + Jetpack Compose)
**Location**: `Sistema de Calidad/`

```bash
# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Install on device
./gradlew installDebug

# Clean build
./gradlew clean

# Run tests
./gradlew test
```

**Output**: APKs in `app/build/outputs/apk/` (SistemaHACCP-v1.0.2-*.apk)

**Important**: Hilt is currently disabled. ViewModels are manually instantiated in `HaccpNavigation.kt`.

### Web Panel (React + Vite)
**Location**: `WebPanel/`

```bash
# Development server (port 5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

**Environment**: API URL configured in `.env` (VITE_API_URL)

## Architecture

### Android App (MVVM Pattern)

```
Screens (Compose UI)
    ↓ StateFlow/Flow
ViewModels (ui/viewmodel/)
    ↓
Repositories (data/repository/)
    ↓
API Service (Retrofit + OkHttp)
```

**Key Files**:
- **Navigation**: `navigation/HaccpNavigation.kt` - Centralized nav graph, manual ViewModel instantiation
- **ViewModels**: `AuthViewModel`, `FichadoViewModel`, `HaccpViewModel`
- **API Service**: `data/api/ApiService.kt` - Retrofit interface with auto token injection via `AuthInterceptor`
- **Network Config**: `utils/NetworkConfig.kt` - AWS production URL configuration
- **Auto Detection**: `utils/AutoNetworkDetector.kt` - Automatic AWS/local environment detection

**Data Models** (`data/model/`):
- User, Fichado (attendance)
- HACCP forms: ControlCoccion, LavadoFrutas, LavadoManos, RecepcionMercaderia, ControlTemperatura

**Services & Workers**:
- `services/NotificationService.kt` - Background notifications
- `workers/NotificationWorker.kt` - WorkManager scheduled tasks

**Maps Integration**:
- Google Maps SDK (requires API key in manifest)
- OpenStreetMap (OSMDroid) as fallback when no API key
- Location tracking via `utils/LocationManager.kt`

### Backend (Layered Architecture)

```
Routes (Express Router)
    ↓
Middleware (JWT Auth)
    ↓
Route Handlers (Business Logic)
    ↓
Database Layer (SQLite)
```

**Key Files**:
- **Server**: `server.js` - Express app with auto environment detection
- **Config**: `config-app-universal.js` - Environment-specific settings
- **Auth Middleware**: `middleware/auth.js` - JWT validation
- **Database**: `utils/database.js` - SQLite wrapper with hybrid Promise/callback support

**Routes** (`routes/`):
- `auth.js` - Login, token verification
- `fichado.js` - Attendance (entrada/salida)
- `dashboard.js` - Statistics and analytics
- `haccp.js` - HACCP form submissions (81KB - largest file)
- `haccp-daily.js` - Daily HACCP data retrieval
- `usuarios.js` - User CRUD
- `configuracion.js` - GPS settings

**Database Tables** (SQLite):
```
usuarios                              # Users
asistencia                           # Attendance records
codigos_qr_locales                   # QR codes (future)
camaras_frigorificas                 # Refrigeration chambers

# HACCP tables
control_recepcion_frutas_verduras    # Fruit/veg reception
control_recepcion_abarrotes          # Groceries reception
control_coccion                      # Cooking control
control_lavado_frutas                # Fruit washing
control_lavado_manos                 # Hand washing
control_temperatura_camaras          # Chamber temperatures
```

**Utilities**:
- `timeUtils.js` - Peru timezone handling (America/Lima)
- `cronJobs.js` - Scheduled tasks (backups, cleanups)
- `environmentDetector.js` - AWS EC2 detection
- `gpsValidation.js` - GPS coordinate validation

### Web Panel (Component-Based)

```
App.jsx (Router + Theme)
    ↓
Layout.jsx (Sidebar + Main)
    ↓
Pages (Dashboard, HACCP Forms)
    ↓
Services (Axios API calls)
```

**Key Files**:
- **App**: `src/App.jsx` - Material-UI theme provider + React Router
- **Auth Context**: `context/AuthContext.jsx` - Global auth state (JWT in localStorage)
- **Layout**: `components/Layout.jsx` - Responsive sidebar (desktop/tablet/mobile)
- **API Service**: `services/api.js` - Axios client with all endpoints

**Pages** (`pages/`):
- `Login.jsx` - Authentication
- `Dashboard.jsx` - Statistics with Recharts
- `Asistencias.jsx` - Attendance management
- `Usuarios.jsx` - User CRUD
- `HACCP/` subfolder: RecepcionMercaderia, ControlCoccion, LavadoFrutas, LavadoManos, TemperaturaCamaras

**Utils**:
- `utils/exportExcel.js` - Excel export using ExcelJS

## API Communication

**Base URL**: `http://18.216.180.19:3000/api` (AWS) or `http://localhost:3000/api` (local)

**Authentication**: JWT Bearer Token in Authorization header

**Key Endpoints**:
```
POST   /api/auth/login                      # Login
GET    /api/auth/verify                     # Verify token
POST   /api/fichado/entrada                 # Clock in
POST   /api/fichado/salida                  # Clock out
GET    /api/fichado/historial               # Attendance history
GET    /api/dashboard/admin                 # Admin dashboard
POST   /api/haccp/recepcion-frutas-verduras # Fruit/veg reception
POST   /api/haccp/control-coccion           # Cooking control
POST   /api/haccp/lavado-manos              # Hand washing
POST   /api/haccp/temperatura-camaras       # Temperature control
GET    /api/configuracion/gps               # GPS configuration
```

**Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

## Deployment (AWS EC2)

**Production Server**: AWS EC2 at `18.216.180.19` (SSH: `ubuntu@18.216.180.19` with `Wino.pem` key)

**Backend** (PM2):
```bash
ssh -i "Wino.pem" ubuntu@18.216.180.19
cd ~/SistemaWino
git pull
pm2 restart ecosystem.config.js
```

**Web Panel** (Nginx):
```bash
cd ~/SistemaWino/WebPanel
git pull
npm run build
# Nginx serves files from /var/www/sistema-haccp/
# Config: wino-webpanel.conf (reverse proxy to :3000)
```

**Android App**: Build APK locally and distribute manually.

## Important Notes

1. **Hilt Disabled**: Dependency injection is currently manual. ViewModels are instantiated directly in `HaccpNavigation.kt` instead of using Hilt injection.

2. **Maps API**: Google Maps requires API key in `AndroidManifest.xml`. OpenStreetMap (OSMDroid) is used as fallback when key is missing or invalid.

3. **Environment Detection**: Backend auto-detects AWS vs Local using `environmentDetector.js`. No manual configuration needed.

4. **JWT Expiration**: Tokens expire in 24h. Frontend must handle 403 responses by redirecting to login.

5. **GPS Validation**: Attendance requires GPS coordinates within configured radius (stored in `codigos_qr_locales` table).

6. **Timezone**: All backend times use Peru timezone (America/Lima) via `date-fns-tz`.

7. **CORS**: Backend allows origins based on environment (localhost:5173 for local, production IPs for AWS).

8. **Database Initialization**: Backend auto-creates database and default users on first run.

9. **Notification System**: Android app uses WorkManager for scheduled HACCP reminders.

10. **Excel Export**: Web panel includes Excel export for all tables using ExcelJS with custom formatting.

## Technology Stack Summary

- **Backend**: Node.js 18+, Express 4.18+, SQLite3 5.1+, JWT, bcryptjs, node-cron
- **Android**: Kotlin, Jetpack Compose, Material3, Retrofit 2, OkHttp, Coroutines, WorkManager, Google Maps + OSMDroid
- **Web**: React 18.2+, Vite 5.0+, Material-UI 5.14+, Axios, Zustand, Recharts, ExcelJS
- **Build Tools**: Gradle (Kotlin DSL), npm, PM2, Nginx

## Version Information

- Android App: v1.0.2 (versionCode 3)
- Min SDK: 24 (Android 7.0)
- Target SDK: 36 (Android 14+)
