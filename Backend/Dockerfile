# Backend - Node.js API
# Optimizado para Dokploy
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de Docker)
COPY package*.json ./

# Instalar dependencias (usando --omit=dev en lugar de --only=production)
RUN npm ci --omit=dev

# Copiar código fuente
COPY . .

# Crear directorio para la base de datos SQLite
RUN mkdir -p /app/database

# Puerto de la aplicación
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
