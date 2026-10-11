# ==============================================================================
# SCRIPT MAESTRO DE PRODUCCIÓN S.A.A.R.E. Enterprise (v8.4)
# ==============================================================================
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

# 1. Limpieza e instalación de dependencias
Write-Host "==> [1/7] Limpiando cache e instalando dependencias..." -ForegroundColor Yellow
if (Get-Command rimraf -ErrorAction SilentlyContinue) {
    pnpm run clean
} else {
    pnpm install -w rimraf
    pnpm run clean
}
pnpm install --no-frozen-lockfile

# 2. Empaquetado del Sensor L7 (Extension Base)
Write-Host "==> [2/7] Empaquetando Sensor L7..." -ForegroundColor Cyan
if (Test-Path "extension-base") {
    if (-not (Test-Path "saare-console\public")) { 
        New-Item -ItemType Directory -Path "saare-console\public" -Force 
    }
    Compress-Archive -Path "extension-base\*" -DestinationPath "saare-console\public\extension-base.zip" -Force
}

# 3. Validación de la Puerta de Resiliencia (8/8 Invariantes)
Write-Host "==> [3/7] Ejecutando Puerta de Resiliencia..." -ForegroundColor Cyan
if (Test-Path "resilienceGate_2.js") { 
    node resilienceGate_2.js 
} else {
    Throw "Error: No se encontro resilienceGate_2.js"
}

# 4. Compilación en paralelo con Turborepo
Write-Host "==> [4/7] Compilando aplicaciones con Turborepo..." -ForegroundColor Cyan
pnpm run build

# Copia de respaldo del paquete Zip a la carpeta dist
if (Test-Path "saare-console\public\extension-base.zip") {
    Copy-Item "saare-console\public\extension-base.zip" -Destination "saare-console\dist\extension-base.zip" -Force
}

# 5. Despliegue de Frontends en Cloudflare Pages
Write-Host "==> [5/7] Desplegando Frontends a Cloudflare Pages..." -ForegroundColor Cyan
npx wrangler pages deploy saare-console/dist --project-name=saare-console --branch=main --commit-dirty=true
npx wrangler pages deploy saare-suite/dist --project-name=saare-suite --branch=main --commit-dirty=true

# 6. Despliegue del Worker de Producción (Control Plane)
Write-Host "==> [6/7] Desplegando Control Plane Worker a Produccion..." -ForegroundColor Cyan
if (Test-Path "control-plane") {
    Set-Location control-plane
    npx wrangler deploy
    Set-Location ..
}

# 7. Sincronización con el repositorio de GitHub
Write-Host "==> [7/7] Sincronizando repositorio con GitHub..." -ForegroundColor Cyan
git add .
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "chore(release): despliegue maestro verificado de produccion v8.4"
    git push origin main
    Write-Host "Cambios subidos correctamente a GitHub." -ForegroundColor Green
} else {
    Write-Host "No hay cambios pendientes en Git." -ForegroundColor Yellow
}

Write-Host "`n==> DESPLIEGUE COMPLETO FINALIZADO SIN ERRORES" -ForegroundColor Green
Write-Host "  - Landing Comercial: https://saare.es" -ForegroundColor Green
Write-Host "  - Consola GRC:       https://console.saare.es" -ForegroundColor Green
Write-Host "  - Control Plane API: https://api.saare.es" -ForegroundColor Green