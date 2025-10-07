# 📚 Documentación de Despliegue y Conexión a Instancias Remotas

## 🔐 Métodos de Conexión SSH

### 1. Conexión usando archivo de llave privada (.pem)

#### Conectar a la instancia:
```bash
# Sintaxis básica
ssh -i /ruta/a/tu/llave.pem usuario@ip-publica

# Ejemplo práctico
ssh -i ~/.ssh/mi-servidor.pem ubuntu@54.123.45.67
ssh -i C:\Users\Usuario\.ssh\servidor.pem ec2-user@18.234.56.78

# Para Windows con PowerShell
ssh -i "C:\Users\Usuario\.ssh\servidor.pem" ubuntu@54.123.45.67
```

#### Permisos correctos para la llave (Linux/Mac):
```bash
chmod 400 ~/.ssh/mi-servidor.pem
```

#### Permisos correctos para la llave (Windows):
```powershell
# Quitar herencia y dar permisos solo al usuario actual
icacls "C:\Users\Usuario\.ssh\servidor.pem" /inheritance:r
icacls "C:\Users\Usuario\.ssh\servidor.pem" /grant:r "%USERNAME%:R"
```

### 2. Conexión usando llave SSH directa (sin archivo)

#### Generar par de llaves SSH:
```bash
# Generar nueva llave SSH
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"

# Generar con nombre específico
ssh-keygen -t rsa -b 4096 -f ~/.ssh/mi-servidor -C "servidor-produccion"
```

#### Copiar llave pública al servidor:
```bash
# Método 1: ssh-copy-id (Linux/Mac)
ssh-copy-id -i ~/.ssh/mi-servidor.pub usuario@ip-servidor

# Método 2: Manual
cat ~/.ssh/mi-servidor.pub | ssh usuario@ip-servidor "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Método 3: Copiar contenido manualmente
cat ~/.ssh/mi-servidor.pub
# Luego pegar en el servidor en ~/.ssh/authorized_keys
```

#### Conectar usando llave específica:
```bash
ssh -i ~/.ssh/mi-servidor usuario@ip-servidor
```

## 📁 Transferencia de Archivos

### 1. Usando SCP (Secure Copy)

#### Subir archivo individual:
```bash
# Con archivo de llave
scp -i ~/.ssh/servidor.pem archivo.txt ubuntu@54.123.45.67:/home/ubuntu/

# Con llave SSH configurada
scp archivo.txt usuario@servidor:/ruta/destino/
```

#### Subir directorio completo:
```bash
# Subir directorio recursivamente
scp -r -i ~/.ssh/servidor.pem ./mi-proyecto/ ubuntu@54.123.45.67:/home/ubuntu/

# Excluir archivos específicos
scp -r -i ~/.ssh/servidor.pem --exclude='node_modules' ./proyecto/ ubuntu@servidor:/home/ubuntu/
```

#### Descargar archivos:
```bash
# Descargar archivo
scp -i ~/.ssh/servidor.pem ubuntu@54.123.45.67:/home/ubuntu/archivo.txt ./

# Descargar directorio
scp -r -i ~/.ssh/servidor.pem ubuntu@54.123.45.67:/home/ubuntu/proyecto/ ./
```

### 2. Usando RSYNC (Recomendado para proyectos)

#### Sincronizar proyecto completo:
```bash
# Sincronización básica
rsync -avz -e "ssh -i ~/.ssh/servidor.pem" ./proyecto/ ubuntu@54.123.45.67:/home/ubuntu/proyecto/

# Con exclusiones (recomendado)
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='*.log' \
  -e "ssh -i ~/.ssh/servidor.pem" \
  ./proyecto/ ubuntu@54.123.45.67:/home/ubuntu/proyecto/
```

#### Opciones útiles de RSYNC:
```bash
# -a: modo archivo (preserva permisos, timestamps, etc.)
# -v: verbose (muestra progreso)
# -z: compresión
# --delete: elimina archivos en destino que no existen en origen
# --dry-run: simula la operación sin ejecutarla

# Ejemplo completo con todas las opciones
rsync -avz --delete --exclude='node_modules' --exclude='.env' \
  --exclude='*.log' --exclude='.git' \
  -e "ssh -i ~/.ssh/servidor.pem" \
  ./ ubuntu@54.123.45.67:/home/ubuntu/mi-app/
```

## 🚀 Scripts de Despliegue Automatizado

### 1. Script básico de despliegue (deploy.sh)

