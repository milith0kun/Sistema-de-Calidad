# 📋 Sistema de Calidad SaaS - Requerimientos Funcionales

## 📖 Índice

1. [Visión General del Producto](#visión-general-del-producto)
2. [Usuarios y Roles](#usuarios-y-roles)
3. [Requerimientos Funcionales](#requerimientos-funcionales)
4. [Casos de Uso Principales](#casos-de-uso-principales)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Reglas de Negocio](#reglas-de-negocio)
7. [Restricciones y Consideraciones](#restricciones-y-consideraciones)

---

## 🎯 Visión General del Producto

### Objetivo
Transformar el sistema HACCP específico para hoteles en una **plataforma SaaS multi-tenant** disponible en Google Play Store que permita a cualquier organización (hoteles, restaurantes, fábricas, clínicas, etc.) gestionar:

- **Asistencias de empleados** con múltiples métodos de verificación
- **Formularios personalizados** creados sin código desde la app móvil
- **Captura y análisis de datos** en tiempo real
- **Reportes y auditoría** completa de operaciones

### Propuesta de Valor

| Beneficio | Descripción |
|-----------|-------------|
| **Flexibilidad Total** | Los usuarios crean sus propios formularios sin depender de desarrollo |
| **Multi-Industria** | No limitado a HACCP, aplicable a cualquier sector |
| **Sin Instalación** | App móvil descargable de Play Store, backend en la nube |
| **Multi-Tenant** | Miles de organizaciones en la misma infraestructura |
| **Escalable** | Desde pequeñas empresas (5 empleados) hasta corporativos (1000+) |
| **Freemium** | Plan gratuito para probar, planes premium con más funciones |

### Transformación vs Sistema Actual

| Aspecto | Sistema Actual (HACCP Hotel) | Sistema SaaS |
|---------|------------------------------|--------------|
| **Usuarios** | Un solo hotel | Múltiples organizaciones independientes |
| **Formularios** | 6 formularios hardcodeados (HACCP) | Ilimitados, creados por usuarios |
| **Base de Datos** | SQLite local en servidor | MongoDB Atlas cloud multi-tenant |
| **Fichaje** | Solo GPS | QR + Huella + GPS + Manual |
| **Acceso** | IP fija del hotel | Desde cualquier lugar del mundo |
| **Deployment** | AWS EC2 dedicado | Play Store + Backend escalable |
| **Costo** | Infraestructura completa | Modelo Freemium/Subscripción |

---

## 👥 Usuarios y Roles

### Tipos de Usuario

#### 1. **Super Admin de la Plataforma** (Nosotros - Desarrolladores)
- **Responsabilidad**: Mantenimiento de la infraestructura global
- **Acceso**: Panel web administrativo (fuera de alcance de este proyecto)
- **Capacidades**:
  - Ver todas las organizaciones registradas
  - Gestionar subscripciones y pagos
  - Suspender/activar organizaciones
  - Analíticas globales de uso
  - Soporte técnico

#### 2. **Admin de Organización**
- **Responsabilidad**: Configuración y gestión de su organización
- **Perfil**: Gerente general, Director de RRHH, Jefe de Operaciones
- **Capacidades**:
  - Crear/editar/eliminar formularios personalizados
  - Gestionar usuarios (invitar, asignar roles, desactivar)
  - Generar códigos QR para ubicaciones
  - Configurar parámetros de la organización
  - Ver todos los reportes y auditoría
  - Exportar datos
  - Aprobar/rechazar registros
  - Gestionar subscripción (upgrade/downgrade)

#### 3. **Manager/Supervisor**
- **Responsabilidad**: Supervisión de equipo y validación de datos
- **Perfil**: Jefe de área, Supervisor de turno
- **Capacidades**:
  - Ver reportes de su área/departamento
  - Aprobar/rechazar submissions de formularios
  - Registro manual de asistencias (excepciones)
  - Crear formularios (limitado según plan)
  - Ver usuarios de su equipo
  - Exportar reportes de su área

#### 4. **Employee (Empleado)**
- **Responsabilidad**: Registro de asistencia y llenado de formularios
- **Perfil**: Personal operativo
- **Capacidades**:
  - Fichar entrada/salida (QR, huella, GPS)
  - Llenar formularios asignados
  - Ver su historial de asistencias
  - Ver sus propias submissions
  - Recibir notificaciones de formularios pendientes

#### 5. **Usuario Sin Organización**
- **Estado temporal**: Usuario que hizo login pero no pertenece a ninguna org
- **Capacidades**:
  - Crear nueva organización (se convierte en Admin)
  - Unirse a organización existente con código de invitación

---

## ✅ Requerimientos Funcionales

### RF-001: Autenticación y Autorización

#### RF-001.1 Login con Google OAuth
- **Prioridad**: CRÍTICA
- **Descripción**: Los usuarios deben poder autenticarse usando su cuenta de Google
- **Criterios de Aceptación**:
  - ✅ Al abrir la app, se muestra botón "Continuar con Google"
  - ✅ Se usa Credential Manager API de Android (no GoogleSignInClient legacy)
  - ✅ Backend valida el Google ID Token con google-auth-library
  - ✅ Si el usuario no existe, se crea automáticamente en la base de datos global
  - ✅ Si el usuario existe, se recupera su lista de organizaciones
  - ✅ Se genera un JWT con información del usuario + org_id seleccionada
  - ✅ El JWT tiene duración de 7 días (configurable)

#### RF-001.2 Selector de Organización
- **Prioridad**: CRÍTICA
- **Descripción**: Usuarios que pertenecen a múltiples organizaciones deben poder seleccionar con cuál trabajar
- **Criterios de Aceptación**:
  - ✅ Después del login, si el usuario tiene 0 organizaciones → pantalla "Crear/Unirse"
  - ✅ Si tiene 1 organización → auto-selección y navegar a Dashboard
  - ✅ Si tiene 2+ organizaciones → mostrar lista para seleccionar
  - ✅ Cada tarjeta de organización muestra: logo, nombre, rol del usuario, cantidad de miembros
  - ✅ Al seleccionar, se actualiza el contexto global de la app
  - ✅ En el Dashboard, hay opción para "Cambiar de Organización"

#### RF-001.3 Control de Acceso por Roles
- **Prioridad**: ALTA
- **Descripción**: Las funcionalidades deben estar restringidas según el rol del usuario
- **Criterios de Aceptación**:
  - ✅ Admin puede acceder a todas las pantallas
  - ✅ Manager puede ver reportes de su área, aprobar submissions
  - ✅ Employee solo puede fichar y llenar formularios
  - ✅ Botones/opciones no disponibles se ocultan o deshabilitan según el rol
  - ✅ Backend valida permisos en cada endpoint

---

### RF-002: Gestión de Organizaciones

#### RF-002.1 Crear Organización
- **Prioridad**: CRÍTICA
- **Descripción**: Usuarios sin organización deben poder crear una nueva
- **Criterios de Aceptación**:
  - ✅ Formulario solicita: nombre, industria (selector), país, zona horaria
  - ✅ Se genera automáticamente un `organization_id` único
  - ✅ Se crea una base de datos dedicada en MongoDB Atlas: `org_{id}`
  - ✅ El usuario creador se marca como Admin automáticamente
  - ✅ Se asigna plan "Free" por defecto
  - ✅ Se envía email de bienvenida (opcional)

#### RF-002.2 Unirse a Organización
- **Prioridad**: ALTA
- **Descripción**: Usuarios deben poder unirse a organizaciones existentes mediante código de invitación
- **Criterios de Aceptación**:
  - ✅ Admin genera un código de invitación de 6 dígitos alfanuméricos
  - ✅ Código tiene fecha de expiración (7 días por defecto, configurable)
  - ✅ Usuario ingresa el código en pantalla "Unirse a Organización"
  - ✅ Si el código es válido, el usuario se agrega con rol "Employee" por defecto
  - ✅ Admin puede cambiar el rol después
  - ✅ Se notifica al Admin que un nuevo usuario se unió

#### RF-002.3 Configurar Organización
- **Prioridad**: MEDIA
- **Descripción**: Admin puede personalizar configuración de su organización
- **Criterios de Aceptación**:
  - ✅ Cambiar nombre, logo, colores del tema
  - ✅ Configurar zona horaria (afecta reportes)
  - ✅ Configurar geofence (radio GPS para fichaje): 50m - 500m
  - ✅ Habilitar/deshabilitar métodos de fichaje (QR, huella, GPS)
  - ✅ Configurar horarios laborales (entrada, salida, tolerancia de retraso)
  - ✅ Configurar idioma predeterminado

#### RF-002.4 Gestionar Subscripción
- **Prioridad**: MEDIA
- **Descripción**: Admin puede ver su plan actual y hacer upgrade/downgrade
- **Criterios de Aceptación**:
  - ✅ Pantalla muestra plan actual (Free/Basic/Premium/Enterprise)
  - ✅ Muestra límites: usuarios, formularios, submissions/mes, almacenamiento
  - ✅ Botón "Mejorar Plan" abre modal con comparación de planes
  - ✅ Integración con sistema de pagos (Stripe/MercadoPago) - Fase 2
  - ✅ Al cambiar plan, límites se actualizan inmediatamente

---

### RF-003: Gestión de Usuarios

#### RF-003.1 Invitar Usuarios
- **Prioridad**: ALTA
- **Descripción**: Admin puede invitar nuevos empleados a la organización
- **Criterios de Aceptación**:
  - ✅ Admin genera código de invitación desde la app
  - ✅ Código puede enviarse por WhatsApp, email o mostrar QR
  - ✅ Admin puede ver códigos activos y revocarlos
  - ✅ Al usar el código, el nuevo usuario se une automáticamente

#### RF-003.2 Listar y Buscar Usuarios
- **Prioridad**: ALTA
- **Descripción**: Admin/Manager pueden ver lista de usuarios de la organización
- **Criterios de Aceptación**:
  - ✅ Lista muestra: foto, nombre, email, rol, departamento, estado (activo/inactivo)
  - ✅ Barra de búsqueda por nombre o email
  - ✅ Filtros: por rol, departamento, estado
  - ✅ Ordenar por: nombre, fecha de ingreso, última asistencia

#### RF-003.3 Editar Usuario
- **Prioridad**: ALTA
- **Descripción**: Admin puede editar información de cualquier usuario
- **Criterios de Aceptación**:
  - ✅ Cambiar nombre, cargo, departamento, turno
  - ✅ Cambiar rol (employee → manager → admin)
  - ✅ Asignar código de empleado único
  - ✅ Activar/desactivar usuario
  - ✅ Generar QR personal para fichaje
  - ✅ Todos los cambios quedan registrados en auditoría

#### RF-003.4 Eliminar/Desactivar Usuario
- **Prioridad**: MEDIA
- **Descripción**: Admin puede remover usuarios de la organización
- **Criterios de Aceptación**:
  - ✅ Opción "Desactivar" marca usuario como inactivo (no puede hacer login)
  - ✅ Opción "Eliminar" remueve al usuario de la organización
  - ✅ Los datos históricos del usuario se mantienen (asistencias, submissions)
  - ✅ Confirmación obligatoria antes de eliminar
  - ✅ No se puede eliminar al último Admin de la org

---

### RF-004: Sistema de Asistencias Mejorado

#### RF-004.1 Fichaje por Código QR
- **Prioridad**: CRÍTICA
- **Descripción**: Empleados pueden fichar escaneando un código QR ubicado en la entrada
- **Criterios de Aceptación**:
  - ✅ Admin genera QR para ubicación (ej: "Entrada Principal")
  - ✅ QR se puede imprimir o mostrar en pantalla
  - ✅ Empleado abre app → Fichado → "Escanear QR"
  - ✅ Cámara escanea el código y se envía al backend
  - ✅ Backend valida que el QR exista, esté activo y no expirado
  - ✅ Backend valida que la ubicación GPS del empleado esté dentro del radio del QR
  - ✅ Se registra asistencia con método "qr_code"
  - ✅ Notificación de confirmación: "Entrada registrada a las 08:03 AM"
  - ✅ Si ya fichó entrada, el mismo QR sirve para marcar salida

#### RF-004.2 Fichaje por Huella Digital / Face ID
- **Prioridad**: ALTA
- **Descripción**: Empleados pueden fichar usando biometría del dispositivo
- **Criterios de Aceptación**:
  - ✅ En la app, opción "Fichar con Huella/Face ID"
  - ✅ Se muestra BiometricPrompt de Android
  - ✅ Usuario coloca dedo o escanea rostro
  - ✅ Si la autenticación biométrica es exitosa localmente, se envía fichaje
  - ✅ Backend recibe flag `biometric_verified: true`
  - ✅ No se transmiten datos biométricos, solo confirmación local
  - ✅ Si el dispositivo no tiene biometría, opción no aparece

#### RF-004.3 Fichaje por GPS (Método Actual Mejorado)
- **Prioridad**: ALTA
- **Descripción**: Empleados pueden fichar validando su ubicación GPS
- **Criterios de Aceptación**:
  - ✅ Admin configura coordenadas de la empresa y radio (ej: 100 metros)
  - ✅ Empleado abre app → Fichado → "Ubicación GPS"
  - ✅ App solicita permisos de ubicación si no los tiene
  - ✅ Se obtienen coordenadas actuales del dispositivo
  - ✅ Se valida distancia a las coordenadas configuradas
  - ✅ Si está dentro del radio, se permite fichar
  - ✅ Si está fuera, mensaje: "Estás demasiado lejos del lugar de trabajo"
  - ✅ Backend vuelve a validar coordenadas por seguridad

#### RF-004.4 Fichaje Manual (Solo Admin/Manager)
- **Prioridad**: MEDIA
- **Descripción**: Admin/Manager pueden registrar asistencias manualmente para casos excepcionales
- **Criterios de Aceptación**:
  - ✅ Pantalla "Registro Manual" solo visible para Admin/Manager
  - ✅ Buscar empleado por nombre o código
  - ✅ Seleccionar fecha y hora de entrada/salida
  - ✅ Agregar nota justificativa obligatoria (ej: "Llegó antes que el sistema")
  - ✅ El registro queda marcado como `manual_entry: true`
  - ✅ Se registra en auditoría quién hizo el registro manual

#### RF-004.5 Validación de Doble Fichaje
- **Prioridad**: ALTA
- **Descripción**: El sistema debe prevenir registros duplicados
- **Criterios de Aceptación**:
  - ✅ No se puede fichar entrada si ya hay entrada sin salida del mismo día
  - ✅ No se puede fichar salida si no hay entrada previa
  - ✅ Si se intenta fichar antes de 1 minuto del último registro, se rechaza
  - ✅ Mensaje claro: "Ya registraste tu entrada a las 08:02 AM"

#### RF-004.6 Historial de Asistencias
- **Prioridad**: ALTA
- **Descripción**: Usuarios pueden ver su historial de fichajes
- **Criterios de Aceptación**:
  - ✅ Pantalla "Mis Asistencias" muestra últimos 30 días
  - ✅ Cada día muestra: entrada, salida, horas trabajadas, estado (puntual/tarde/falta)
  - ✅ Filtro por rango de fechas
  - ✅ Indicadores visuales: verde (puntual), amarillo (tarde), rojo (falta)
  - ✅ Admin/Manager pueden ver asistencias de todos los empleados
  - ✅ Exportar a Excel/PDF

---

### RF-005: Constructor de Formularios Dinámicos

#### RF-005.1 Crear Formulario desde App
- **Prioridad**: CRÍTICA
- **Descripción**: Admin puede crear formularios personalizados sin necesidad de código
- **Criterios de Aceptación**:
  - ✅ Pantalla "Crear Formulario" accesible desde menú principal
  - ✅ Solicita: nombre, descripción, categoría (selector), icono, color
  - ✅ Categorías predefinidas: Control de Calidad, Inspección, Incidente, Mantenimiento, Auditoría, Otro
  - ✅ Botón "Agregar Campo" abre modal con tipos de campo disponibles
  - ✅ Campos se pueden reordenar arrastrando (drag & drop)
  - ✅ Vista previa del formulario en tiempo real
  - ✅ Botones "Guardar Borrador" y "Publicar"
  - ✅ Formulario en borrador no aparece a los empleados

#### RF-005.2 Tipos de Campos Disponibles
- **Prioridad**: CRÍTICA
- **Descripción**: El constructor debe ofrecer variedad de tipos de campos
- **Criterios de Aceptación**:
  - ✅ **Texto corto**: una línea, validación de longitud
  - ✅ **Texto largo**: múltiples líneas (área de texto)
  - ✅ **Número**: validación de rango (min, max), decimales, unidad (°C, kg, etc)
  - ✅ **Fecha**: selector de calendario
  - ✅ **Hora**: selector de hora
  - ✅ **Fecha y Hora**: combinado
  - ✅ **Checkbox**: sí/no
  - ✅ **Selector (dropdown)**: lista de opciones predefinidas
  - ✅ **Multi-selector**: múltiples opciones de una lista
  - ✅ **Radio buttons**: una opción de varias
  - ✅ **Foto**: captura desde cámara o galería
  - ✅ **Firma digital**: canvas para firmar
  - ✅ **Ubicación GPS**: captura automática de coordenadas
  - ✅ **Selector de usuario**: elegir empleado de la organización
  - ✅ **Calificación**: estrellas (1-5)
  - ✅ **Código de barras/QR**: escanear producto

#### RF-005.3 Configuración de Campos
- **Prioridad**: ALTA
- **Descripción**: Cada campo debe ser altamente configurable
- **Criterios de Aceptación**:
  - ✅ Etiqueta del campo (nombre visible)
  - ✅ Texto de ayuda (descripción pequeña)
  - ✅ Campo requerido (sí/no)
  - ✅ Valor predeterminado
  - ✅ Validaciones específicas según tipo:
    - Texto: regex, longitud mín/máx
    - Número: rango, decimales permitidos
    - Fecha: rango permitido
  - ✅ Visibilidad condicional (mostrar solo si otro campo tiene cierto valor)

#### RF-005.4 Lógica Condicional
- **Prioridad**: MEDIA
- **Descripción**: Campos pueden mostrarse/ocultarse según respuestas anteriores
- **Criterios de Aceptación**:
  - ✅ Configurar regla: "Mostrar campo X si campo Y = valor Z"
  - ✅ Operadores: igual a, diferente de, mayor que, menor que, contiene
  - ✅ Múltiples condiciones con AND/OR
  - ✅ Vista previa funciona con lógica condicional

#### RF-005.5 Editar Formulario
- **Prioridad**: ALTA
- **Descripción**: Admin puede modificar formularios existentes
- **Criterios de Aceptación**:
  - ✅ Solo formularios en estado "borrador" o sin submissions se pueden editar libremente
  - ✅ Formularios con submissions solo permiten: agregar campos, cambiar descripción
  - ✅ No se puede eliminar campos si ya tienen datos capturados
  - ✅ Al publicar cambios, se incrementa número de versión
  - ✅ Submissions antiguas mantienen referencia a la versión del formulario usada

#### RF-005.6 Duplicar Formulario
- **Prioridad**: BAJA
- **Descripción**: Admin puede clonar formularios existentes
- **Criterios de Aceptación**:
  - ✅ Botón "Duplicar" crea copia exacta con nombre "Copia de [nombre original]"
  - ✅ La copia se crea en estado "borrador"
  - ✅ Se pueden hacer modificaciones antes de publicar

#### RF-005.7 Eliminar Formulario
- **Prioridad**: MEDIA
- **Descripción**: Admin puede eliminar formularios
- **Criterios de Aceptación**:
  - ✅ Solo formularios sin submissions pueden eliminarse permanentemente
  - ✅ Formularios con submissions solo pueden "archivarse"
  - ✅ Formularios archivados no aparecen en listas activas pero conservan datos
  - ✅ Confirmación obligatoria antes de archivar

---

### RF-006: Llenar Formularios (Submissions)

#### RF-006.1 Lista de Formularios Disponibles
- **Prioridad**: CRÍTICA
- **Descripción**: Empleados ven lista de formularios que pueden llenar
- **Criterios de Aceptación**:
  - ✅ Pantalla "Formularios" muestra todos los formularios activos de la org
  - ✅ Cada tarjeta muestra: icono, nombre, descripción breve, cantidad de veces llenado
  - ✅ Categorías visibles con colores diferenciados
  - ✅ Filtro por categoría
  - ✅ Búsqueda por nombre
  - ✅ Indicador "Nuevo" si el formulario fue publicado en los últimos 7 días

#### RF-006.2 Llenar Formulario
- **Prioridad**: CRÍTICA
- **Descripción**: Empleados pueden completar formularios dinámicos
- **Criterios de Aceptación**:
  - ✅ Al abrir formulario, se muestra descripción y campos en orden
  - ✅ Cada campo se renderiza según su tipo (texto, número, foto, etc)
  - ✅ Validaciones en tiempo real (no permitir avanzar si hay errores)
  - ✅ Campos obligatorios marcados con asterisco rojo
  - ✅ Lógica condicional funciona: campos se muestran/ocultan según respuestas
  - ✅ Captura de ubicación GPS automática al abrir el formulario
  - ✅ Botón "Guardar Borrador" (se puede continuar después)
  - ✅ Botón "Enviar" valida todo y crea submission
  - ✅ Confirmación visual: "Formulario enviado exitosamente"

#### RF-006.3 Guardar Borradores
- **Prioridad**: MEDIA
- **Descripción**: Usuarios pueden guardar formularios incompletos y continuarlos después
- **Criterios de Aceptación**:
  - ✅ Borradores se guardan localmente en el dispositivo
  - ✅ Sección "Borradores" muestra formularios sin enviar
  - ✅ Indicador de porcentaje completado (30%, 70%)
  - ✅ Al abrir borrador, se restablecen valores guardados
  - ✅ Borradores de más de 30 días se eliminan automáticamente

#### RF-006.4 Ver Historial de Submissions
- **Prioridad**: ALTA
- **Descripción**: Usuarios pueden revisar formularios que ya enviaron
- **Criterios de Aceptación**:
  - ✅ Pantalla "Mis Envíos" lista todas las submissions del usuario
  - ✅ Filtro por formulario, fecha, estado (pendiente/aprobado/rechazado)
  - ✅ Al hacer clic, se abre vista detallada con todas las respuestas
  - ✅ Si tiene foto/firma, se visualiza correctamente
  - ✅ Muestra fecha/hora de envío, ubicación GPS (si se capturó)
  - ✅ Admin/Manager pueden ver submissions de todos

#### RF-006.5 Editar Submission (Solo Admin)
- **Prioridad**: BAJA
- **Descripción**: Admin puede corregir submissions enviadas
- **Criterios de Aceptación**:
  - ✅ Botón "Editar" solo visible para Admin
  - ✅ Se pueden cambiar valores de campos
  - ✅ Queda registro en historial de ediciones (auditoría)
  - ✅ Muestra: quién editó, cuándo, qué cambió (antes/después)

#### RF-006.6 Aprobar/Rechazar Submission
- **Prioridad**: MEDIA
- **Descripción**: Admin/Manager pueden revisar y aprobar submissions
- **Criterios de Aceptación**:
  - ✅ Botones "Aprobar" y "Rechazar" en vista de submission
  - ✅ Al rechazar, se debe agregar nota justificativa
  - ✅ Usuario recibe notificación del estado de su submission
  - ✅ Submissions rechazadas pueden reenviarse (con ediciones)

---

### RF-007: Códigos QR para Fichaje

#### RF-007.1 Generar QR de Ubicación
- **Prioridad**: ALTA
- **Descripción**: Admin puede crear códigos QR para diferentes puntos de fichaje
- **Criterios de Aceptación**:
  - ✅ Pantalla "Gestión de QR" accesible para Admin
  - ✅ Formulario solicita: nombre ubicación, coordenadas GPS, radio validación
  - ✅ Se genera QR único (imagen descargable)
  - ✅ QR contiene valor encriptado con org_id + location_id
  - ✅ Admin puede configurar fecha de expiración (opcional)
  - ✅ Imprimir QR en A4 con logo de la org

#### RF-007.2 Generar QR Personal de Empleado
- **Prioridad**: MEDIA
- **Descripción**: Cada empleado tiene un QR único para fichaje sin necesidad de app
- **Criterios de Aceptación**:
  - ✅ Admin genera QR desde perfil del empleado
  - ✅ QR contiene: org_id + user_id
  - ✅ Empleado puede imprimir su QR y llevarlo consigo
  - ✅ Al escanear QR con app (cualquier otro empleado con permisos), se registra fichaje del dueño del QR
  - ✅ Útil para empleados sin smartphone

#### RF-007.3 Lista de QR Activos
- **Prioridad**: MEDIA
- **Descripción**: Admin puede ver y gestionar todos los QR de la organización
- **Criterios de Aceptación**:
  - ✅ Lista muestra: nombre, tipo (ubicación/usuario), estado, cantidad de escaneos
  - ✅ Opciones: descargar, desactivar, eliminar
  - ✅ QR desactivados no funcionan al escanear

---

### RF-008: Reportes y Analytics

#### RF-008.1 Dashboard Principal
- **Prioridad**: CRÍTICA
- **Descripción**: Pantalla inicial con resumen de actividad
- **Criterios de Aceptación**:
  - ✅ Tarjeta de bienvenida con nombre del usuario
  - ✅ Estado de asistencia del día (si ya fichó o no)
  - ✅ Contador de empleados presentes/total
  - ✅ Formularios pendientes de llenar (contador)
  - ✅ Actividad reciente (últimos fichajes, submissions)
  - ✅ Botones de acceso rápido: Fichar, Formularios, Reportes

#### RF-008.2 Reporte de Asistencias
- **Prioridad**: ALTA
- **Descripción**: Admin/Manager pueden ver reportes detallados de asistencias
- **Criterios de Aceptación**:
  - ✅ Filtros: rango de fechas, departamento, usuario específico
  - ✅ Vista tabla con: empleado, fecha, entrada, salida, horas trabajadas, estado
  - ✅ Gráficos: asistencia por día de la semana, puntualidad promedio
  - ✅ Estadísticas: total horas, promedio por empleado, % puntualidad
  - ✅ Exportar a Excel/PDF

#### RF-008.3 Reporte de Formularios
- **Prioridad**: ALTA
- **Descripción**: Analíticas de submissions de formularios
- **Criterios de Aceptación**:
  - ✅ Seleccionar formulario específico
  - ✅ Rango de fechas
  - ✅ Vista tabla con todas las submissions
  - ✅ Gráficos según tipo de campo:
    - Campos numéricos: promedio, mín, máx, tendencia temporal
    - Selectores: distribución en gráfico de pastel
    - Checkboxes: porcentaje de sí/no
  - ✅ Exportar datos a Excel (hoja por formulario)

#### RF-008.4 Exportación de Datos
- **Prioridad**: ALTA
- **Descripción**: Usuarios pueden descargar sus datos
- **Criterios de Aceptación**:
  - ✅ Botón "Exportar" en cada pantalla de reportes
  - ✅ Formatos disponibles: Excel (.xlsx), PDF, CSV
  - ✅ Excel con formato: colores, encabezados, filtros
  - ✅ PDF con logo de la org y fecha de generación
  - ✅ Descarga directa al dispositivo

---

### RF-009: Notificaciones

#### RF-009.1 Notificaciones Push
- **Prioridad**: MEDIA
- **Descripción**: Sistema envía notificaciones importantes a los usuarios
- **Criterios de Aceptación**:
  - ✅ Recordatorio de fichaje si no ha fichado entrada a cierta hora
  - ✅ Formularios pendientes de llenar (configurados por Admin)
  - ✅ Submission aprobada/rechazada
  - ✅ Nuevo formulario publicado
  - ✅ Usuario agregado a la organización
  - ✅ Usuario puede silenciar notificaciones en configuración

#### RF-009.2 Centro de Notificaciones
- **Prioridad**: BAJA
- **Descripción**: Vista centralizada de todas las notificaciones
- **Criterios de Aceptación**:
  - ✅ Icono de campana con badge de cantidad no leídas
  - ✅ Lista de notificaciones más recientes (últimas 50)
  - ✅ Marcar como leída/no leída
  - ✅ Eliminar notificación
  - ✅ Al hacer clic, navegar a la pantalla correspondiente

---

### RF-010: Configuración y Perfil

#### RF-010.1 Perfil de Usuario
- **Prioridad**: MEDIA
- **Descripción**: Usuarios pueden ver y editar su información personal
- **Criterios de Aceptación**:
  - ✅ Ver: foto de Google, nombre, email, rol, departamento
  - ✅ Editar: teléfono, idioma preferido, notificaciones
  - ✅ Ver su código QR personal
  - ✅ Descargar QR personal

#### RF-010.2 Configuración de Biometría
- **Prioridad**: BAJA
- **Descripción**: Usuarios pueden habilitar/deshabilitar fichaje biométrico
- **Criterios de Aceptación**:
  - ✅ Toggle "Habilitar huella/Face ID para fichaje"
  - ✅ Al activar, se pide verificación biométrica para confirmar
  - ✅ Se marca flag en base de datos: `biometric_enrolled: true`

#### RF-010.3 Cambiar Organización Activa
- **Prioridad**: ALTA
- **Descripción**: Usuarios en múltiples orgs pueden cambiar de contexto
- **Criterios de Aceptación**:
  - ✅ Menú lateral tiene opción "Cambiar Organización"
  - ✅ Muestra lista de orgs del usuario
  - ✅ Al seleccionar, recarga datos con nuevo contexto
  - ✅ Navegación vuelve al Dashboard

---

## 📖 Casos de Uso Principales

### CU-001: Primer Uso de la App

**Actor**: Nuevo Usuario  
**Precondición**: Usuario descargó app de Play Store  
**Flujo Principal**:
1. Usuario abre la app
2. Se muestra pantalla de bienvenida con botón "Continuar con Google"
3. Usuario hace clic en el botón
4. Se abre selector de cuenta de Google del sistema
5. Usuario selecciona su cuenta
6. Google valida y retorna ID Token
7. Backend valida token y crea usuario en base de datos global
8. Usuario no tiene organizaciones → se muestra pantalla "Crear o Unirse"
9. Usuario selecciona "Crear Nueva Organización"
10. Completa formulario: nombre, industria, país
11. Sistema crea organización y asigna rol Admin al usuario
12. Navega al Dashboard vacío con tutorial de primeros pasos

**Flujo Alternativo 9a**: Unirse a Organización
9a.1. Usuario selecciona "Unirse con Código"
9a.2. Ingresa código de 6 dígitos proporcionado por su empresa
9a.3. Sistema valida código y agrega usuario como Employee
9a.4. Navega al Dashboard de esa organización

**Postcondición**: Usuario autenticado y dentro de una organización

---

### CU-002: Crear Formulario Personalizado

**Actor**: Admin de Organización  
**Precondición**: Usuario logueado como Admin  
**Flujo Principal**:
1. Admin navega a "Formularios" → botón "+" → "Crear Formulario"
2. Ingresa nombre: "Control de Temperatura de Alimentos"
3. Selecciona categoría: "Control de Calidad"
4. Hace clic en "Agregar Campo"
5. Selecciona tipo "Fecha y Hora"
6. Configura: etiqueta "Fecha y Hora del Control", requerido: Sí, valor predeterminado: Ahora
7. Guarda campo
8. Hace clic en "Agregar Campo"
9. Selecciona tipo "Selector de Usuario"
10. Configura: etiqueta "Responsable", requerido: Sí
11. Guarda campo
12. Hace clic en "Agregar Campo"
13. Selecciona tipo "Número"
14. Configura: etiqueta "Temperatura (°C)", rango: -20 a 100, decimales: 1, unidad: "°C"
15. Guarda campo
16. Hace clic en "Agregar Campo"
17. Selecciona tipo "Selector"
18. Configura: etiqueta "Cumple Normativa", opciones: ["Sí", "No"]
19. Guarda campo
20. Hace clic en "Agregar Campo"
21. Selecciona tipo "Área de Texto"
22. Configura: etiqueta "Observaciones", requerido: No
23. Guarda campo
24. Revisa vista previa del formulario
25. Hace clic en "Publicar"
26. Sistema valida y guarda formulario
27. Formulario aparece en lista de formularios activos para todos los empleados

**Postcondición**: Formulario creado y disponible para ser llenado

---

### CU-003: Fichar Entrada con QR

**Actor**: Empleado  
**Precondición**: Usuario logueado, hay QR generado para su ubicación  
**Flujo Principal**:
1. Empleado llega al trabajo a las 8:05 AM
2. Ve código QR impreso en la entrada
3. Abre la app
4. Hace clic en botón "Fichar" del Dashboard
5. Selecciona método "Escanear QR"
6. Se abre cámara con cuadro de escaneo
7. Apunta cámara al código QR
8. App detecta QR y lo decodifica
9. App obtiene ubicación GPS actual del empleado
10. Envía al backend: código QR, coordenadas GPS, timestamp
11. Backend valida:
    - QR existe y está activo
    - Ubicación GPS está dentro del radio configurado (100m)
    - No hay entrada previa del mismo día sin salida
12. Backend registra asistencia con método "qr_code"
13. App muestra confirmación: "✅ Entrada registrada a las 8:05 AM"
14. Navega de vuelta al Dashboard
15. Dashboard ahora muestra "Entrada: 8:05 AM" con ícono verde

**Flujo Alternativo 11a**: QR Inválido
11a.1. Backend detecta que QR está expirado
11a.2. Retorna error: "Código QR expirado"
11a.3. App muestra mensaje al usuario
11a.4. Usuario debe contactar a su Admin

**Flujo Alternativo 11b**: Fuera de Rango GPS
11b.1. Backend calcula distancia: 250 metros
11b.2. Retorna error: "Estás demasiado lejos del lugar de trabajo"
11b.3. App muestra mapa con ubicación del usuario vs ubicación esperada
11b.4. Usuario puede reportar problema a Admin

**Postcondición**: Asistencia de entrada registrada

---

### CU-004: Llenar Formulario de Control de Calidad

**Actor**: Empleado  
**Precondición**: Existe formulario "Control de Temperatura" publicado  
**Flujo Principal**:
1. Empleado abre app a las 10:00 AM
2. Navega a pantalla "Formularios"
3. Ve tarjeta "Control de Temperatura de Alimentos"
4. Hace clic en la tarjeta
5. Se abre pantalla de llenado del formulario
6. Campo 1 (Fecha/Hora) ya tiene valor predeterminado "24/11/2025 10:00"
7. Campo 2 (Responsable): hace clic y se abre selector de usuarios
8. Selecciona su propio nombre de la lista
9. Campo 3 (Temperatura): ingresa "4.5" con teclado numérico
10. Campo 4 (Cumple Normativa): selecciona "Sí" del dropdown
11. Campo 5 (Observaciones): escribe "Refrigerador funcionando correctamente"
12. Revisa todos los campos
13. Hace clic en "Enviar"
14. App valida que todos los campos requeridos estén llenos
15. App captura ubicación GPS actual
16. Envía datos al backend
17. Backend valida y crea submission en base de datos
18. App muestra: "✅ Formulario enviado exitosamente"
19. Navega de vuelta a lista de formularios

**Flujo Alternativo 14a**: Validación Falla
14a.1. Campo "Temperatura" está vacío
14a.2. App muestra error debajo del campo: "Este campo es requerido"
14a.3. Campo se resalta en rojo
14a.4. Usuario completa el campo
14a.5. Vuelve al paso 13

**Flujo Alternativo 13a**: Guardar Borrador
13a.1. Usuario hace clic en "Guardar Borrador" en lugar de "Enviar"
13a.2. App guarda datos localmente
13a.3. Muestra: "Borrador guardado. Puedes continuar después"
13a.4. Formulario aparece en sección "Borradores"

**Postcondición**: Datos capturados y almacenados en la base de datos

---

**Versión**: 1.0  
**Fecha**: 24 de noviembre de 2025  
**Autor**: Sistema de Calidad Team
