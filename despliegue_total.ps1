# ==============================================================================
# SCRIPT DE DESPLIEGUE COMPLETO DE PRODUCCIÓN - S.A.A.R.E. SGP 1.0 (v8.1)
# ==============================================================================
$ErrorActionPreference = "Stop"

Set-Location "C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO"

Write-Host "🧹 Limpiando cachés y artefactos previos..." -ForegroundColor Yellow
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo, .wrangler -ErrorAction SilentlyContinue

Write-Host "📦 Actualizando dependencias..." -ForegroundColor Cyan
pnpm install --no-frozen-lockfile

Write-Host "🏗️ Compilando paquetes y aplicaciones..." -ForegroundColor Cyan
pnpm run clean
pnpm run build:all

Write-Host "🚀 Desplegando Control Plane a Cloudflare Workers..." -ForegroundColor Cyan
Set-Location control-plane
npx wrangler deploy
Set-Location ..

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

Write-Host "🌐 Desplegando saare-console a Cloudflare Pages..." -ForegroundColor Cyan
if (Test-Path "saare-console\dist\index.html") {
    npx wrangler pages deploy saare-console/dist --project-name=saare-console --commit-dirty=true
} else {
    Write-Host "❌ Error: saare-console/dist/index.html no existe." -ForegroundColor Red
    exit 1
}

Write-Host "🌐 Desplegando saare-suite a Cloudflare Pages..." -ForegroundColor Cyan
if (Test-Path "saare-suite\dist\index.html") {
    npx wrangler pages deploy saare-suite/dist --project-name=saare-suite --commit-dirty=true
} else {
    Write-Host "❌ Error: saare-suite/dist/index.html no existe." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Sincronizando repositorio con GitHub..." -ForegroundColor Cyan
git add .
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "chore(release): despliegue completo v8.1"
    git push origin main
    Write-Host "🐙 Cambios subidos a GitHub correctamente." -ForegroundColor Green
} else {
    Write-Host "ℹ️ No se detectaron cambios pendientes para commit en Git." -ForegroundColor Yellow
}

Write-Host "`n✅ ¡Despliegue completado con éxito!" -ForegroundColor Green
Write-Host "  - Landing Comercial: https://saare-suite.pages.dev" -ForegroundColor Green
Write-Host "  - Consola GRC:       https://saare-console.pages.dev" -ForegroundColor Green
Write-Host "  - Control Plane API: https://control-plane.alfonsoferrertorres.workers.dev" -ForegroundColor Green
