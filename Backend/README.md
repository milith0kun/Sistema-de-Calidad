# Backend - Sistema de Calidad HACCP

## 📋 Descripción

API REST desarrollada en Node.js/Express que gestiona el sistema de control de calidad HACCP para cocinas de hotel. Maneja autenticación, fichaje de asistencias, formularios de control, reportes y auditoría.

## 🛠️ Tecnologías

- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Base de Datos**: SQLite3 5.1
- **Autenticación**: JWT + Google OAuth 2.0
- **Librerías principales**:
  - `bcryptjs`: Encriptación de contraseñas
  - `google-auth-library`: Validación de tokens de Google
  - `node-cron`: Tareas programadas (cron jobs)
  - `exceljs`: Generación de reportes Excel
  - `date-fns`: Manejo de fechas
  - `axios`: Cliente HTTP
  - `cors`: Control de acceso cross-origin

## 📁 Estructura del Proyecto

```
Backend/
├── server.js                 # Punto de entrada, configuración Express
├── config-app-universal.js   # Configuración centralizada (puertos, BD, CORS)
├── ecosystem.config.js       # Configuración PM2 para producción
├── package.json              # Dependencias y scripts
├── database/                 # Archivo SQLite (.db)
├── middleware/
│   └── auth.js              # Middleware de autenticación JWT
├── routes/                  # Endpoints de la API
│   ├── auth.js             # Login, registro, Google OAuth
│   ├── fichado.js          # Check-in/out de empleados
│   ├── dashboard.js        # Estadísticas del sistema
│   ├── tiempo-real.js      # Estado en vivo de empleados
│   ├── haccp.js            # Formularios HACCP principales
│   ├── haccp-daily.js      # Datos diarios HACCP
│   ├── formularios-haccp.js # Gestión de tipos de formularios
│   ├── usuarios.js         # CRUD de usuarios
│   ├── reportes.js         # Exportación a Excel
│   ├── auditoria.js        # Logs de actividad
│   ├── configuracion.js    # Parámetros del sistema
│   └── health.js           # Health check
├── scripts/                # SQL para inicialización de BD
│   ├── create_camaras_frigorificas.sql
│   ├── create_camaras_table.sql
│   ├── create_control_temperatura_camaras.sql
│   └── setup_camaras.js   # Script Node.js para setup inicial
└── utils/
    ├── database.js         # Inicialización y helpers de SQLite
    ├── timeUtils.js        # Conversión de zonas horarias (Perú)
    ├── cronJobs.js         # Tareas automáticas diarias
    ├── gpsValidation.js    # Validación de geolocalización
    └── environmentDetector.js # Detección de entorno (AWS/local)
```

## 🔑 Variables de Entorno

Crear archivo `.env` en la raíz de `Backend/`:

```env
# Puerto del servidor
PORT=3000
EXTERNAL_PORT=3000

# Host (0.0.0.0 para acceso externo)
HOST=0.0.0.0

# JWT Secret (cambiar en producción)
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion

# Base de datos SQLite
DB_PATH=./database/haccp.db

# Entorno (development | production)
NODE_ENV=production
```

## 📡 Endpoints Principales

### Autenticación (`/api/auth`)
- `POST /api/auth/login` - Login con email/contraseña
- `POST /api/auth/google` - Autenticación con Google OAuth
- `POST /api/auth/register` - Registro de nuevo usuario
- `POST /api/auth/forgot-password` - Recuperación de contraseña
- `GET /api/auth/me` - Obtener perfil del usuario autenticado

