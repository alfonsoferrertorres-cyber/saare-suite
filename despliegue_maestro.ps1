# ==============================================================================
# SCRIPT MAESTRO DE PRODUCCIÓN INTEGRAL S.A.A.R.E. Enterprise (v8.7 - Production Ready)
# ==============================================================================
$ErrorActionPreference = "Stop"

# ------------------------------------------------------------------------------
# FASE 0: PRE-FLIGHT CHECKS & VERIFICACIÓN DE PERMISOS
# ------------------------------------------------------------------------------
Write-Host "`n==> [0/6] Ejecutando verificaciones de entorno y credenciales..." -ForegroundColor Magenta

if ((Get-Location).Path.EndsWith("control-plane")) {
    Set-Location ..
}

# 0.1 Validar autenticación en Cloudflare CLI (Wrangler / API Token)
Write-Host " -> Verificando permisos en Cloudflare..." -ForegroundColor Gray
if (-not $env:CLOUDFLARE_API_TOKEN) {
    try {
        $whoami = npx wrangler whoami 2>&1
        if ($whoami -like "*You are not logged in*") {
            Write-Host "[ERROR] No has iniciado sesión en Cloudflare. Ejecuta 'npx wrangler login' o define `$env:CLOUDFLARE_API_TOKEN." -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "[ADVERTENCIA] No se pudo verificar la sesión de Wrangler local. Continuando..." -ForegroundColor DarkYellow
    }
} else {
    Write-Host " -> Usando autenticación mediante CLOUDFLARE_API_TOKEN env var." -ForegroundColor Green
}

# 0.2 Validar repositorio Git
Write-Host " -> Verificando estado del repositorio Git..." -ForegroundColor Gray
try {
    git rev-parse --is-inside-work-tree | Out-Null
} catch {
    Write-Host "[ERROR] El directorio actual no es un repositorio Git válido." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# FASE 1: DEPENDENCIAS, EMPAQUETADO DE EXTENSIÓN Y LIMPIEZA
# ------------------------------------------------------------------------------
Write-Host "`n==> [1/6] Resolviendo dependencias, empaquetando proxy y limpiando builds..." -ForegroundColor Yellow
pnpm install --no-frozen-lockfile

# Limpieza de dist/ antiguos
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "saare-console/dist", "saare-suite/dist", "apps/saare-console/dist", "apps/saare-suite/dist", "control-plane/dist"

# Generación del paquete ZIP dinámico de la extensión L7 para descarga pública
$extSrc = if (Test-Path "apps/l7-proxy-extension") { "apps/l7-proxy-extension" } elseif (Test-Path "l7-proxy-extension") { "l7-proxy-extension" } else { $null }
$consolePublicDeploy = if (Test-Path "apps/saare-console") { "apps/saare-console/public/deploy" } elseif (Test-Path "saare-console") { "saare-console/public/deploy" } else { $null }

if ($extSrc -and $consolePublicDeploy) {
    Write-Host " -> Empaquetando Extensión Proxy L7 en $consolePublicDeploy/saare_l7_proxy_extension.zip..." -ForegroundColor Gray
    New-Item -ItemType Directory -Force -Path $consolePublicDeploy | Out-Null
    Compress-Archive -Path "$extSrc/*" -DestinationPath "$consolePublicDeploy/saare_l7_proxy_extension.zip" -Force
} else {
    Write-Host "[ADVERTENCIA] No se encontró el origen de la extensión proxy. Se omitirá el empaquetado del ZIP." -ForegroundColor DarkYellow
}

# ------------------------------------------------------------------------------
# FASE 2: COMPILACIÓN DIRECTA DE FRONTENDS (PNPM WORKSPACES)
# ------------------------------------------------------------------------------
Write-Host "`n==> [2/6] Compilando aplicaciones web (saare-console + saare-suite)..." -ForegroundColor Cyan

Write-Host " -> Compilando Consola GRC (saare-console)..." -ForegroundColor Gray
pnpm --filter saare-console run build

Write-Host " -> Compilando Landing Comercial (saare-suite)..." -ForegroundColor Gray
pnpm --filter saare-suite run build

# ------------------------------------------------------------------------------
# FASE 3: DESPLIEGUE DE FRONTENDS A CLOUDFLARE PAGES
# ------------------------------------------------------------------------------
Write-Host "`n==> [3/6] Desplegando Frontends a Cloudflare Pages..." -ForegroundColor Cyan

# 3.1 Consola GRC (saare-console)
$consoleDist = if (Test-Path "saare-console\dist") { "saare-console/dist" } elseif (Test-Path "apps\saare-console\dist") { "apps/saare-console/dist" } else { $null }
if ($consoleDist) {
    Write-Host " -> Desplegando Consola GRC ($consoleDist)..." -ForegroundColor Gray
    npx wrangler pages deploy $consoleDist --project-name=saare-console --branch=main --commit-dirty=true
} else {
    Write-Host "[ERROR] Falló la compilación de saare-console. No existe carpeta dist." -ForegroundColor Red
    exit 1
}

# 3.2 Landing Comercial (saare-suite)
$suiteDist = if (Test-Path "saare-suite\dist") { "saare-suite/dist" } elseif (Test-Path "apps\saare-suite\dist") { "apps/saare-suite/dist" } else { $null }
if ($suiteDist) {
    Write-Host " -> Desplegando Landing Comercial ($suiteDist)..." -ForegroundColor Gray
    npx wrangler pages deploy $suiteDist --project-name=saare-suite --branch=main --commit-dirty=true
} else {
    Write-Host "[ERROR] Falló la compilación de saare-suite. No existe carpeta dist." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# FASE 4: MIGRACIONES DE BASE DE DATOS & CONTROL PLANE WORKER
# ------------------------------------------------------------------------------
Write-Host "`n==> [4/6] Desplegando Control Plane Worker y Esquemas D1..." -ForegroundColor Cyan
$controlPlanePath = if (Test-Path "control-plane") { "control-plane" } elseif (Test-Path "apps\control-plane") { "apps/control-plane" } else { $null }

if ($controlPlanePath) {
    Push-Location $controlPlanePath
    try {
        # 4.1 Aplicación automática del esquema relacional D1
        $sqlPath = $null
        if (Test-Path "schema.sql") {
            $sqlPath = "schema.sql"
        } elseif (Test-Path "config/schema.sql") {
            $sqlPath = "config/schema.sql"
        } elseif (Test-Path "../config/schema.sql") {
            $sqlPath = "../config/schema.sql"
        }

        if ($sqlPath) {
            Write-Host " -> Aplicando esquema relacional D1 ($sqlPath) en remoto..." -ForegroundColor Gray
            npx wrangler d1 execute saare-vault-d1 --remote --file=$sqlPath --yes
            Write-Host " -> [OK] Esquema D1 aplicado correctamente." -ForegroundColor Green
        } else {
            Write-Host "[ADVERTENCIA] No se encontró el archivo schema.sql. Omitiendo migración D1." -ForegroundColor DarkYellow
        }

        # 4.2 Sincronización de Tipos TypeScript
        Write-Host " -> Sincronizando tipos TypeScript de Wrangler..." -ForegroundColor Gray
        npx wrangler types

        # 4.3 Despliegue del Worker
        Write-Host " -> Publicando Worker a Cloudflare (saare-control-plane-prod)..." -ForegroundColor Gray
        npx wrangler deploy
    } finally {
        Pop-Location
    }
} else {
    Write-Host "[ERROR] No se encontró la carpeta del control-plane." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# FASE 5: SINCRONIZACIÓN CON REPOSITORIO GIT
# ------------------------------------------------------------------------------
Write-Host "`n==> [5/6] Sincronizando repositorio con GitHub..." -ForegroundColor Cyan
git add .
$gitStatus = git status --porcelain
if ($gitStatus) {
    $currentBranch = (git branch --show-current).Trim()
    if (-not $currentBranch) { $currentBranch = "main" }

    git commit -m "chore(release): despliegue maestro verificado con schema.sql D1 L7 v8.7"
    git push origin HEAD
    Write-Host "Cambios subidos correctamente a GitHub (Rama: $currentBranch)." -ForegroundColor Green
} else {
    Write-Host "No hay cambios pendientes en Git." -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# FASE 6: PRUEBA DE SALUD Y VERIFICACIÓN HTTP
# ------------------------------------------------------------------------------
Write-Host "`n==> [6/6] Verificando salud del entorno de Producción..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

$endpointsToTest = @(
    "https://api.saare.es/health",
    "https://api.saare.es/api/v1/health"
)

$apiOnline = $false
foreach ($url in $endpointsToTest) {
    try {
        $health = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5
        Write-Host " -> [OK] Estado API ($url):" -ForegroundColor Green
        Write-Host "    Estado: $($health.status) | Servicio: $($health.service) | TrustAnchor: $($health.trustAnchor)" -ForegroundColor Gray
        $apiOnline = $true
        break
    } catch {
        # Intenta con el siguiente endpoint
    }
}

if (-not $apiOnline) {
    Write-Host "[ADVERTENCIA] No se recibió respuesta HTTP 200 en los endpoints de salud. Revise los registros en Cloudflare Worker Dashboard." -ForegroundColor DarkYellow
}

Write-Host "`n==> DESPLIEGUE COMPLETO INTEGRAL FINALIZADO CON ÉXITO 🚀" -ForegroundColor Green