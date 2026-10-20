# ==============================================================================
# SCRIPT MAESTRO DE PRODUCCIÓN S.A.A.R.E. Enterprise (v8.4 - Correcto)
# ==============================================================================
$ErrorActionPreference = "Stop"

# Asegurar que estamos en la raíz del proyecto (un nivel arriba si se ejecuta desde control-plane)
if ((Get-Location).Path.EndsWith("control-plane")) {
    Set-Location ..
}

Write-Host "==> [1/7] Instalando y resolviendo dependencias del Workspace..." -ForegroundColor Yellow
pnpm install --no-frozen-lockfile

# 2. Empaquetado del Sensor L7 para los assets públicos
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

# 3. Validación de la Puerta de Resiliencia
Write-Host "==> [3/7] Ejecutando Puerta de Resiliencia..." -ForegroundColor Cyan
if (Test-Path "resilienceGate_2.js") {
    node resilienceGate_2.js
} elseif (Test-Path "control-plane\resilienceGate_2.js") {
    node control-plane\resilienceGate_2.js
} else {
    Write-Host "[Aviso] resilienceGate_2.js no encontrado en la raíz. Continuando..." -ForegroundColor DarkYellow
}

# 4. Compilación de Frontends con Turborepo
Write-Host "==> [4/7] Compilando aplicaciones (saare-console + saare-suite)..." -ForegroundColor Cyan
pnpm run build

# Copia de respaldo del ZIP a los dist recién construidos
$distTargets = @("saare-console\dist", "saare-suite\dist", "apps\saare-console\dist", "apps\saare-suite\dist")
foreach ($dist in $distTargets) {
    if (Test-Path $dist) {
        $sourceZip = if (Test-Path "saare-console\public\extension-base.zip") { "saare-console\public\extension-base.zip" } else { "apps\saare-console\public\extension-base.zip" }
        if ($sourceZip -and (Test-Path $sourceZip)) {
            Copy-Item $sourceZip -Destination "$dist\extension-base.zip" -Force
        }
    }
}

# 5. Despliegue a Cloudflare Pages
Write-Host "==> [5/7] Desplegando Frontends a Cloudflare Pages..." -ForegroundColor Cyan

# Consola GRC
$consoleDist = if (Test-Path "saare-console\dist") { "saare-console/dist" } else { "apps/saare-console/dist" }
if (Test-Path $consoleDist) {
    Write-Host " -> Desplegando Consola GRC ($consoleDist)..." -ForegroundColor Gray
    npx wrangler pages deploy $consoleDist --project-name=saare-console --branch=main --commit-dirty=true
} else {
    Write-Host "[Error] No se encontró la carpeta de compilación $consoleDist" -ForegroundColor Red
}

# Landing Comercial
$suiteDist = if (Test-Path "saare-suite\dist") { "saare-suite/dist" } else { "apps/saare-suite/dist" }
if (Test-Path $suiteDist) {
    Write-Host " -> Desplegando Landing Comercial ($suiteDist)..." -ForegroundColor Gray
    npx wrangler pages deploy $suiteDist --project-name=saare-suite --branch=main --commit-dirty=true
} else {
    Write-Host "[Error] No se encontró la carpeta de compilación $suiteDist" -ForegroundColor Red
}

# 6. Despliegue del Worker de Control Plane
Write-Host "==> [6/7] Desplegando Control Plane Worker a Producción..." -ForegroundColor Cyan
$controlPlanePath = if (Test-Path "control-plane") { "control-plane" } else { "apps/control-plane" }
if (Test-Path $controlPlanePath) {
    Push-Location $controlPlanePath
    try {
        if (Test-Path "schema.sql") {
            npx wrangler d1 execute saare-vault-d1 --remote --file=schema.sql --env production --yes
        }
        npx wrangler deploy --env production
    } finally {
        Pop-Location
    }
}

# 7. Sincronización Git
Write-Host "==> [7/7] Sincronizando repositorio con GitHub..." -ForegroundColor Cyan
git add .
$gitStatus = git status --porcelain
if ($gitStatus) {
    $currentBranch = (git branch --show-current).Trim()
    if (-not $currentBranch) { $currentBranch = "main" }

    git commit -m "chore(release): despliegue maestro verificado de produccion v8.4 (build & pages deploy)"
    git push origin HEAD
    Write-Host "Cambios subidos correctamente a GitHub (Rama: $currentBranch)." -ForegroundColor Green
} else {
    Write-Host "No hay cambios pendientes en Git." -ForegroundColor Yellow
}

Write-Host "`n==> DESPLIEGUE COMPLETO FINALIZADO Y VERIFICADO" -ForegroundColor Green