### Fichado (`/api/fichado`)
- `POST /api/fichado/marcar` - Registrar entrada/salida
- `GET /api/fichado/mis-fichajes` - Fichajes del usuario actual
- `GET /api/fichado/hoy` - Fichajes del día actual
- `GET /api/fichado/validar-gps` - Validar ubicación GPS

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/asistencias-hoy` - Asistencias del día
- `GET /api/dashboard/empleados-activos` - Empleados en turno
- `GET /api/dashboard/formularios-pendientes` - Formularios sin completar

### HACCP - Formularios (`/api/haccp`)
- `POST /api/haccp/recepcion-mercaderia` - Registrar recepción de mercadería
- `POST /api/haccp/lavado-frutas` - Registrar lavado de frutas/verduras
- `POST /api/haccp/lavado-manos` - Registrar lavado de manos
- `POST /api/haccp/control-coccion` - Registrar control de cocción
- `POST /api/haccp/temperatura-camaras` - Registrar temperatura de cámaras
- `GET /api/haccp/:tipo` - Obtener registros por tipo de formulario
- `GET /api/haccp/:tipo/:id` - Obtener registro específico
- `PUT /api/haccp/:tipo/:id` - Actualizar registro
- `DELETE /api/haccp/:tipo/:id` - Eliminar registro

### Datos Diarios HACCP (`/api/haccp-daily`)
- `GET /api/haccp-daily/today` - Resumen de hoy
- `GET /api/haccp-daily/:fecha` - Resumen de fecha específica
- `GET /api/haccp-daily/range?start=&end=` - Rango de fechas

### Usuarios (`/api/usuarios`)
- `GET /api/usuarios` - Listar todos (admin)
- `GET /api/usuarios/:id` - Obtener usuario específico
- `POST /api/usuarios` - Crear usuario (admin)
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario (admin)

### Reportes (`/api/reportes`)
- `GET /api/reportes/asistencias?start=&end=` - Excel de asistencias
- `GET /api/reportes/haccp/:tipo?start=&end=` - Excel de formularios HACCP
- `GET /api/reportes/auditoria?start=&end=` - Excel de auditoría

### Auditoría (`/api/auditoria`)
- `GET /api/auditoria` - Logs de actividad del sistema
- `GET /api/auditoria/usuario/:id` - Actividad de usuario específico

### Configuración (`/api/configuracion`)
- `GET /api/configuracion` - Obtener configuración global
- `PUT /api/configuracion` - Actualizar configuración (admin)

### Health Check
- `GET /health` - Estado del servidor
- `GET /api/health` - Estado detallado + información del sistema

## 🗄️ Modelo de Datos (SQLite)

### Tabla: `usuarios`
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    google_id TEXT UNIQUE,
    google_photo TEXT,
    auth_provider TEXT DEFAULT 'local',
    rol TEXT DEFAULT 'empleado',
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `fichajes`
```sql
CREATE TABLE fichajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- 'entrada' | 'salida'
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    gps_lat REAL,
    gps_lon REAL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Tabla: `formularios_haccp`
```sql
CREATE TABLE formularios_haccp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL, -- 'recepcion_mercaderia', 'lavado_frutas', etc.
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    usuario_id INTEGER NOT NULL,
    datos TEXT NOT NULL, -- JSON con campos específicos del formulario
    observaciones TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Tabla: `auditoria`
```sql
CREATE TABLE auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    accion TEXT NOT NULL,
    tabla_afectada TEXT,
    detalles TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Tabla: `camaras_frigorificas`
```sql
CREATE TABLE camaras_frigorificas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    temperatura_minima REAL NOT NULL,
    temperatura_maxima REAL NOT NULL,
    activa INTEGER DEFAULT 1
);
```

### Tabla: `control_temperatura_camaras`
```sql
CREATE TABLE control_temperatura_camaras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camara_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    temperatura REAL NOT NULL,
    usuario_id INTEGER NOT NULL,
    cumple_norma INTEGER DEFAULT 1,
    observaciones TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camara_id) REFERENCES camaras_frigorificas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

## ⚙️ Configuración y Deployment

### Desarrollo Local

```bash
# Instalar dependencias
cd Backend
npm install

# Inicializar base de datos (si es primera vez)
node scripts/setup_camaras.js

# Modo desarrollo con auto-reload
npm run dev

