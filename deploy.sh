#!/bin/bash

# Script de deploy automático para Sistema Wino
# Uso: ./deploy.sh

echo "🚀 Iniciando deploy del Sistema Wino..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar errores
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Función para mostrar éxito
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar advertencias
warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar que estamos en la rama correcta
echo "📋 Verificando rama actual..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    warning_msg "No estás en la rama main. Rama actual: $CURRENT_BRANCH"
    read -p "¿Continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 2. Verificar que no hay cambios sin commitear
if ! git diff-index --quiet HEAD --; then
    error_exit "Hay cambios sin commitear. Haz commit primero."
fi

# 3. Push al repositorio
echo "📤 Subiendo cambios a GitHub..."
git push origin $CURRENT_BRANCH || error_exit "Error al hacer push"
success_msg "Cambios subidos a GitHub"

# 4. Deploy en el servidor (requiere configuración SSH)
echo "🌐 Desplegando en el servidor..."

# Configurar estas variables según tu servidor
SERVER_USER="ubuntu"
SERVER_HOST="18.118.212.247"
SERVER_PATH="/home/ubuntu/SistemaWino"
SSH_KEY="./wino.pem"

# Comandos a ejecutar en el servidor
ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST << EOF
    cd $SERVER_PATH
    echo "📥 Actualizando código desde GitHub..."
    git pull origin main
    
    echo "🔧 Instalando dependencias del backend..."
    cd Backend
    npm install --production
    
    echo "🎨 Construyendo frontend..."
    cd ../WebPanel
    npm install
    npm run build
    
    echo "🔄 Reiniciando servicios..."
    pm2 restart all || echo "⚠️  PM2 no configurado, reinicia manualmente"
    
    echo "✅ Deploy completado"
EOF

if [ $? -eq 0 ]; then
    success_msg "Deploy completado exitosamente"
    echo "🌍 Tu aplicación está disponible en: http://$SERVER_HOST"
else
    error_exit "Error durante el deploy"
fi