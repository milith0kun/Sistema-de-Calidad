# 🎨 Sistema de Calidad SaaS - Flujos de Usuario y UX

## 📋 Índice

1. [Mapa de Navegación](#mapa-de-navegación)
2. [Flujos de Usuario Completos](#flujos-de-usuario-completos)
3. [Wireframes Conceptuales](#wireframes-conceptuales)
4. [Experiencia de Usuario](#experiencia-de-usuario)
5. [Estados de la Aplicación](#estados-de-la-aplicación)

---

## 🗺️ Mapa de Navegación

### Estructura de Pantallas

```
App Android - Sistema de Calidad SaaS
│
├── 🔐 Autenticación (No Logueado)
│   ├── LoginScreen
│   ├── OrganizationSelectorScreen (si tiene 2+ orgs)
│   ├── CreateOrganizationScreen
│   └── JoinOrganizationScreen
│
├── 🏠 Dashboard (Pantalla Principal)
│   ├── Tarjeta de Bienvenida
│   ├── Estado de Asistencia del Día
│   ├── Acciones Rápidas
│   ├── Estadísticas de Hoy
│   ├── Formularios Pendientes
│   └── Actividad Reciente
│
├── 📍 Asistencias
│   ├── AttendanceMethodSelectorScreen
│   │   ├── QR Scanner
│   │   ├── Biometric (Huella/Face ID)
│   │   ├── GPS Location
│   │   └── Manual Entry (Admin/Manager)
│   ├── AttendanceHistoryScreen
│   └── AttendanceReportScreen (Admin/Manager)
│
├── 📝 Formularios
│   ├── FormsListScreen
│   │   ├── Filtros por Categoría
│   │   └── Búsqueda
│   ├── FormBuilderScreen (Admin)
│   │   ├── Basic Info (nombre, categoría, descripción)
│   │   ├── Field Editor
│   │   ├── Preview
│   │   └── Publish/Draft
│   ├── FillFormScreen
│   │   ├── Renderizado Dinámico de Campos
│   │   └── Validación en Tiempo Real
│   ├── SubmissionsListScreen
│   │   ├── Mis Envíos (Employee)
│   │   └── Todos los Envíos (Admin/Manager)
│   └── SubmissionDetailScreen
│       ├── Ver Datos
│       ├── Aprobar/Rechazar (Manager/Admin)
│       └── Editar (Solo Admin)
│
├── 📊 Reportes (Admin/Manager)
│   ├── ReportsHomeScreen
│   ├── AttendanceReportScreen
│   │   ├── Filtros (fecha, departamento, usuario)
│   │   ├── Tabla de Datos
│   │   ├── Gráficos
│   │   └── Exportar (Excel/PDF)
│   └── FormReportScreen
│       ├── Seleccionar Formulario
│       ├── Analytics por Campo
│       └── Exportar Datos
│
├── 👥 Gestión de Usuarios (Admin)
│   ├── UsersListScreen
│   │   ├── Búsqueda
│   │   ├── Filtros (rol, departamento, estado)
│   │   └── Ordenar
│   ├── UserDetailScreen
│   │   ├── Ver Información
│   │   ├── Editar
│   │   ├── Generar QR Personal
│   │   └── Desactivar/Eliminar
│   ├── InviteUserScreen
│   │   ├── Generar Código
│   │   ├── Compartir (WhatsApp, Email)
│   │   └── Ver Códigos Activos
│   └── BiometricEnrollmentScreen
│
├── 🏢 Gestión de Organización (Admin)
│   ├── OrganizationSettingsScreen
│   │   ├── Info Básica (nombre, logo, industria)
│   │   ├── Configuración de Asistencias
│   │   │   ├── Geofence (radio GPS)
│   │   │   ├── Horarios Laborales
│   │   │   └── Métodos Habilitados
│   │   ├── Personalización (colores, tema)
│   │   └── Zona Horaria
│   ├── QRManagementScreen
│   │   ├── Crear QR de Ubicación
│   │   ├── Crear QR de Usuario
│   │   ├── Lista de QR Activos
│   │   └── Desactivar/Eliminar
│   └── SubscriptionScreen
│       ├── Plan Actual
│       ├── Límites de Uso
│       ├── Comparación de Planes
│       └── Upgrade/Downgrade
│
├── 👤 Perfil y Configuración
│   ├── ProfileScreen
│   │   ├── Información Personal
│   │   ├── Mi QR Personal
│   │   └── Configuración de Cuenta
│   ├── SettingsScreen
│   │   ├── Idioma
│   │   ├── Notificaciones
│   │   ├── Tema (Claro/Oscuro)
│   │   └── Biometría
│   └── AboutScreen
│       ├── Versión de la App
│       ├── Términos y Condiciones
│       └── Política de Privacidad
│
└── 🔔 Notificaciones
    └── NotificationsCenterScreen
        ├── Lista de Notificaciones
        ├── Marcar como Leída
        └── Navegar a Contexto
```

---

## 👤 Flujos de Usuario Completos

### Flujo 1: Onboarding Completo (Usuario Nuevo)

```
┌─────────────────────────────────────────────────────────────────┐
│ PASO 1: DESCARGA Y PRIMER ACCESO                               │
└─────────────────────────────────────────────────────────────────┘

Usuario busca "Sistema de Calidad" en Google Play Store
    ↓
Descarga e instala la app
    ↓
Abre la app por primera vez
    ↓
┌──────────────────────────────────┐
│     Pantalla de Bienvenida       │
│                                  │
│  [Logo de la App]                │
│                                  │
│  Sistema de Calidad SaaS         │
│  Gestión inteligente para tu    │
│  organización                    │
│                                  │
│  [Botón: Continuar con Google]  │
│                                  │
│  Versión 2.0.0                   │
└──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PASO 2: AUTENTICACIÓN CON GOOGLE                               │
└─────────────────────────────────────────────────────────────────┘

Usuario hace clic en "Continuar con Google"
    ↓
Se abre selector de cuentas de Google del sistema
    ↓
┌──────────────────────────────────┐
│   Selecciona una cuenta          │
│                                  │
│  ○ juan.perez@hotel.com          │
│    Juan Pérez                    │
│                                  │
│  ○ personal@gmail.com            │
│    Juan Personal                 │
│                                  │
│  + Usar otra cuenta              │
└──────────────────────────────────┘
    ↓
Usuario selecciona juan.perez@hotel.com
    ↓
Google valida y retorna ID Token
    ↓
Backend valida token
    ↓
Backend consulta si el email existe en global_users
    ↓
❌ No existe → Crear nuevo usuario
    ↓
Backend crea registro en global_users:
{
  user_id: "user_abc123",
  email: "juan.perez@hotel.com",
  google_id: "105849372165843721954",
  full_name: "Juan Pérez García",
  google_photo: "https://...",
  organizations: []  // Vacío
}

┌─────────────────────────────────────────────────────────────────┐
│ PASO 3: CREAR O UNIRSE A ORGANIZACIÓN                          │
└─────────────────────────────────────────────────────────────────┘

Backend retorna: organizations.length == 0
    ↓
App navega a OrganizationOnboardingScreen
    ↓
┌──────────────────────────────────┐
│  👋 ¡Bienvenido, Juan!           │
│                                  │
│  Para comenzar, necesitas        │
│  crear una organización o        │
│  unirte a una existente.         │
│                                  │
│  ┌────────────────────────────┐ │
│  │ 🏢 Crear Organización      │ │
│  │ Soy el administrador       │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ 🔗 Unirme con Código       │ │
│  │ Mi empresa me invitó       │ │
│  └────────────────────────────┘ │
└──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ESCENARIO A: CREAR ORGANIZACIÓN                                │
└─────────────────────────────────────────────────────────────────┘

Usuario selecciona "Crear Organización"
    ↓
┌──────────────────────────────────┐
│  Crear Nueva Organización        │
│                                  │
│  Nombre de la Organización       │
│  ┌────────────────────────────┐ │
│  │ Hotel Miraflores S.A.C.    │ │
│  └────────────────────────────┘ │
│                                  │
│  Industria                       │
│  ┌────────────────────────────┐ │
│  │ Hotelería y Turismo    ▼  │ │
│  └────────────────────────────┘ │
│                                  │
│  País                            │
│  ┌────────────────────────────┐ │
│  │ Perú                   ▼  │ │
│  └────────────────────────────┘ │
│                                  │
│  Zona Horaria                    │
│  ┌────────────────────────────┐ │
│  │ America/Lima (UTC-5)   ▼  │ │
│  └────────────────────────────┘ │
│                                  │
│  [Cancelar]     [Crear]          │
└──────────────────────────────────┘
    ↓
Usuario completa formulario y hace clic en "Crear"
    ↓
Backend valida datos
    ↓
Backend genera organization_id: "org_5f3a2b1c"
    ↓
Backend crea registro en global/organizations:
{
  organization_id: "org_5f3a2b1c",
  name: "Hotel Miraflores S.A.C.",
  industry: "hospitality",
  plan: "free",
  admin_users: ["user_abc123"]
}
    ↓
Backend crea base de datos: org_5f3a2b1c
    ↓
Backend actualiza global_users:
organizations: [{
  org_id: "org_5f3a2b1c",
  role: "admin",
  joined_at: "2025-11-24"
}]
    ↓
Backend genera JWT con:
{
  user_id: "user_abc123",
  org_id: "org_5f3a2b1c",
  role: "admin",
  permissions: ["*"]  // Admin tiene todos los permisos
}
    ↓
App guarda JWT + org_id en SharedPreferences
    ↓
App navega a Dashboard
    ↓
┌──────────────────────────────────┐
│  🎉 ¡Organización creada!        │
│                                  │
│  Ya puedes comenzar a usar       │
│  el sistema. Te recomendamos:    │
│                                  │
│  1. Invitar a tus empleados      │
│  2. Crear tu primer formulario   │
│  3. Generar código QR de entrada │
│                                  │
│  [Comenzar Tutorial]  [Omitir]   │
└──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ESCENARIO B: UNIRSE A ORGANIZACIÓN                             │
└─────────────────────────────────────────────────────────────────┘

Usuario selecciona "Unirme con Código"
    ↓
┌──────────────────────────────────┐
│  Unirse a Organización           │
│                                  │
│  Ingresa el código de 6 dígitos  │
│  que te proporcionó tu empresa:  │
│                                  │
│  ┌───┬───┬───┬───┬───┬───┐      │
│  │ A │ B │ C │ 1 │ 2 │ 3 │      │
│  └───┴───┴───┴───┴───┴───┘      │
│                                  │
│  [Cancelar]     [Unirse]         │
└──────────────────────────────────┘
    ↓
Usuario ingresa código "ABC123"
    ↓
Envía POST /api/organizations/join { code: "ABC123" }
    ↓
Backend valida:
  - Código existe en tabla de invitaciones
  - No está expirado (vigencia 7 días)
  - Organización está activa
    ↓
✅ Código válido
    ↓
Backend agrega usuario a org_5f3a2b1c/users:
{
  user_id: "user_abc123",
  role: "employee",  // Rol por defecto
  status: "active",
  joined_at: "2025-11-24"
}
    ↓
Backend actualiza global_users.organizations
    ↓
Backend genera JWT
    ↓
App guarda credenciales
    ↓
App navega a Dashboard
    ↓
Notificación push al Admin: "Juan Pérez se unió a tu organización"
```

---

### Flujo 2: Crear y Publicar Formulario Personalizado

```
┌─────────────────────────────────────────────────────────────────┐
│ CONTEXTO: Admin necesita crear formulario de Control de Calidad│
└─────────────────────────────────────────────────────────────────┘

Admin (María, Gerente General) abre la app
    ↓
Navega a pantalla "Formularios"
    ↓
┌──────────────────────────────────┐
│  ← Formularios                   │
│                                  │
│  [Buscar formularios...]         │
│                                  │
│  📋 Mis Formularios (2)          │
│  ┌────────────────────────────┐ │
│  │ 🍃 Control de Lavado       │ │
│  │    12 envíos hoy           │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ 🧪 Control de Cocción      │ │
│  │    8 envíos hoy            │ │
│  └────────────────────────────┘ │
│                                  │
│  [+ Crear Formulario]            │
└──────────────────────────────────┘
    ↓
Admin hace clic en "+ Crear Formulario"
    ↓
┌──────────────────────────────────┐
│  × Crear Formulario              │
│                                  │
│  Información Básica              │
│  ────────────────────             │
│                                  │
│  Nombre *                        │
│  ┌────────────────────────────┐ │
│  │ Control de Temperatura     │ │
│  │ de Refrigeradores          │ │
│  └────────────────────────────┘ │
│                                  │
│  Descripción                     │
│  ┌────────────────────────────┐ │
│  │ Registro diario de         │ │
│  │ temperaturas de cámaras    │ │
│  │ frigoríficas...            │ │
│  └────────────────────────────┘ │
│                                  │
│  Categoría *                     │
│  ┌────────────────────────────┐ │
│  │ ☑ Control de Calidad   ▼  │ │
│  └────────────────────────────┘ │
│                                  │
│  Icono y Color                   │
│  🌡️  [Seleccionar]  🟦 [Color]  │
│                                  │
│  ────────────────────             │
│  Campos del Formulario (0)       │
│  ────────────────────             │
│                                  │
│  [+ Agregar Campo]               │
│                                  │
│  [Guardar Borrador]  [Publicar]  │
└──────────────────────────────────┘
    ↓
Admin hace clic en "Agregar Campo"
    ↓
┌──────────────────────────────────┐
│  Selecciona Tipo de Campo        │
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ Abc │ │ 123 │ │ ☑   │        │
│  │Texto│ │Núm. │ │Check│        │
│  └─────┘ └─────┘ └─────┘        │
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ 📅  │ │ 📷  │ │ ✍️  │        │
│  │Fecha│ │Foto │ │Firma│        │
│  └─────┘ └─────┘ └─────┘        │
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ 📍  │ │ 👤  │ │ 📋  │        │
│  │Ubic.│ │User │ │Lista│        │
│  └─────┘ └─────┘ └─────┘        │
│                                  │
│  ┌─────┐ ┌─────┐                │
│  │ ⭐  │ │ 🌡️ │                 │
│  │Rating│Temp.│                 │
│  └─────┘ └─────┘                │
│                                  │
│  [Cancelar]                      │
└──────────────────────────────────┘
    ↓
Admin selecciona "Fecha" (📅)
    ↓
┌──────────────────────────────────┐
│  Configurar Campo: Fecha         │
│                                  │
│  Etiqueta *                      │
│  ┌────────────────────────────┐ │
│  │ Fecha del Control          │ │
│  └────────────────────────────┘ │
│                                  │
│  Texto de Ayuda                  │
│  ┌────────────────────────────┐ │
│  │ Fecha en que se realizó    │ │
│  │ la medición                │ │
│  └────────────────────────────┘ │
│                                  │
│  ☑ Campo Requerido               │
│  ☑ Usar Fecha Actual por Defecto│
│                                  │
│  Validación                      │
│  Fecha Mínima: [01/01/2025]      │
│  Fecha Máxima: [Hoy]             │
│                                  │
│  [Cancelar]    [Guardar Campo]   │
└──────────────────────────────────┘
    ↓
Admin configura y guarda
    ↓
Vuelve a pantalla de creación, ahora con 1 campo:
┌──────────────────────────────────┐
│  × Crear Formulario              │
│  ...                             │
│  ────────────────────             │
│  Campos del Formulario (1)       │
│  ────────────────────             │
│                                  │
│  ┌────────────────────────────┐ │
│  │ 1  📅 Fecha del Control    │ │
│  │    Tipo: Fecha             │ │
│  │    Requerido ✓             │ │
│  │    [✏️ Editar] [🗑️ Borrar] │ │
│  └────────────────────────────┘ │
│                                  │
│  [+ Agregar Campo]               │
│  ...                             │
└──────────────────────────────────┘
    ↓
Admin repite proceso y agrega:
  - Campo 2: Hora (🕐)
  - Campo 3: Responsable (👤 Selector de Usuario)
  - Campo 4: Cámara Frigorífica (📋 Selector: "Cámara 1", "Cámara 2", "Cámara 3")
  - Campo 5: Temperatura (°C) (123 Número, rango -30 a 10)
  - Campo 6: Cumple Normativa (☑ Checkbox)
  - Campo 7: Observaciones (Abc Área de Texto)
    ↓
Ahora tiene 7 campos configurados
    ↓
Admin hace clic en "Vista Previa"
    ↓
┌──────────────────────────────────┐
│  Vista Previa                    │
│                                  │
│  Control de Temperatura de       │
│  Refrigeradores                  │
│                                  │
│  Registro diario de...           │
│  ────────────────────             │
│                                  │
│  Fecha del Control *             │
│  [24/11/2025]                    │
│                                  │
│  Hora *                          │
│  [10:30]                         │
│                                  │
│  Responsable *                   │
│  [Seleccionar empleado ▼]        │
│                                  │
│  Cámara Frigorífica *            │
│  [Seleccionar cámara ▼]          │
│                                  │
│  Temperatura (°C) *              │
│  [____] °C                       │
│                                  │
│  ☐ Cumple Normativa              │
│                                  │
│  Observaciones                   │
│  [Texto libre...]                │
│                                  │
│  [Cerrar Vista Previa]           │
└──────────────────────────────────┘
    ↓
Admin verifica que todo está correcto
    ↓
Cierra vista previa
    ↓
Hace clic en "Publicar"
    ↓
App valida que al menos tenga 1 campo
    ↓
Envía POST /api/forms
{
  "name": "Control de Temperatura de Refrigeradores",
  "description": "Registro diario de...",
  "category": "quality_control",
  "icon": "thermometer",
  "color": "#4ADE80",
  "fields": [
    {
      "field_id": "fecha_control",
      "type": "date",
      "label": "Fecha del Control",
      "required": true,
      "default_value": "today",
      "order": 1
    },
    {
      "field_id": "hora",
      "type": "time",
      "label": "Hora",
      "required": true,
      "order": 2
    },
    // ... resto de campos
  ],
  "status": "active"
}
    ↓
Backend valida y guarda en org_5f3a2b1c/custom_forms
    ↓
Backend retorna confirmación
    ↓
App muestra toast: "✅ Formulario publicado exitosamente"
    ↓
Navega de vuelta a lista de formularios
    ↓
Ahora aparece el nuevo formulario
    ↓
Todos los empleados de la org ahora pueden ver y llenar este formulario
```

---

### Flujo 3: Empleado Llena Formulario y Lo Envía

```
┌─────────────────────────────────────────────────────────────────┐
│ CONTEXTO: Pedro (empleado de cocina) debe registrar temperatura│
└─────────────────────────────────────────────────────────────────┘

Pedro abre la app a las 14:00
    ↓
Dashboard muestra notificación:
┌──────────────────────────────────┐
│  🏠 Dashboard                    │
│                                  │
│  👋 Hola, Pedro                  │
│  ────────────────────             │
│                                  │
│  📋 Pendientes (1)               │
│  ┌────────────────────────────┐ │
│  │ 🌡️ Control de Temperatura  │ │
│  │    Vence hoy a las 18:00   │ │
│  │    [Completar Ahora]       │ │
│  └────────────────────────────┘ │
│  ...                             │
└──────────────────────────────────┘
    ↓
Pedro hace clic en "Completar Ahora"
    ↓
Navega a FillFormScreen
    ↓
┌──────────────────────────────────┐
│  ← Control de Temperatura        │
│     de Refrigeradores            │
│                                  │
│  Registro diario de temperaturas │
│  de cámaras frigoríficas         │
│  ────────────────────             │
│                                  │
│  Fecha del Control *             │
│  ┌────────────────────────────┐ │
│  │ 24/11/2025            📅  │ │
│  └────────────────────────────┘ │
│  ✓ Llenado automáticamente       │
│                                  │
│  Hora *                          │
│  ┌────────────────────────────┐ │
│  │ 14:00                 🕐  │ │
│  └────────────────────────────┘ │
│                                  │
│  Responsable *                   │
│  ┌────────────────────────────┐ │
│  │ Pedro Sánchez         ▼   │ │
│  └────────────────────────────┘ │
│  ✓ Auto-seleccionado             │
│                                  │
│  [Guardar Borrador]  [Enviar]    │
└──────────────────────────────────┘
    ↓
Pedro hace scroll hacia abajo
    ↓
┌──────────────────────────────────┐
│  ...                             │
│  Cámara Frigorífica *            │
│  ┌────────────────────────────┐ │
│  │ [Seleccionar]         ▼   │ │
│  └────────────────────────────┘ │
│                                  │
│  Temperatura (°C) *              │
│  ┌────────────────────────────┐ │
│  │                        °C  │ │
│  └────────────────────────────┘ │
│                                  │
│  ☐ Cumple Normativa              │
│                                  │
│  Observaciones                   │
│  ┌────────────────────────────┐ │
│  │                            │ │
│  │                            │ │
│  └────────────────────────────┘ │
│                                  │
│  [Guardar Borrador]  [Enviar]    │
└──────────────────────────────────┘
    ↓
Pedro hace clic en "Cámara Frigorífica"
    ↓
┌──────────────────────────────────┐
│  Selecciona Cámara               │
│                                  │
│  ○ Cámara 1 - Carnes             │
│  ○ Cámara 2 - Lácteos            │
│  ○ Cámara 3 - Vegetales          │
│                                  │
│  [Cancelar]                      │
└──────────────────────────────────┘
    ↓
Pedro selecciona "Cámara 2 - Lácteos"
    ↓
Vuelve al formulario
    ↓
Campo ahora muestra: "Cámara 2 - Lácteos"
    ↓
Pedro hace clic en "Temperatura (°C)"
    ↓
Aparece teclado numérico
    ↓
Pedro ingresa: "4.5"
    ↓
App valida en tiempo real:
  - Está en rango (-30 a 10)? ✅ Sí
  - Es número válido? ✅ Sí
    ↓
Campo acepta el valor
    ↓
Pedro marca checkbox "Cumple Normativa" ✓
    ↓
Pedro escribe en Observaciones: "Todo en orden, cámara funcionando correctamente"
    ↓
Pedro hace scroll arriba para revisar
    ↓
Todos los campos requeridos tienen valores ✅
    ↓
Pedro hace clic en "Enviar"
    ↓
App ejecuta validación completa:
  ✅ Fecha del Control: 24/11/2025 (válido)
  ✅ Hora: 14:00 (válido)
  ✅ Responsable: Pedro Sánchez (válido)
  ✅ Cámara: Cámara 2 - Lácteos (válido)
  ✅ Temperatura: 4.5°C (en rango -30 a 10) ✅
  ✅ Cumple Normativa: Sí (válido)
  ⚪ Observaciones: "Todo en orden..." (opcional, válido)
    ↓
Validación exitosa ✅
    ↓
App captura ubicación GPS actual: (-12.0464, -77.0428)
    ↓
App muestra loading: "Enviando..."
    ↓
Envía POST /api/submissions
{
  "form_id": "form_temp_refrigerators",
  "data": {
    "fecha_control": "2025-11-24",
    "hora": "14:00",
    "responsable": "user_xyz789",
    "camara": "Cámara 2 - Lácteos",
    "temperatura": 4.5,
    "cumple_normativa": true,
    "observaciones": "Todo en orden, cámara funcionando correctamente"
  },
  "location": {
    "latitude": -12.0464,
    "longitude": -77.0428
  }
}
    ↓
Backend valida datos nuevamente
    ↓
Backend crea registro en org_5f3a2b1c/form_submissions:
{
  "_id": ObjectId("..."),
  "submission_id": "sub_temp_20251124_001",
  "form_id": "form_temp_refrigerators",
  "submitted_by": "user_xyz789",
  "submitted_at": ISODate("2025-11-24T14:00:15Z"),
  "data": { ... },
  "location": { ... },
  "status": "pending"
}
    ↓
Backend retorna confirmación
    ↓
App oculta loading
    ↓
App muestra toast: "✅ Formulario enviado exitosamente"
    ↓
App navega de vuelta a lista de formularios
    ↓
Dashboard ya no muestra el pendiente
    ↓
Pedro puede ver su submission en "Mis Envíos"
```

---

## 🎨 Wireframes Conceptuales

### Pantalla: Dashboard (Employee)

```
┌─────────────────────────────────────────────────────┐
│ ☰  Sistema de Calidad              🔔(2)  👤       │ ← TopBar
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 👋 Hola, Pedro                              │   │ ← Tarjeta Bienvenida
│  │ Hotel Miraflores S.A.C.                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ✅ Entrada Registrada                       │   │ ← Estado Asistencia
│  │ 08:05 AM • Método: QR                       │   │
│  │                                             │   │
│  │ [Registrar Salida]                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Acciones Rápidas                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │    📍    │ │    📝    │ │    📊    │          │ ← Botones Acción
│  │  Fichar  │ │Formularios│ │ Reportes │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                     │
│  📋 Formularios Pendientes (2)                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🌡️ Control de Temperatura                   │   │ ← Lista Pendientes
│  │    Vence hoy a las 18:00                    │   │
│  │    [Completar Ahora]                        │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🧼 Control de Lavado de Manos               │   │
│  │    Vence hoy a las 16:00                    │   │
│  │    [Completar Ahora]                        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🕐 Actividad Reciente                             │
│  • Juan M. registró salida - Hace 5 min            │
│  • María G. completó Control de Cocción - 10 min   │
│  • Tú registraste entrada - 6 horas                │
│                                                     │
└─────────────────────────────────────────────────────┘
│ 🏠   📝   📊   👤                                  │ ← Bottom Nav
└─────────────────────────────────────────────────────┘
```

### Pantalla: Fichaje (Selector de Método)

```
┌─────────────────────────────────────────────────────┐
│ ←  Fichado                                 ⋮       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Selecciona cómo quieres fichar                    │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │              📱                                │ │
│  │         Escanear QR                           │ │
│  │  Rápido y fácil, solo apunta la cámara       │ │
│  │                                               │ │
│  │         [Escanear QR Code]                    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │              👆                                │ │
│  │         Huella Digital                        │ │
│  │  Usa el sensor de huella de tu dispositivo    │ │
│  │                                               │ │
│  │         [Usar Biometría]                      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │              📍                                │ │
│  │         Ubicación GPS                         │ │
│  │  Valida que estés en el lugar de trabajo      │ │
│  │                                               │ │
│  │         [Fichar con GPS]                      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ────────────────────────────────────────────────  │
│                                                     │
│  Tu última asistencia:                             │
│  Entrada: 24/11/2025 08:05 AM (QR)                │
│                                                     │
│  [Ver Historial de Asistencias]                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

**Continuará en siguiente documento con:**
- Modelo de negocio Freemium
- Planes y precios
- Roadmap de implementación por fases
- Métricas de éxito
- Estrategia de lanzamiento

---

**Versión**: 1.0  
**Fecha**: 24 de noviembre de 2025  
**Autor**: Sistema de Calidad Team
