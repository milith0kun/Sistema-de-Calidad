# Guía Sencilla del Sistema HACCP (App, Web y Backend)

Este documento explica, en lenguaje simple y sin código, cómo funciona el sistema completo: la App Android, el Panel Web y el Backend. También describe los formularios HACCP, la asistencia (fichado) y cómo está desplegado en un servidor AWS EC2.

## Visión General
- El sistema ayuda a controlar calidad e inocuidad alimentaria (HACCP) y la asistencia del personal.
- Consta de tres partes que trabajan juntas: App Android (uso operativo), Panel Web (administración y análisis) y Backend (API y base de datos).
- Todo se comunica a través de internet con autenticación por token (seguro).

## Componentes del Sistema
- App Android: permite fichar entrada/salida con validación de GPS y completar formularios HACCP desde el móvil.
- Panel Web (navegador): gestiona usuarios, visualiza datos, genera reportes y exporta información.
- Backend (servidor): recibe las solicitudes de App y Web, valida, guarda en la base de datos y responde.

## Flujo de Información
- Usuarios se autentican (inician sesión) y reciben un token temporal para enviar datos.
- App y Panel Web envían/reciben información al Backend mediante la API.
- El Backend almacena datos en una base de datos central y aplica reglas de negocio.

## App Android (uso en campo)
- Inicio de sesión: el usuario ingresa credenciales y obtiene acceso por un período limitado (token expira en 24 horas).
- Fichado: registra entrada y salida del personal con ubicación GPS. El sistema verifica que la posición esté dentro del área permitida.
- Formularios HACCP: captura controles diarios (cocción, lavado de manos, lavado de frutas, recepción de mercadería, temperaturas de cámaras, etc.).
- Mapas: utiliza Google Maps si hay clave disponible, y OpenStreetMap (OSMDroid) como alternativa. La ubicación se usa para validar asistencia y, cuando corresponde, para georreferenciar registros.
- Notificaciones: recuerda tareas HACCP según configuración (por ejemplo, controles periódicos).

## Panel Web (gestión y análisis)
- Administración: alta/baja/modificación de usuarios y permisos.
- Asistencias: visualiza y gestiona fichados, verifica ubicaciones y horarios.
- HACCP: consulta y filtra formularios, visualiza estadísticas y tendencias.
- Reportes y exportaciones: genera informes y exporta a Excel.
- Seguridad: maneja sesiones con token y controla accesos.

## Backend (API y base de datos)
- API REST: expone endpoints para autenticación, asistencia y formularios HACCP.
- Reglas de negocio: valida datos (por ejemplo, ubicación y horarios), calcula métricas y asegura consistencia.
- Base de datos: guarda todos los registros (usuarios, asistencias y formularios) en un único lugar.
- Seguridad: usa tokens (JWT) con vencimiento de 24 horas y controles CORS según ambiente.
- Zona horaria: registra fechas y horas en la zona "America/Lima" para consistencia local.

## Formularios HACCP (qué se registra)
- Recepción de mercadería (frutas/verduras y abarrotes): estado de productos, temperatura, fechas y condiciones de recepción.
- Control de cocción: temperaturas internas, tiempos y conformidad del proceso de cocción.
- Lavado de manos: cumplimiento de protocolo (frecuencia, pasos) por parte del personal.
- Lavado de frutas: procedimiento y sanitización de vegetales.
- Temperatura de cámaras frigoríficas: lecturas periódicas por cámara con rangos aceptables.
- Observaciones: cada formulario permite agregar notas y responsables.

## Asistencia y Fichado (con GPS)
- Fichado de entrada: al iniciar turno, el sistema registra fecha, hora y ubicación.
- Fichado de salida: al terminar turno, registra fecha, hora y ubicación.
- Validación GPS: se compara la posición del teléfono con el área autorizada (radio configurable por local o punto de control). Si está fuera del rango, se rechaza o se marca para revisión.
- Auditoría: se conserva quién, cuándo y dónde se realizó cada fichado.

