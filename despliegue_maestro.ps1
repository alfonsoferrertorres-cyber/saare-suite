# ==============================================================================
# SCRIPT MAESTRO DE PRODUCCIÓN INTEGRAL S.A.A.R.E. Enterprise (v8.8 - Production Ready)
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
# FASE 1: DEPENDENCIAS, EMPAQUETADO DE EXTENSIÓN + SIDECAR PYTHON Y LIMPIEZA
# ------------------------------------------------------------------------------
Write-Host "`n==> [1/6] Resolviendo dependencias, empaquetando artefactos L7 y limpiando builds..." -ForegroundColor Yellow
pnpm install --no-frozen-lockfile

# Limpieza de dist/ antiguos
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "saare-console/dist", "saare-suite/dist", "apps/saare-console/dist", "apps/saare-suite/dist", "control-plane/dist"

$consolePublicDeploy = if (Test-Path "apps/saare-console") { "apps/saare-console/public/deploy" } elseif (Test-Path "saare-console") { "saare-console/public/deploy" } else { $null }

if ($consolePublicDeploy) {
    New-Item -ItemType Directory -Force -Path $consolePublicDeploy | Out-Null
}

# 1.1 Generación del paquete ZIP dinámico de la extensión L7 para descarga pública
$extSrc = if (Test-Path "apps/l7-proxy-extension") { "apps/l7-proxy-extension" } elseif (Test-Path "l7-proxy-extension") { "l7-proxy-extension" } else { $null }

if ($extSrc -and $consolePublicDeploy) {
    Write-Host " -> Empaquetando Extensión Proxy L7 en $consolePublicDeploy/saare_l7_proxy_extension.zip..." -ForegroundColor Gray
    Compress-Archive -Path "$extSrc/*" -DestinationPath "$consolePublicDeploy/saare_l7_proxy_extension.zip" -Force
} else {
    Write-Host "[ADVERTENCIA] No se encontró el origen de la extensión proxy. Se omitirá el empaquetado del ZIP." -ForegroundColor DarkYellow
}

# 1.2 Generación del paquete ZIP del Agente Nativo Python (Sidecar L7 RAM)
$sidecarSrc = if (Test-Path "packages/saare-edge-agent") { "packages/saare-edge-agent" } elseif (Test-Path "saare-edge-agent") { "saare-edge-agent" } else { $null }

if ($sidecarSrc -and $consolePublicDeploy) {
    Write-Host " -> Empaquetando Agente Nativo Python L7 en $consolePublicDeploy/saare_native_sidecar.zip..." -ForegroundColor Gray
    $sidecarFiles = Get-ChildItem -Path $sidecarSrc -File | Where-Object { $_.Extension -in @(".py", ".toml", ".md") }
    if ($sidecarFiles.Count -gt 0) {
        Compress-Archive -Path $sidecarFiles.FullName -DestinationPath "$consolePublicDeploy/saare_native_sidecar.zip" -Force
        Write-Host " -> [OK] Sidecar Python empaquetado ($($sidecarFiles.Count) archivos limpios)." -ForegroundColor Green
    } else {
        Write-Host "[ADVERTENCIA] La carpeta $sidecarSrc no contiene archivos .py/.toml/.md." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[ADVERTENCIA] No se encontró packages/saare-edge-agent. Se omitirá el empaquetado del Sidecar." -ForegroundColor DarkYellow
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

    git commit -m "chore(release): despliegue maestro verificado con sidecar L7 y schema.sql D1 v8.8"
    git push origin HEAD
    Write-Host "Cambios subidos correctamente a GitHub (Rama: $currentBranch)." -ForegroundColor Green
} else {
    Write-Host "No hay cambios pendientes en Git." -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# FASE 6: PRUEBA DE SALUD Y VERIFICACIÓN HTTP INTEGRAL
# ------------------------------------------------------------------------------
Write-Host "`n==> [6/6] Verificando salud del entorno de Producción (Workers, Frontends y Artefactos)..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# 1. Verificación del Control Plane Worker (API)
$apiEndpoints = @(
    "https://api.saare.es/health",
    "https://api.saare.es/api/v1/health"
)

$apiOnline = $false
foreach ($url in $apiEndpoints) {
    try {
        $health = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5
        Write-Host " -> [OK] Estado API ($url):" -ForegroundColor Green
        Write-Host "    Estado: $($health.status) | Servicio: $($health.service) | TrustAnchor: $($health.trustAnchor)" -ForegroundColor Gray
        $apiOnline = $true
        break
    } catch {
        # Intenta con el siguiente endpoint alternativo
    }
}

if (-not $apiOnline) {
    Write-Host "[ADVERTENCIA] El Control Plane (api.saare.es) no respondió al chequeo de salud." -ForegroundColor DarkYellow
}

# 2. Verificación de Frontends (Cloudflare Pages / Dominios asociados)
$frontendsToTest = @(
    @{ Name = "Consola GRC (saare-console)"; Url = "https://console.saare.es" },
    @{ Name = "Landing Comercial (saare-suite)"; Url = "https://saare.es" }
)

foreach ($fe in $frontendsToTest) {
    try {
        $response = Invoke-WebRequest -Uri $fe.Url -Method Get -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host " -> [OK] Frontend operativo: $($fe.Name) ($($fe.Url))" -ForegroundColor Green
        } else {
            Write-Host " -> [ADVERTENCIA] $($fe.Name) respondió con código HTTP: $($response.StatusCode)" -ForegroundColor DarkYellow
        }
    } catch {
        Write-Host " -> [ADVERTENCIA] No se pudo conectar con $($fe.Name) en $($fe.Url)" -ForegroundColor DarkYellow
    }
}

# 3. Verificación de disponibilidad de artefactos descargables L7
$artifactsToTest = @(
    @{ Name = "Extensión L7 (.ZIP)"; Url = "https://console.saare.es/deploy/saare_l7_proxy_extension.zip" },
    @{ Name = "Agente Nativo Python Sidecar (.ZIP)"; Url = "https://console.saare.es/deploy/saare_native_sidecar.zip" }
)

foreach ($art in $artifactsToTest) {
    try {
        $headResp = Invoke-WebRequest -Uri $art.Url -Method Head -UseBasicParsing -TimeoutSec 5
        if ($headResp.StatusCode -eq 200) {
            Write-Host " -> [OK] Artefacto publicado: $($art.Name) ($($art.Url))" -ForegroundColor Green
        }
    } catch {
        Write-Host " -> [ADVERTENCIA] Artefacto no accesible aún en CDN: $($art.Name) ($($art.Url))" -ForegroundColor DarkYellow
    }
}

Write-Host "`n==> DESPLIEGUE COMPLETO INTEGRAL FINALIZADO CON ÉXITO 🚀" -ForegroundColor Green