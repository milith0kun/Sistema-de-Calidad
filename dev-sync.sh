#!/bin/bash

# Script de sincronización para desarrollo remoto
# Uso: ./dev-sync.sh

echo "🔄 Sincronizando cambios con el servidor de desarrollo..."

# Configuración del servidor
SERVER_USER="ubuntu"
SERVER_HOST="ec2-18-188-209-94.us-east-2.compute.amazonaws.com"
SERVER_PATH="/home/ubuntu/SistemaWino"
SSH_KEY="~/edmil-key.pem"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para mostrar mensajes
info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar cambios locales
if ! git diff-index --quiet HEAD --; then
    warning_msg "Hay cambios sin commitear. Haciendo commit automático..."
    git add .
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 2. Push a GitHub
info_msg "Subiendo cambios a GitHub..."
git push origin main

# 3. Sincronizar en el servidor y reiniciar desarrollo
info_msg "Sincronizando en el servidor..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST << 'EOF'
    cd /home/ubuntu/SistemaWino
    
    echo "📥 Actualizando código..."
    git pull origin main
    
    echo "🔄 Reiniciando servidor de desarrollo..."
    # Matar procesos anteriores de desarrollo
    pkill -f "vite.*--host"
    pkill -f "npm.*dev"
    
    # Instalar dependencias si es necesario
    cd WebPanel
    if [ package.json -nt node_modules ]; then
        echo "📦 Instalando dependencias..."
        npm install
    fi
    
    # Iniciar servidor de desarrollo en background
    echo "🚀 Iniciando servidor de desarrollo..."
    nohup npm run dev -- --host 0.0.0.0 --port 3000 > dev.log 2>&1 &
    
    echo "✅ Servidor de desarrollo iniciado en puerto 3000"
    echo "🌐 Accesible en: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
EOF

success_msg "Sincronización completada"
echo "🌍 Tu aplicación está disponible en: http://$SERVER_HOST:3000"