# Modo producción
npm start
```

### Producción (AWS EC2 con PM2)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Ver logs
pm2 logs haccp-backend

# Reiniciar
pm2 restart haccp-backend

# Detener
pm2 stop haccp-backend

# Guardar configuración para auto-inicio
pm2 save
pm2 startup
```

### Configuración Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Autenticación y Seguridad

### JWT (JSON Web Tokens)
- Tokens válidos por 24 horas
- Header: `Authorization: Bearer <token>`
- Payload incluye: `id`, `email`, `rol`, `nombre`

### Google OAuth 2.0
1. Cliente envía `idToken` de Google
2. Backend valida con `google-auth-library`
3. Si es válido, crea/actualiza usuario y retorna JWT
4. Firebase Client IDs registrados con SHA-1 de Play Store

### Middleware de Autenticación
```javascript
// Proteger rutas
const { authenticateToken } = require('./middleware/auth');
router.get('/protected', authenticateToken, (req, res) => {
    // req.user contiene datos del usuario decodificados
});
```

### Roles
- `admin`: Acceso completo (CRUD usuarios, configuración)
- `supervisor`: Consulta de reportes y auditoría
- `empleado`: Fichaje y formularios HACCP propios

## 🕒 Cron Jobs (Tareas Programadas)

Configurados en `utils/cronJobs.js`:

- **Limpieza de tokens expirados**: Diaria a las 00:00
- **Backup automático de base de datos**: Diaria a las 02:00
- **Reporte de asistencias diarias**: Lunes a viernes 18:00
- **Notificación de formularios pendientes**: Diaria a las 10:00

## 🌍 Gestión de Zona Horaria

El backend maneja fechas en horario de Perú (UTC-5):
- `timeUtils.js` convierte timestamps UTC a zona horaria local
- Todas las fechas en BD se almacenan en UTC
- Respuestas JSON incluyen timestamps en formato ISO 8601

## 📊 Monitoreo y Logs

### Logs de Aplicación
```bash
# PM2 logs
pm2 logs haccp-backend --lines 100

# Logs de auditoría (base de datos)
sqlite3 database/haccp.db "SELECT * FROM auditoria ORDER BY timestamp DESC LIMIT 50;"
```

### Health Check
```bash
# Verificar estado del servidor
curl http://localhost:3000/health

# Respuesta esperada:
{
  "status": "OK",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "uptime": 86400,
  "environment": "production",
  "database": "connected"
}
```

## 🐛 Troubleshooting

### Error: `EADDRINUSE` (Puerto ocupado)
```bash
# Buscar proceso usando el puerto 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Matar proceso
kill -9 <PID>
```

### Error: Base de datos bloqueada
```bash
# Verificar permisos
chmod 644 database/haccp.db

# Verificar procesos SQLite
fuser database/haccp.db
```

### Error: Google OAuth falla
- Verificar que el Web Client ID hardcodeado en `routes/auth.js` (línea 12) coincide con Firebase Console
- Web Client ID actual: `<PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com`
- Comprobar que los 3 SHA-1 (Debug, Upload, Play Store) están registrados en Firebase
- Ver logs: `console.log` en `routes/auth.js` línea ~200

## 📝 Notas de Desarrollo

- **CORS**: Configurado para aceptar cualquier origen (`*`) - restringir en producción si es necesario
- **Validación GPS**: Implementada en `utils/gpsValidation.js` - verifica cercanía al hotel
- **Datos JSON**: Formularios HACCP guardan datos dinámicos en campo `TEXT` como JSON string
- **SQLite**: Límite de concurrencia - considerar PostgreSQL para >100 usuarios simultáneos

## 🔗 Enlaces Relacionados

- [WebPanel (Frontend Web)](../WebPanel/README.md)
- [App Android](../Sistema%20de%20Calidad/README.md)
- [Documentación Principal](../README.md)

---

**Versión**: 1.0.0  
**Última actualización**: 24 de noviembre de 2025
