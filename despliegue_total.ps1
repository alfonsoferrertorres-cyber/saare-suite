# ==============================================================================
# SCRIPT DE DESPLIEGUE COMPLETO DE PRODUCCIÓN - S.A.A.R.E. SGP 1.0 (v8.1)
# ==============================================================================

# 1. Definir la ruta raíz del monorepo S.A.A.R.E.
cd C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO

# Limpieza preventiva de lockfile redundante de npm y cachés conflictivas
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo, .wrangler -ErrorAction SilentlyContinue

Write-Host "🧹 Entorno limpiado y preparado." -ForegroundColor Yellow

# 2. Instalar dependencias globales y actualizar el workspace
pnpm add -Dw rimraf turbo prettier
pnpm install --no-frozen-lockfile

# 3. Limpieza de compilaciones anteriores y compilación total del monorepo
pnpm run clean
pnpm run build:all

# 4. Desplegar el Worker Orquestador (Control Plane Remoto & Bóveda KV/D1)
Write-Host "🚀 Desplegando Control Plane a Cloudflare Workers..." -ForegroundColor Cyan
Set-Location control-plane
npx wrangler deploy
Set-Location ..

# 5. Asegurar directorio de destino y empaquetar el Sensor L7 Sovereign Tokenizado
Write-Host "🧩 Empaquetando Sensor L7 Sovereign Tokenizado..." -ForegroundColor Cyan
if (-not (Test-Path "saare-console\public")) { 
    New-Item -ItemType Directory -Path "saare-console\public" -Force 
}
Compress-Archive -Path "extension-base\*" -DestinationPath "saare-console\public\extension-base.zip" -Force

# 6. Compilar y Desplegar la Consola GRC en Cloudflare Pages
Write-Host "🌐 Desplegando saare-console a Cloudflare Pages..." -ForegroundColor Cyan
pnpm --filter saare-console run build
npx wrangler pages deploy saare-console/dist --project-name=saare-console --commit-dirty=true

# 7. Compilar y Desplegar la Landing Page (saare-suite) a Cloudflare Pages
Write-Host "🌐 Desplegando saare-suite a Cloudflare Pages..." -ForegroundColor Cyan
pnpm --filter saare-suite run build
npx wrangler pages deploy saare-suite/dist --project-name=saare-suite --commit-dirty=true

# 8. Control de versiones, release y sincronización con GitHub
Write-Host "📦 Subiendo todo el monorepo a Git..." -ForegroundColor Cyan
git add .
git commit -m "chore(release): despliegue completo de producción v8.1 (control-plane, saare-console y saare-suite)"
git push origin main

Write-Host "✅ ¡Toda la infraestructura S.A.A.R.E. ha sido compilada, desplegada y sincronizada con éxito!" -ForegroundColor Green