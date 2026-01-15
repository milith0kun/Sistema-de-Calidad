# WebPanel - Vite React App
# Optimizado para Dokploy

# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Argumentos de build para variables de entorno de Vite
ARG VITE_API_URL
ARG VITE_BACKEND_URL

# Convertir ARGs a ENV para el build de Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copiar archivos de dependencias primero
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar la configuración de nginx para Docker
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Puerto de la aplicación
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