```bash
#!/bin/bash

# Configuración
SERVER_USER="ubuntu"
SERVER_IP="54.123.45.67"
SSH_KEY="~/.ssh/servidor.pem"
REMOTE_PATH="/home/ubuntu/mi-app"
LOCAL_PATH="./"

echo "🚀 Iniciando despliegue..."

# 1. Sincronizar archivos
echo "📁 Sincronizando archivos..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env.local' \
  -e "ssh -i $SSH_KEY" \
  $LOCAL_PATH $SERVER_USER@$SERVER_IP:$REMOTE_PATH

# 2. Ejecutar comandos en el servidor
echo "⚙️ Ejecutando comandos en el servidor..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'EOF'
  cd /home/ubuntu/mi-app
  
  # Instalar dependencias
  npm install --production
  
  # Construir proyecto si es necesario
  npm run build
  
  # Reiniciar servicios
  sudo systemctl restart mi-app
  sudo systemctl restart nginx
  
  echo "✅ Despliegue completado en el servidor"
EOF

echo "🎉 Despliegue finalizado exitosamente!"
```

### 2. Script avanzado con validaciones

```bash
#!/bin/bash

# Configuración desde variables de entorno o valores por defecto
SERVER_USER=${DEPLOY_USER:-"ubuntu"}
SERVER_IP=${DEPLOY_IP:-"54.123.45.67"}
SSH_KEY=${DEPLOY_KEY:-"~/.ssh/servidor.pem"}
REMOTE_PATH=${DEPLOY_PATH:-"/home/ubuntu/mi-app"}
APP_NAME=${APP_NAME:-"mi-app"}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Validaciones previas
log "🔍 Validando configuración..."

# Verificar que existe la llave SSH
if [ ! -f "$SSH_KEY" ]; then
    error "No se encontró la llave SSH: $SSH_KEY"
fi

# Verificar conectividad
log "🔗 Verificando conectividad con el servidor..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "echo 'Conexión exitosa'" > /dev/null 2>&1; then
    error "No se pudo conectar al servidor $SERVER_IP"
fi

# Crear backup en el servidor
log "💾 Creando backup..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << EOF
    if [ -d "$REMOTE_PATH" ]; then
        sudo cp -r $REMOTE_PATH ${REMOTE_PATH}_backup_\$(date +%Y%m%d_%H%M%S)
        echo "Backup creado exitosamente"
    fi
EOF

# Sincronizar archivos
log "📁 Sincronizando archivos..."
rsync -avz --delete --progress \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env.local' \
  --exclude='coverage' \
  --exclude='dist' \
  -e "ssh -i $SSH_KEY" \
  ./ "$SERVER_USER@$SERVER_IP:$REMOTE_PATH" || error "Error en la sincronización"

# Ejecutar comandos de despliegue en el servidor
log "⚙️ Ejecutando comandos de despliegue..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << EOF
    set -e  # Salir si algún comando falla
    
    cd $REMOTE_PATH
    
    # Instalar dependencias
    echo "📦 Instalando dependencias..."
    npm ci --production
    
    # Ejecutar migraciones si existen
    if [ -f "package.json" ] && npm run | grep -q "migrate"; then
        echo "🗄️ Ejecutando migraciones..."
        npm run migrate
    fi
    
    # Construir proyecto
    if [ -f "package.json" ] && npm run | grep -q "build"; then
        echo "🔨 Construyendo proyecto..."
        npm run build
    fi
    
    # Reiniciar servicios
    echo "🔄 Reiniciando servicios..."
    if sudo systemctl is-active --quiet $APP_NAME; then
        sudo systemctl restart $APP_NAME
    else
        echo "Servicio $APP_NAME no está activo, iniciándolo..."
        sudo systemctl start $APP_NAME
    fi
    
    # Verificar que el servicio esté corriendo
    sleep 5
    if sudo systemctl is-active --quiet $APP_NAME; then
        echo "✅ Servicio $APP_NAME está corriendo correctamente"
    else
        echo "❌ Error: El servicio $APP_NAME no se pudo iniciar"
        exit 1
    fi
    
    echo "🎉 Despliegue completado exitosamente en el servidor"
EOF

if [ $? -eq 0 ]; then
    log "🎉 Despliegue finalizado exitosamente!"
else
    error "❌ El despliegue falló"
fi
```

## 🔧 Configuración de SSH Config

### Archivo ~/.ssh/config para simplificar conexiones:

