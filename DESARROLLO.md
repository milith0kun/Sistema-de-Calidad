# 🚀 Guía de Desarrollo - Sistema Wino

## 🎯 Flujo de Desarrollo Optimizado

### 📋 Problema Resuelto
- ❌ **Problema**: Falta de memoria para hacer builds locales
- ✅ **Solución**: Desarrollo remoto con sincronización automática

## 🔧 Configuración Inicial

### 1. Servidor de Desarrollo (Una sola vez)
```bash
# En el servidor EC2:
cd /home/ubuntu/SistemaWino
git pull origin main
cd WebPanel
npm install
npm run dev:remote
```

### 2. Configuración Local
```bash
# En tu PC, clona el repositorio:
git clone [tu-repo]
cd AppWino
```

## 💻 Flujo Diario de Desarrollo

### Opción A: Script Automático (Recomendado)
```bash
# 1. Edita tu código en VS Code
# 2. Ejecuta el script de sincronización:
./sync-dev.bat

# 3. Ve los cambios en:
# http://ec2-54-91-127-89.compute-1.amazonaws.com:3000
```

### Opción B: Manual
```bash
# 1. Hacer commit de cambios
git add .
git commit -m "Descripción de cambios"
git push origin main

# 2. En el servidor (SSH):
cd /home/ubuntu/SistemaWino
git pull origin main
# El servidor de desarrollo se actualiza automáticamente
```

## 🌐 URLs de Acceso

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Desarrollo** | http://ec2-54-91-127-89.compute-1.amazonaws.com:3000 | 3000 |
| **Producción** | http://ec2-54-91-127-89.compute-1.amazonaws.com | 80 |
| **Backend API** | http://ec2-54-91-127-89.compute-1.amazonaws.com/api | 80 |

## 🔄 Comandos Útiles

### En tu PC Local:
```bash
npm run sync          # Sincronizar cambios
./sync-dev.bat        # Script completo de sincronización
git status            # Ver estado de cambios
```

### En el Servidor (SSH):
```bash
npm run dev:remote    # Iniciar servidor de desarrollo
npm run build         # Build para producción
pm2 restart all       # Reiniciar servicios
tail -f dev.log       # Ver logs de desarrollo
```

## 🚨 Solución de Problemas

### Servidor de desarrollo no responde:
```bash
# SSH al servidor:
cd /home/ubuntu/SistemaWino/WebPanel
pkill -f "vite"
npm run dev:remote
```

### Cambios no se reflejan:
```bash
# Verificar que git pull funcionó:
git log -1
# Reiniciar servidor de desarrollo si es necesario
```

### Puerto 3000 ocupado:
```bash
# Matar procesos en puerto 3000:
sudo lsof -ti:3000 | xargs kill -9
npm run dev:remote
```

## ⚡ Ventajas de este Flujo

- ✅ **Sin problemas de memoria** - El build se hace en el servidor
- ✅ **Sincronización rápida** - Solo subes código fuente
- ✅ **Hot reload** - Cambios se ven en 2-3 segundos
- ✅ **Mismo entorno** - Desarrollo y producción idénticos
- ✅ **Colaboración fácil** - Todo el equipo ve los mismos cambios

## 🎯 Cuándo usar cada método

### Desarrollo Remoto (Recomendado):
- ✅ Cambios frecuentes en frontend
- ✅ Problemas de memoria local
- ✅ Trabajo en equipo
- ✅ Testing en entorno real

### Build Local:
- ✅ Deploy final a producción
- ✅ Optimización de rendimiento
- ✅ Testing de build específico