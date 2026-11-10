# --- ETAPA 1: Compilación en Monorepo PNPM ---
FROM node:20-alpine AS builder

# Habilitar pnpm vía corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. Copiar manifiestos de raíz y workspaces
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/saare-console ./apps/saare-console

# 2. Instalación de dependencias del workspace sin congelar lockfile estricto
RUN pnpm install --frozen-lockfile

# 3. Compilación de paquetes internos y de la consola GRC
RUN pnpm --filter saare-console run build

# --- ETAPA 2: Servidor de producción NGINX ---
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Eliminar archivos estáticos por defecto
RUN rm -rf ./*

# Copiar los artefactos generados por Vite en apps/saare-console/dist
COPY --from=builder /app/apps/saare-console/dist .

# Configuración NGINX con fallback para SPA (React Router)
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