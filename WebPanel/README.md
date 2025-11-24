# WebPanel - Sistema de Calidad HACCP

## 📋 Descripción

Panel web administrativo desarrollado en React para la gestión del sistema de control de calidad HACCP. Proporciona una interfaz visual para monitorear asistencias, registrar formularios HACCP, generar reportes y administrar usuarios.

## 🛠️ Tecnologías

- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **UI Library**: Material-UI (MUI) 5.14
- **Routing**: React Router DOM 6.20
- **State Management**: Zustand 4.4 + React Context API
- **Forms**: React Hook Form 7.48
- **Charts**: Recharts 2.10
- **HTTP Client**: Axios 1.6
- **Excel Export**: ExcelJS 4.4 + XLSX
- **Date Handling**: date-fns 2.30

## 📁 Estructura del Proyecto

```
WebPanel/
├── index.html              # HTML raíz
├── vite.config.js          # Configuración de Vite
├── package.json            # Dependencias y scripts
├── nginx.conf              # Configuración Nginx para producción
├── src/
│   ├── main.jsx           # Punto de entrada React
│   ├── App.jsx            # Componente raíz + Router
│   ├── index.css          # Estilos globales
│   ├── components/        # Componentes reutilizables
│   │   ├── Layout.jsx            # Layout principal con Sidebar
│   │   ├── ProtectedRoute.jsx   # HOC para rutas protegidas
│   │   ├── DataTable.jsx         # Tabla genérica con paginación
│   │   ├── DigitalSignature.jsx  # Canvas para firmas digitales
│   │   ├── FormularioLavadoManos.jsx
│   │   └── Footer.jsx
│   ├── pages/             # Vistas principales
│   │   ├── Login.jsx             # Pantalla de login
│   │   ├── Dashboard.jsx         # Dashboard con estadísticas
│   │   ├── Asistencias.jsx       # Registro de fichajes
│   │   ├── Usuarios.jsx          # CRUD de usuarios
│   │   ├── Reportes.jsx          # Exportación Excel
│   │   ├── Auditoria.jsx         # Logs del sistema
│   │   ├── Configuracion.jsx     # Ajustes globales
│   │   └── HACCP/                # Formularios HACCP
│   │       ├── RecepcionMercaderia.jsx
│   │       ├── RecepcionAbarrotes.jsx
│   │       ├── ControlCoccion.jsx
│   │       ├── LavadoFrutas.jsx
│   │       ├── LavadoManos.jsx
│   │       └── TemperaturaCamaras.jsx
│   ├── context/
│   │   └── AuthContext.jsx      # Context de autenticación global
│   ├── services/
│   │   └── api.js               # Cliente Axios + endpoints
│   ├── config/
│   │   └── environment.js       # Detección de entorno (dev/prod)
│   ├── styles/
│   │   └── buttons.css          # Estilos personalizados
│   └── utils/
│       ├── exportExcel.js       # Helper para exportar a Excel
│       └── timeConfig.js        # Configuración de zona horaria
```

## 🚀 Scripts Disponibles

```json
{
  "dev": "vite",                          // Servidor desarrollo (localhost:5173)
  "build": "vite build",                  // Build para producción
  "build:prod": "vite build --mode production",
  "preview": "vite preview",              // Preview del build
  "lint": "eslint . --ext js,jsx",        // Linter de código
  "deploy": "npm run build && echo ...",  // Build + instrucciones
  "deploy:prod": "npm run build:prod ...",
  "clean": "rm -rf dist node_modules/.cache",
  "dev:remote": "vite --host 0.0.0.0 --port 3000"  // Acceso desde red local
}
```

## ⚙️ Configuración y Variables de Entorno

El frontend detecta automáticamente el entorno usando `config/environment.js`:

```javascript
// Configuración automática
export function detectEnvironment() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('18.216.180.19')) {
    return 'production-aws';
  }
  return 'production';
}

export function getEnvironmentConfig() {
  const env = detectEnvironment();
  
  const configs = {
    'development': {
      API_URL: 'http://localhost:3000/api',
      ENV_NAME: 'Desarrollo Local'
    },
    'production-aws': {
      API_URL: 'http://18.216.180.19:3000/api',
      ENV_NAME: 'Producción AWS'
    }
  };
  
  return configs[env];
}
```

