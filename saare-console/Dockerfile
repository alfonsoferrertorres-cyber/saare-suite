# --- ETAPA 1: Compilación ---
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalación limpia de dependencias
RUN npm ci

# Copiar el resto del código y compilar para producción
COPY . .
RUN npm run build

# --- ETAPA 2: Servidor de producción ---
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Eliminar los archivos por defecto de NGINX
RUN rm -rf ./*

# Copiar el bundle estático desde la etapa de compilación
COPY --from=builder /app/dist .

# Configurar NGINX para fallback SPA (React Router / redirecciones)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]