```bash
# Servidor de producción
Host prod-server
    HostName 54.123.45.67
    User ubuntu
    IdentityFile ~/.ssh/servidor-prod.pem
    Port 22
    ServerAliveInterval 60

# Servidor de desarrollo
Host dev-server
    HostName 18.234.56.78
    User ec2-user
    IdentityFile ~/.ssh/servidor-dev.pem
    Port 22

# Servidor con túnel
Host tunnel-server
    HostName 192.168.1.100
    User admin
    IdentityFile ~/.ssh/servidor.pem
    ProxyJump bastion-server

# Servidor bastión
Host bastion-server
    HostName 54.123.45.67
    User ubuntu
    IdentityFile ~/.ssh/bastion.pem
```

### Uso después de configurar SSH config:
```bash
# Conectar simplemente con el alias
ssh prod-server

# Transferir archivos
scp archivo.txt prod-server:/home/ubuntu/
rsync -avz ./ prod-server:/home/ubuntu/mi-app/
```

## 🐳 Despliegue con Docker

### 1. Dockerfile para el proyecto:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
```

### 2. Script de despliegue con Docker:
```bash
#!/bin/bash

SERVER_USER="ubuntu"
SERVER_IP="54.123.45.67"
SSH_KEY="~/.ssh/servidor.pem"
IMAGE_NAME="mi-app"
CONTAINER_NAME="mi-app-container"

log "🐳 Construyendo imagen Docker..."
docker build -t $IMAGE_NAME .

log "💾 Guardando imagen..."
docker save $IMAGE_NAME | gzip > ${IMAGE_NAME}.tar.gz

log "📤 Subiendo imagen al servidor..."
scp -i $SSH_KEY ${IMAGE_NAME}.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

log "🚀 Desplegando en el servidor..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << EOF
    # Cargar imagen
    docker load < /tmp/${IMAGE_NAME}.tar.gz
    
    # Detener contenedor anterior
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    # Ejecutar nuevo contenedor
    docker run -d --name $CONTAINER_NAME -p 80:3000 $IMAGE_NAME
    
    # Limpiar
    rm /tmp/${IMAGE_NAME}.tar.gz
    
    echo "✅ Contenedor desplegado exitosamente"
EOF

# Limpiar archivo local
rm ${IMAGE_NAME}.tar.gz

log "🎉 Despliegue Docker completado!"
```

## 📋 Comandos Útiles de Administración

### Monitoreo del servidor:
```bash
# Ver logs del servicio
ssh -i ~/.ssh/servidor.pem ubuntu@servidor "sudo journalctl -u mi-app -f"

# Ver procesos
ssh -i ~/.ssh/servidor.pem ubuntu@servidor "ps aux | grep node"

# Ver uso de recursos
ssh -i ~/.ssh/servidor.pem ubuntu@servidor "htop"

# Ver espacio en disco
ssh -i ~/.ssh/servidor.pem ubuntu@servidor "df -h"
```

### Comandos de mantenimiento:
```bash
# Limpiar logs antiguos
ssh -i ~/.ssh/servidor.pem ubuntu@servidor "sudo journalctl --vacuum-time=7d"

# Actualizar sistema
ssh -i ~/.ssh/servidor.pem ubuntu@servidor "sudo apt update && sudo apt upgrade -y"

# Reiniciar servidor
ssh -i ~/.ssh/servidor.pem ubuntu@servidor "sudo reboot"
```

## 🔒 Mejores Prácticas de Seguridad

1. **Usar llaves SSH en lugar de contraseñas**
2. **Cambiar puerto SSH por defecto**
3. **Configurar firewall (ufw)**
4. **Usar fail2ban para proteger contra ataques de fuerza bruta**
5. **Mantener el sistema actualizado**
6. **Usar usuarios no-root para aplicaciones**
7. **Configurar certificados SSL/TLS**

### Configuración básica de seguridad:
```bash
# Cambiar puerto SSH (editar /etc/ssh/sshd_config)
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Deshabilitar login root
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Configurar firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp  # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Instalar fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📞 Ejemplos de Uso Rápido

### Conexión rápida:
```bash
ssh -i ~/.ssh/servidor.pem ubuntu@54.123.45.67
```

### Subir proyecto completo:
```bash
rsync -avz --exclude='node_modules' -e "ssh -i ~/.ssh/servidor.pem" ./ ubuntu@54.123.45.67:/home/ubuntu/mi-app/
```

### Ejecutar comando remoto:
```bash
ssh -i ~/.ssh/servidor.pem ubuntu@54.123.45.67 "cd /home/ubuntu/mi-app && npm install && pm2 restart all"
```

### Hacer túnel SSH:
```bash
ssh -i ~/.ssh/servidor.pem -L 8080:localhost:3000 ubuntu@54.123.45.67
```