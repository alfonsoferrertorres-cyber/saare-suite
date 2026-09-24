# ==============================================================================
# SCRIPT DE DESPLIEGUE COMPLETO DE PRODUCCIÓN - S.A.A.R.E. SGP 1.0 (v8.1)
# ==============================================================================
$ErrorActionPreference = "Stop"

# 1. Ruta raíz del monorepo
Set-Location "C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO"

Write-Host "🧹 Limpiando cachés y artefactos previos..." -ForegroundColor Yellow
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo, .wrangler -ErrorAction SilentlyContinue

# 2. Gestión de dependencias del workspace
Write-Host "📦 Actualizando dependencias..." -ForegroundColor Cyan
pnpm add -Dw rimraf turbo prettier
pnpm install --no-frozen-lockfile

# 3. Compilación limpia del monorepo
Write-Host "🏗️ Compilando paquetes y aplicaciones..." -ForegroundColor Cyan
pnpm run clean
pnpm run build:all

# 4. Desplegar Worker Orquestador (Control Plane & Bóveda KV/D1)
Write-Host "🚀 Desplegando Control Plane a Cloudflare Workers..." -ForegroundColor Cyan
Set-Location control-plane
npx wrangler deploy
Set-Location ..

# 5. Empaquetar Sensor L7 Sovereign Tokenizado
Write-Host "🧩 Empaquetando Sensor L7 Sovereign..." -ForegroundColor Cyan
$publicDir = "saare-console\public"
$zipPath = "$publicDir\extension-base.zip"

if (-not (Test-Path $publicDir)) { 
    New-Item -ItemType Directory -Path $publicDir -Force 
}
if (Test-Path $zipPath) { 
    Remove-Item -Force $zipPath 
}
Compress-Archive -Path "extension-base\*" -DestinationPath $zipPath -Force

# 6. Desplegar Consola GRC en Cloudflare Pages
Write-Host "🌐 Desplegando saare-console a Cloudflare Pages..." -ForegroundColor Cyan
pnpm --filter saare-console run build
npx wrangler pages deploy saare-console/dist --project-name=saare-console --commit-dirty=true

# 7. Desplegar Landing Page (saare-suite) a Cloudflare Pages
Write-Host "🌐 Desplegando saare-suite a Cloudflare Pages..." -ForegroundColor Cyan
pnpm --filter saare-suite run build
npx wrangler pages deploy saare-suite/dist --project-name=saare-suite --commit-dirty=true

# 8. Sincronización y Release en GitHub (Protegido contra commits vacíos)
Write-Host "📦 Sincronizando repositorio con GitHub..." -ForegroundColor Cyan
git add .
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "chore(release): despliegue completo de producción v8.1 (control-plane, saare-console y saare-suite)"
    git push origin main
    Write-Host "🐙 Cambios subidos a GitHub correctamente." -ForegroundColor Green
} else {
    Write-Host "ℹ️ No se detectaron cambios pendientes para commit en Git." -ForegroundColor Yellow
}

Write-Host "`n✅ ¡Toda la infraestructura S.A.A.R.E. ha sido compilada, desplegada y sincronizada con éxito!" -ForegroundColor Green