## Mapas y Ubicación
- Google Maps requiere una clave válida; si no está disponible, se usa OpenStreetMap.
- La ubicación se obtiene del dispositivo y se valida en el Backend.
- Se recomienda activar GPS y otorgar permisos de ubicación en la App.

## Seguridad y Cumplimiento
- Autenticación: cada usuario obtiene un token (JWT) que vence en 24 horas.
- Autorización: acceso a funciones según rol (ej. supervisor vs. colaborador).
- Validación de entradas: el Backend verifica datos y rechaza inconsistencias.
- Registros y logs: se guardan eventos críticos para auditoría (ayuda a diagnosticar problemas).
- Credenciales: nunca se almacenan en texto plano; el sistema usa métodos seguros.

## Despliegue en AWS EC2 (producción)
- El servidor de producción está alojado en una instancia EC2 con IP pública.
- Backend: corre como proceso administrado (por ejemplo, con un gestor de procesos) para que se reinicie automáticamente y soporte actualizaciones.
- Panel Web: se sirve detrás de un servidor web (por ejemplo, Nginx) que entrega la versión compilada y actúa como proxy hacia el Backend.
- Accesos: la App y el Panel Web utilizan la URL pública del servidor para conectarse.

## Operación Diaria y Soporte
- Monitoreo: revisar que el servidor esté operativo y que los procesos estén corriendo.
- Respuesta a incidencias: ante errores de autenticación o ubicación, verificar credenciales, permisos de GPS y la configuración del radio autorizado.
- Backups: programar respaldos periódicos de la base de datos.
- Actualizaciones: planificar cambios de manera incremental para no interrumpir el servicio.

## Habilidades Recomendadas (por rol)
- Operaciones (usuarios finales): manejo básico de smartphone, comprensión de procedimientos HACCP, cuidado al ingresar datos.
- Supervisión/Calidad: interpretación de formularios HACCP, criterio para validar y corregir registros, uso del Panel Web para análisis y reportes.
- Soporte técnico (básico): nociones de redes, verificación de permisos de GPS, reinicio de servicios y monitoreo del servidor.
- Desarrollo/IT (cuando se requiera cambio o mantenimiento):
  - Backend: experiencia con APIs REST, seguridad por tokens y bases de datos.
  - Web: uso de paneles en React y manejo de estados; consultas a API.
  - Android: formularios en móvil, manejo de ubicación y comunicación con API.
  - DevOps: despliegue en AWS EC2, configuración de servidor web y procesos.

## Escalado y Mantenimiento
- Modularidad: cada componente (App, Web, Backend) tiene responsabilidades claras; se pueden evolucionar por separado.
- Compatibilidad: los cambios se introducen de forma incremental, manteniendo compatibilidad con versiones anteriores.
- Pruebas: realizar pruebas unitarias en componentes críticos y validar la reproducibilidad de escenarios.
- Rendimiento: revisar periódicamente si hay puntos lentos (consultas o formularios con mucho volumen) y optimizar.
- Registro y trazabilidad: mantener logs y auditorías para comprender el historial de operaciones.

## Términos Clave
- HACCP: sistema de análisis de peligros y puntos críticos de control para asegurar inocuidad alimentaria.
- Fichado: registro de asistencia (entrada/salida) vinculado a ubicación.
- Token (JWT): credencial temporal que autoriza acciones en la API.
- API REST: forma de comunicación entre App/Panel y el Backend mediante solicitudes HTTP.
- EC2: servidor virtual en la nube de AWS donde se hospeda el sistema.

---

Esta guía busca que cualquier persona (técnica o no técnica) comprenda el funcionamiento general del sistema sin entrar en detalles de implementación. Para ampliar o cambiar procesos, se recomienda coordinar con el equipo de calidad y el soporte técnico.