### Crear archivo `.env` (opcional para override)

```env
VITE_API_URL=http://localhost:3000/api
VITE_ENV_NAME=development
```

## 🎨 Tema y Diseño

El panel usa un tema personalizado tipo UNIFYDATA con Material-UI:

```javascript
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1',  // Indigo
      light: '#818CF8',
      dark: '#4F46E5'
    },
    secondary: {
      main: '#4ADE80',  // Verde menta
      light: '#86EFAC',
      dark: '#22C55E'
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    // ...
  }
});
```

## 🗺️ Rutas de la Aplicación

```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  
  {/* Rutas protegidas */}
  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/asistencias" element={<Asistencias />} />
    <Route path="/usuarios" element={<Usuarios />} />
    <Route path="/reportes" element={<Reportes />} />
    <Route path="/auditoria" element={<Auditoria />} />
    <Route path="/configuracion" element={<Configuracion />} />
    
    {/* HACCP */}
    <Route path="/haccp/recepcion-mercaderia" element={<RecepcionMercaderia />} />
    <Route path="/haccp/recepcion-abarrotes" element={<RecepcionAbarrotes />} />
    <Route path="/haccp/control-coccion" element={<ControlCoccion />} />
    <Route path="/haccp/lavado-frutas" element={<LavadoFrutas />} />
    <Route path="/haccp/lavado-manos" element={<LavadoManos />} />
    <Route path="/haccp/temperatura-camaras" element={<TemperaturaCamaras />} />
  </Route>
  
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## 🔐 Autenticación (AuthContext)

```jsx
// Uso en componentes
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  
  const handleLogin = async (email, password) => {
    const success = await login(email, password);
    if (success) {
      // Redirigir al dashboard
    }
  };
  
  return (
    <div>
      {user ? `Hola ${user.nombre}` : 'No autenticado'}
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

### Token Storage
- JWT guardado en `localStorage` con key `token`
- Se incluye automáticamente en headers de API:
  ```javascript
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  ```

## 📡 Cliente API (`services/api.js`)

```javascript
import axios from 'axios';
import { getEnvironmentConfig } from '../config/environment';

const config = getEnvironmentConfig();
const API_URL = config.API_URL;

// Configuración global Axios
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para incluir token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401 (token expirado)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
```

### Endpoints disponibles

```javascript
// Autenticación
POST /auth/login
POST /auth/google
GET  /auth/me

// Dashboard
GET /dashboard/stats
GET /dashboard/asistencias-hoy
GET /dashboard/empleados-activos

// Asistencias
GET  /fichado/hoy
GET  /fichado/mis-fichajes
POST /fichado/marcar

// HACCP
GET  /haccp/recepcion-mercaderia
POST /haccp/recepcion-mercaderia
GET  /haccp/lavado-frutas
POST /haccp/lavado-frutas
// ... otros formularios

// Usuarios (admin)
GET    /usuarios
POST   /usuarios
PUT    /usuarios/:id
DELETE /usuarios/:id

// Reportes
GET /reportes/asistencias?start=2025-01-01&end=2025-01-31
GET /reportes/haccp/:tipo?start=...&end=...

// Auditoría
GET /auditoria
```

## 📊 Componentes Principales

### Dashboard
- **Estadísticas en tiempo real**: Empleados activos, asistencias del día, formularios pendientes
- **Gráficos**: Recharts (líneas, barras, donuts)
- **Filtros**: Por fecha, empleado, tipo de formulario

### DataTable
Tabla genérica reutilizable con:
- Paginación
- Ordenamiento por columnas
- Búsqueda/filtrado
- Acciones personalizables (editar, eliminar, ver)
- Exportación a CSV/Excel

```jsx
<DataTable
  columns={[
    { id: 'nombre', label: 'Nombre', sortable: true },
    { id: 'email', label: 'Email' },
    { id: 'rol', label: 'Rol', render: (row) => <Chip label={row.rol} /> }
  ]}
  data={usuarios}
  onEdit={(row) => handleEdit(row)}
  onDelete={(row) => handleDelete(row)}
  searchable
  exportable
/>
```

### DigitalSignature
Canvas HTML5 para firmas digitales:
```jsx
<DigitalSignature
  onSave={(signatureBase64) => {
    // Guardar firma en formulario
    setFormData({ ...formData, firma: signatureBase64 });
  }}
  onClear={() => console.log('Firma borrada')}
/>
```

### ProtectedRoute
HOC que protege rutas requiriendo autenticación:
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 📦 Build y Deployment

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor desarrollo (puerto 5173)
npm run dev

# Abrir en navegador
http://localhost:5173
```

### Build de Producción

```bash
# Generar build optimizado
npm run build

# La carpeta dist/ contendrá los archivos estáticos

# Preview del build localmente
npm run preview
```

### Deployment en AWS EC2 (Nginx)

1. **Compilar localmente**:
   ```bash
   npm run build:prod
   ```

2. **Subir archivos al servidor**:
   ```bash
   # Vía SCP
   scp -r dist/* ubuntu@18.216.180.19:/var/www/webpanel/
   
   # O vía FTP/FileZilla
   ```

3. **Configurar Nginx** (`/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name 18.216.180.19;
       
       root /var/www/webpanel;
       index index.html;
       
       # SPA: todas las rutas → index.html
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API al backend
       location /api/ {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # Cache estáticos
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Reiniciar Nginx**:
   ```bash
   sudo systemctl reload nginx
   ```

### Vite Build Optimizations

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,  // Desactivar en producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true  // Eliminar console.log
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui': ['@mui/material', '@mui/icons-material'],
          'charts': ['recharts']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true  // Permitir acceso desde red local
  }
});
```

## 📊 Exportación de Reportes

### Excel con ExcelJS

```javascript
import ExcelJS from 'exceljs';

async function exportarAsistencias(datos) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Asistencias');
  
  // Encabezados
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Empleado', key: 'empleado', width: 30 },
    { header: 'Entrada', key: 'entrada', width: 10 },
    { header: 'Salida', key: 'salida', width: 10 }
  ];
  
  // Datos
  datos.forEach(row => worksheet.addRow(row));
  
  // Estilos
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' }
  };
  
  // Descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `asistencias_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
}
```

## 🔍 Debugging

### Ver logs de red
```javascript
// Activar logs detallados de Axios
axios.interceptors.request.use(config => {
  console.log('→ Request:', config.method.toUpperCase(), config.url);
  return config;
});

axios.interceptors.response.use(response => {
  console.log('← Response:', response.status, response.config.url);
  return response;
});
```

### React DevTools
- Instalar extensión React Developer Tools
- Ver árbol de componentes, props y estado

## 🐛 Troubleshooting

### Error: CORS blocked
- Verificar que backend tenga `cors` habilitado
- Comprobar que `API_URL` en `environment.js` sea correcta

### Error: 401 Unauthorized
- Token expirado → hacer logout y login nuevamente
- Token no enviado → verificar `axios.interceptors.request`

### Build falla
```bash
# Limpiar cache y reinstalar
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Vite no actualiza cambios
```bash
# Ctrl+C para detener servidor
# Limpiar cache de Vite
rm -rf node_modules/.vite
npm run dev
```

## 📱 Responsive Design

El panel es responsivo usando breakpoints de MUI:
- **xs** (móviles): < 600px
- **sm** (tablets): 600px - 960px
- **md** (laptops): 960px - 1280px
- **lg** (desktops): 1280px - 1920px

```jsx
// Ejemplo de diseño adaptable
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',              // 1 columna en móvil
    sm: 'repeat(2, 1fr)',   // 2 columnas en tablet
    md: 'repeat(3, 1fr)'    // 3 columnas en desktop
  },
  gap: 2
}}>
  {/* Cards */}
</Box>
```

## 🔗 Enlaces Relacionados

- [Backend (API REST)](../Backend/README.md)
- [App Android](../Sistema%20de%20Calidad/README.md)
- [Documentación Principal](../README.md)

---

**Versión**: 1.0.0  
**Última actualización**: 24 de noviembre de 2025
