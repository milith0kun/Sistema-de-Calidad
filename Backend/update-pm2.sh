#!/bin/bash

# Script para actualizar y configurar PM2 en el servidor
# Uso: ./update-pm2.sh

echo "🔧 Configurando PM2 para el backend..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error_msg() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
    success_msg "PM2 instalado"
else
    success_msg "PM2 ya está instalado"
fi

# Crear directorio de logs si no existe
mkdir -p logs

# Detener procesos existentes
echo "🛑 Deteniendo procesos existentes..."
pm2 stop all 2>/dev/null || warning_msg "No hay procesos PM2 ejecutándose"
pm2 delete all 2>/dev/null || warning_msg "No hay procesos PM2 para eliminar"

# Iniciar la aplicación con el archivo de configuración
echo "🚀 Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js --env production

# Guardar configuración de PM2
echo "💾 Guardando configuración de PM2..."
pm2 save

# Configurar PM2 para iniciar automáticamente
echo "⚙️  Configurando inicio automático..."
pm2 startup

# Mostrar estado
echo "📊 Estado actual de PM2:"
pm2 status

success_msg "Configuración de PM2 completada"
echo "📝 Para ver los logs: pm2 logs"
echo "📊 Para ver el estado: pm2 status"
echo "🔄 Para reiniciar: pm2 restart all"