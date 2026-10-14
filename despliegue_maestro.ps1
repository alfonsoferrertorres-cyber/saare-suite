# ==============================================================================
# SCRIPT MAESTRO DE PRODUCCIÓN S.A.A.R.E. Enterprise (v8.4 - Multi-Frontend)
# ==============================================================================
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

# 1. Limpieza e instalación de dependencias
Write-Host "==> [1/7] Limpiando cache e instalando dependencias..." -ForegroundColor Yellow
try {
    pnpm run clean
} catch {
    Write-Host "[Aviso] Limpieza automática omitida o no crítica. Continuando..." -ForegroundColor DarkYellow
}
pnpm install --no-frozen-lockfile

# 2. Empaquetado del Sensor L7 (Extension Base) para Console y Suite (Landing)
Write-Host "==> [2/7] Empaquetando Sensor L7..." -ForegroundColor Cyan
if (Test-Path "extension-base") {
    $publicTargets = @(
        "saare-console\public",
        "saare-suite\public",
        "apps\saare-console\public",
        "apps\saare-suite\public"
    )

    $zipPath = "extension-base.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path "extension-base\*" -DestinationPath $zipPath -Force

    foreach ($target in $publicTargets) {
        $parentDir = Split-Path -Path $target -Parent
        if (Test-Path $parentDir) {
            if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }
            Copy-Item $zipPath -Destination "$target\extension-base.zip" -Force
        }
    }
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
}

# 3. Validación de la Puerta de Resiliencia (8/8 Invariantes)
Write-Host "==> [3/7] Ejecutando Puerta de Resiliencia..." -ForegroundColor Cyan
if (Test-Path "resilienceGate_2.js") { 
    node resilienceGate_2.js 
} elseif (Test-Path "control-plane\resilienceGate_2.js") {
    node control-plane\resilienceGate_2.js
} else {
    Throw "Error: No se encontró resilienceGate_2.js"
}

# 4. Compilación en paralelo con Turborepo (Compila saare-console y saare-suite)
Write-Host "==> [4/7] Compilando aplicaciones con Turborepo..." -ForegroundColor Cyan
pnpm run build

# Copia de respaldo del ZIP a los directorios dist de compilación
$distTargets = @(
    "saare-console\dist",
    "saare-suite\dist",
    "apps\saare-console\dist",
    "apps\saare-suite\dist"
)
foreach ($dist in $distTargets) {
    if (Test-Path $dist) {
        $sourceZip = if (Test-Path "saare-console\public\extension-base.zip") { 
            "saare-console\public\extension-base.zip" 
        } elseif (Test-Path "apps\saare-console\public\extension-base.zip") { 
            "apps\saare-console\public\extension-base.zip" 
        } else { 
            $null 
        }
        
        if ($sourceZip -and (Test-Path $sourceZip)) {
            Copy-Item $sourceZip -Destination "$dist\extension-base.zip" -Force
        }
    }
}

# 5. Despliegue de Frontends a Cloudflare Pages (Console + Suite Landing)
Write-Host "==> [5/7] Desplegando Frontends (saare-console y saare-suite) a Cloudflare Pages..." -ForegroundColor Cyan

# Despliegue saare-console (Consola GRC)
$consoleDist = if (Test-Path "saare-console\dist") { "saare-console/dist" } else { "apps/saare-console/dist" }
if (Test-Path $consoleDist) {
    Write-Host " -> Desplegando Consola GRC ($consoleDist)..." -ForegroundColor Gray
    npx wrangler pages deploy $consoleDist --project-name=saare-console --branch=main --commit-dirty=true
}

# Despliegue saare-suite (Landing Comercial)
$suiteDist = if (Test-Path "saare-suite\dist") { "saare-suite/dist" } else { "apps/saare-suite/dist" }
if (Test-Path $suiteDist) {
    Write-Host " -> Desplegando Landing Comercial ($suiteDist)..." -ForegroundColor Gray
    npx wrangler pages deploy $suiteDist --project-name=saare-suite --branch=main --commit-dirty=true
}

# 6. Despliegue del Worker de Producción (Control Plane & Governance Engine)
Write-Host "==> [6/7] Desplegando Control Plane Worker a Producción..." -ForegroundColor Cyan
$controlPlanePath = if (Test-Path "control-plane") { "control-plane" } else { "apps/control-plane" }
if (Test-Path $controlPlanePath) {
    Push-Location $controlPlanePath
    try {
        npx wrangler deploy
    } finally {
        Pop-Location
    }
}

# 7. Sincronización con el repositorio de GitHub
Write-Host "==> [7/7] Sincronizando repositorio con GitHub..." -ForegroundColor Cyan
git add .
$gitStatus = git status --porcelain
if ($gitStatus) {
    $currentBranch = (git branch --show-current).Trim()
    if (-not $currentBranch) { $currentBranch = "main" }
    
    git commit -m "chore(release): despliegue maestro verificado de produccion v8.4 (console + suite landing + governance templates)"
    git push origin HEAD
    Write-Host "Cambios subidos correctamente a GitHub (Rama: $currentBranch)." -ForegroundColor Green
} else {
    Write-Host "No hay cambios pendientes en Git." -ForegroundColor Yellow
}

Write-Host "`n==> DESPLIEGUE COMPLETO FINALIZADO SIN ERRORES" -ForegroundColor Green
Write-Host "  - Landing Comercial (Embudo): https://saare.es (saare-suite)" -ForegroundColor Green
Write-Host "  - Consola GRC (Auditoría):    https://console.saare.es (saare-console)" -ForegroundColor Green
Write-Host "  - Control Plane API:          https://api.saare.es (control-plane)" -ForegroundColor Green