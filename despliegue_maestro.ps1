# ==============================================================================
# SCRIPT MAESTRO DE PRODUCCION INTEGRAL S.A.A.R.E. Enterprise (v8.9 - Clean)
# ==============================================================================
param(
    [string]$SmokeTenant = "",
    [string]$SmokeToken = "",
    [string]$MasterTestPassword = "",
    [switch]$RemoveMasterTestPassword,
    [switch]$SkipSmokeTests
)

$ErrorActionPreference = "Stop"

function Assert-LastExitCode {
    param(
        [string]$FailureMessage = "El comando fallo."
    )
    if ($LASTEXITCODE -ne 0) {
        throw "$FailureMessage (ExitCode=$LASTEXITCODE)"
    }
}

# ------------------------------------------------------------------------------
# FASE 0: PRE-FLIGHT CHECKS & VERIFICACION DE PERMISOS
# ------------------------------------------------------------------------------
Write-Host "`n==> [0/7] Ejecutando verificaciones de entorno y credenciales..." -ForegroundColor Magenta

if ((Get-Location).Path.EndsWith("control-plane")) {
    Set-Location ..
}

# 0.1 Validar autenticacion en Cloudflare CLI (Wrangler / API Token)
Write-Host " -> Verificando permisos en Cloudflare..." -ForegroundColor Gray
if (-not $env:CLOUDFLARE_API_TOKEN) {
    try {
        $whoami = npx wrangler whoami 2>&1
        if ($LASTEXITCODE -ne 0 -or ($whoami -like "*You are not logged in*")) {
            Write-Host "[ERROR] No has iniciado sesion en Cloudflare. Ejecuta 'npx wrangler login' o define `$env:CLOUDFLARE_API_TOKEN." -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "[ADVERTENCIA] No se pudo verificar la sesion de Wrangler local. Continuando..." -ForegroundColor DarkYellow
    }
} else {
    Write-Host " -> Usando autenticacion mediante CLOUDFLARE_API_TOKEN env var." -ForegroundColor Green
}

# 0.2 Validar repositorio Git
Write-Host " -> Verificando estado del repositorio Git..." -ForegroundColor Gray
try {
    git rev-parse --is-inside-work-tree | Out-Null
    Assert-LastExitCode -FailureMessage "No es un repositorio Git."
} catch {
    Write-Host "[ERROR] El directorio actual no es un repositorio Git valido." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# FASE 1: DEPENDENCIAS, EMPAQUETADO DE EXTENSION + SIDECAR PYTHON Y LIMPIEZA
# ------------------------------------------------------------------------------
Write-Host "`n==> [1/7] Resolviendo dependencias, empaquetando artefactos L7 y limpiando builds..." -ForegroundColor Yellow
pnpm install --no-frozen-lockfile
Assert-LastExitCode -FailureMessage "Fallo al instalar dependencias con pnpm"

# Limpieza de dist/ antiguos y temporales de Vite
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "saare-console/dist", "saare-suite/dist", "apps/saare-console/dist", "apps/saare-suite/dist", "control-plane/dist", "apps/control-plane/dist"
Get-ChildItem -Recurse -Filter "vite.config.js.timestamp-*.mjs" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

$consolePublicDeploy = if (Test-Path "apps/saare-console") {
    "apps/saare-console/public/deploy"
} elseif (Test-Path "saare-console") {
    "saare-console/public/deploy"
} else {
    $null
}

if ($consolePublicDeploy) {
    New-Item -ItemType Directory -Force -Path $consolePublicDeploy | Out-Null
}

# 1.1 Generacion del paquete ZIP limpio de la extension L7 para descarga publica
$extSrc = if (Test-Path "apps/l7-proxy-extension") {
    "apps/l7-proxy-extension"
} elseif (Test-Path "l7-proxy-extension") {
    "l7-proxy-extension"
} else {
    $null
}

if ($extSrc -and $consolePublicDeploy) {
    Write-Host " -> Empaquetando Extension Proxy L7 en $consolePublicDeploy/saare_l7_proxy_extension.zip..." -ForegroundColor Gray
    $extStageDir = Join-Path $env:TEMP "saare_l7_ext_stage"
    if (Test-Path $extStageDir) {
        Remove-Item $extStageDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $extStageDir | Out-Null

    $requiredExtFiles = @(
        "manifest.json",
        "contentScript.js",
        "schema.json",
        "src/background/background.js",
        "src/popup/popup.html",
        "src/popup/popup.js",
        "assets/icon.png"
    )

    $missingExtFiles = @()
    foreach ($rel in $requiredExtFiles) {
        $srcFile = Join-Path $extSrc $rel
        if (-not (Test-Path $srcFile)) {
            $missingExtFiles += $rel
        }
    }

    if ($missingExtFiles.Count -gt 0) {
        Write-Host "[ERROR] Faltan archivos requeridos en $extSrc : $($missingExtFiles -join ', ')" -ForegroundColor Red
        exit 1
    }

    foreach ($rel in $requiredExtFiles) {
        $srcFile = Join-Path $extSrc $rel
        $dstFile = Join-Path $extStageDir $rel
        $dstParent = Split-Path $dstFile -Parent
        if (-not (Test-Path $dstParent)) {
            New-Item -ItemType Directory -Path $dstParent -Force | Out-Null
        }
        Copy-Item -Path $srcFile -Destination $dstFile -Force
    }

    $extZipOut = "$consolePublicDeploy/saare_l7_proxy_extension.zip"
    if (Test-Path $extZipOut) {
        Remove-Item $extZipOut -Force
    }
    Compress-Archive -Path (Join-Path $extStageDir "*") -DestinationPath $extZipOut -Force
    Remove-Item $extStageDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host " -> [OK] Extension L7 empaquetada ($($requiredExtFiles.Count) archivos limpios)." -ForegroundColor Green
} else {
    Write-Host "[ADVERTENCIA] No se encontro el origen de la extension proxy. Se omitira el empaquetado del ZIP." -ForegroundColor DarkYellow
}

# 1.2 Generacion del paquete ZIP del Agente Nativo Python (Sidecar L7 RAM)
$sidecarSrc = if (Test-Path "packages/saare-edge-agent") {
    "packages/saare-edge-agent"
} elseif (Test-Path "saare-edge-agent") {
    "saare-edge-agent"
} else {
    $null
}

if ($sidecarSrc -and $consolePublicDeploy) {
    Write-Host " -> Empaquetando Agente Nativo Python L7 en $consolePublicDeploy/saare_native_sidecar.zip..." -ForegroundColor Gray
    $sidecarFiles = Get-ChildItem -Path $sidecarSrc -File | Where-Object { $_.Extension -in @(".py", ".toml", ".md") }
    if ($sidecarFiles.Count -gt 0) {
        $sidecarZipOut = "$consolePublicDeploy/saare_native_sidecar.zip"
        if (Test-Path $sidecarZipOut) {
            Remove-Item $sidecarZipOut -Force
        }
        Compress-Archive -Path $sidecarFiles.FullName -DestinationPath $sidecarZipOut -Force
        Write-Host " -> [OK] Sidecar Python empaquetado ($($sidecarFiles.Count) archivos limpios)." -ForegroundColor Green
    } else {
        Write-Host "[ADVERTENCIA] La carpeta $sidecarSrc no contiene archivos .py/.toml/.md." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[ADVERTENCIA] No se encontro packages/saare-edge-agent. Se omitira el empaquetado del Sidecar." -ForegroundColor DarkYellow
}

# ------------------------------------------------------------------------------
# FASE 2: COMPILACION DIRECTA DE FRONTENDS (PNPM WORKSPACES)
# ------------------------------------------------------------------------------
Write-Host "`n==> [2/7] Compilando aplicaciones web (saare-console + saare-suite)..." -ForegroundColor Cyan

Write-Host " -> Compilando Consola GRC (saare-console)..." -ForegroundColor Gray
pnpm --filter saare-console run build
Assert-LastExitCode -FailureMessage "Fallo al compilar saare-console"

Write-Host " -> Compilando Landing Comercial (saare-suite)..." -ForegroundColor Gray
pnpm --filter saare-suite run build
Assert-LastExitCode -FailureMessage "Fallo al compilar saare-suite"

# ------------------------------------------------------------------------------
# FASE 3: DESPLIEGUE DE FRONTENDS A CLOUDFLARE PAGES
# ------------------------------------------------------------------------------
Write-Host "`n==> [3/7] Desplegando Frontends a Cloudflare Pages..." -ForegroundColor Cyan

$consoleDist = if (Test-Path "saare-console/dist") {
    "saare-console/dist"
} elseif (Test-Path "apps/saare-console/dist") {
    "apps/saare-console/dist"
} else {
    $null
}
if ($consoleDist) {
    Write-Host " -> Desplegando Consola GRC ($consoleDist)..." -ForegroundColor Gray
    npx wrangler pages deploy "$consoleDist" --project-name=saare-console --branch=main --commit-dirty=true
    Assert-LastExitCode -FailureMessage "Fallo al desplegar saare-console"
} else {
    Write-Host "[ERROR] Fallo la compilacion de saare-console. No existe carpeta dist." -ForegroundColor Red
    exit 1
}

$suiteDist = if (Test-Path "saare-suite/dist") {
    "saare-suite/dist"
} elseif (Test-Path "apps/saare-suite/dist") {
    "apps/saare-suite/dist"
} else {
    $null
}
if ($suiteDist) {
    Write-Host " -> Desplegando Landing Comercial ($suiteDist)..." -ForegroundColor Gray
    npx wrangler pages deploy "$suiteDist" --project-name=saare-suite --branch=main --commit-dirty=true
    Assert-LastExitCode -FailureMessage "Fallo al desplegar saare-suite"
} else {
    Write-Host "[ERROR] Fallo la compilacion de saare-suite. No existe carpeta dist." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# FASE 4: MIGRACIONES DE BASE DE DATOS, SECRETOS & CONTROL PLANE WORKER
# ------------------------------------------------------------------------------
Write-Host "`n==> [4/7] Desplegando Control Plane Worker y Esquemas D1..." -ForegroundColor Cyan
$controlPlanePath = if (Test-Path "control-plane") {
    "control-plane"
} elseif (Test-Path "apps/control-plane") {
    "apps/control-plane"
} else {
    $null
}

if ($controlPlanePath) {
    Push-Location $controlPlanePath
    try {
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
            npx wrangler d1 execute saare-vault-d1 --remote --file="$sqlPath" --yes
            Assert-LastExitCode -FailureMessage "Fallo al aplicar schema.sql en D1"
            Write-Host " -> [OK] Esquema D1 aplicado correctamente." -ForegroundColor Green
        } else {
            Write-Host "[ADVERTENCIA] No se encontro el archivo schema.sql. Omitiendo migracion D1." -ForegroundColor DarkYellow
        }

        $dTsFile = "worker-configuration.d.ts"
        if (Test-Path $dTsFile) {
            $contentCheck = Get-Content -Path $dTsFile -Raw -ErrorAction SilentlyContinue
            if ($contentCheck -notmatch "Generated by Wrangler") {
                Remove-Item -Path $dTsFile -Force -ErrorAction SilentlyContinue
            }
        }

        Write-Host " -> Sincronizando tipos TypeScript de Wrangler..." -ForegroundColor Gray
        npx wrangler types
        Assert-LastExitCode -FailureMessage "Fallo al generar tipos con wrangler types"

        Write-Host " -> Publicando Worker a Cloudflare (saare-control-plane-prod)..." -ForegroundColor Gray
        npx wrangler deploy --env production
        Assert-LastExitCode -FailureMessage "Fallo al desplegar el Worker"

        if ($RemoveMasterTestPassword) {
            Write-Host " -> Eliminando secreto MASTER_TEST_PASSWORD en produccion..." -ForegroundColor Gray
            npx wrangler secret delete MASTER_TEST_PASSWORD --env production --force
            Assert-LastExitCode -FailureMessage "Fallo al eliminar MASTER_TEST_PASSWORD"
            Write-Host " -> [OK] Secreto MASTER_TEST_PASSWORD eliminado." -ForegroundColor Green
        } elseif (-not [string]::IsNullOrWhiteSpace($MasterTestPassword)) {
            Write-Host " -> Configurando secreto MASTER_TEST_PASSWORD en produccion..." -ForegroundColor Gray
            $MasterTestPassword | npx wrangler secret put MASTER_TEST_PASSWORD --env production
            Assert-LastExitCode -FailureMessage "Fallo al configurar MASTER_TEST_PASSWORD"
            Write-Host " -> [OK] Secreto MASTER_TEST_PASSWORD actualizado en produccion." -ForegroundColor Green
        }
    } catch {
        Write-Host "[ERROR] Fase 4 detenida: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
} else {
    Write-Host "[ERROR] No se encontro la carpeta del control-plane." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# FASE 5: SINCRONIZACION CON REPOSITORIO GIT
# ------------------------------------------------------------------------------
Write-Host "`n==> [5/7] Sincronizando repositorio con GitHub..." -ForegroundColor Cyan
git add .
Assert-LastExitCode -FailureMessage "Fallo en git add"
$gitStatus = git status --porcelain
if ($gitStatus) {
    $currentBranch = (git branch --show-current).Trim()
    if (-not $currentBranch) {
        $currentBranch = "main"
    }

    git commit -m "chore(release): despliegue maestro v8.9"
    Assert-LastExitCode -FailureMessage "Fallo en git commit"
    git push origin HEAD
    Assert-LastExitCode -FailureMessage "Fallo en git push"
    Write-Host "Cambios subidos correctamente a GitHub (Rama: $currentBranch)." -ForegroundColor Green
} else {
    Write-Host "No hay cambios pendientes en Git." -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# FASE 6: PRUEBA DE SALUD Y VERIFICACION HTTP INTEGRAL
# ------------------------------------------------------------------------------
Write-Host "`n==> [6/7] Verificando salud del entorno de Produccion..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

$apiEndpoints = @(
    "https://api.saare.es/health",
    "https://api.saare.es/api/v1/health"
)

$apiOnline = $false
foreach ($url in $apiEndpoints) {
    try {
        $health = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5
        Write-Host " -> [OK] Estado API ($url): $($health.status)" -ForegroundColor Green
        $apiOnline = $true
        break
    } catch {
        # Intenta con el siguiente endpoint alternativo
    }
}

if (-not $apiOnline) {
    Write-Host "[ADVERTENCIA] El Control Plane (api.saare.es) no respondio al chequeo de salud." -ForegroundColor DarkYellow
}

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
            Write-Host " -> [ADVERTENCIA] $($fe.Name) respondio con codigo HTTP: $($response.StatusCode)" -ForegroundColor DarkYellow
        }
    } catch {
        Write-Host " -> [ADVERTENCIA] No se pudo conectar con $($fe.Name) en $($fe.Url)" -ForegroundColor DarkYellow
    }
}

$artifactsToTest = @(
    @{ Name = "Extension L7 (.ZIP)"; Url = "https://console.saare.es/deploy/saare_l7_proxy_extension.zip" },
    @{ Name = "Agente Nativo Python Sidecar (.ZIP)"; Url = "https://console.saare.es/deploy/saare_native_sidecar.zip" }
)

foreach ($art in $artifactsToTest) {
    try {
        $headResp = Invoke-WebRequest -Uri $art.Url -Method Head -UseBasicParsing -TimeoutSec 5
        if ($headResp.StatusCode -eq 200) {
            Write-Host " -> [OK] Artefacto publicado: $($art.Name) ($($art.Url))" -ForegroundColor Green
        }
    } catch {
        Write-Host " -> [ADVERTENCIA] Artefacto no accesible aun en CDN: $($art.Name) ($($art.Url))" -ForegroundColor DarkYellow
    }
}

# ------------------------------------------------------------------------------
# FASE 7: VERIFICACION CORS Y PRUEBA OPCIONAL DE TENANT
# ------------------------------------------------------------------------------
Write-Host "`n==> [7/7] Ejecutando verificaciones de CORS y conectividad..." -ForegroundColor Cyan

$chatEndpoint = "https://api.saare.es/v1/chat/completions"
$testFailureCount = 0
$corsOrigins = @(
    "https://console.saare.es",
    "https://saare.es"
)

foreach ($origin in $corsOrigins) {
    try {
        $preflightHeaders = @{
            "Origin"                         = $origin
            "Access-Control-Request-Method"  = "POST"
            "Access-Control-Request-Headers" = "content-type,authorization,x-saare-tenant,x-saare-browser-profile,x-saare-client-profile"
        }
        $optResp = Invoke-WebRequest -Uri $chatEndpoint -Method Options -Headers $preflightHeaders -UseBasicParsing -TimeoutSec 6
        $allowOrigin = $optResp.Headers["Access-Control-Allow-Origin"]
        if ($optResp.StatusCode -in @(200, 204) -and ($allowOrigin -eq $origin -or $allowOrigin -eq "*")) {
            Write-Host " -> [OK] CORS Preflight validado para $origin (Allow-Origin: $allowOrigin)" -ForegroundColor Green
        } else {
            Write-Host " -> [FALLO] CORS inesperado para $origin (HTTP $($optResp.StatusCode), Allow-Origin: $allowOrigin)" -ForegroundColor Red
            $testFailureCount++
        }
    } catch {
        Write-Host " -> [ERROR] Fallo verificacion CORS para $origin : $($_.Exception.Message)" -ForegroundColor Red
        $testFailureCount++
    }
}

if (-not $SkipSmokeTests -and $SmokeTenant) {
    try {
        $reqHeaders = @{
            "Content-Type"   = "application/json"
            "x-saare-tenant" = $SmokeTenant
        }
        if ($SmokeToken) {
            $reqHeaders["Authorization"] = "Bearer $SmokeToken"
        }

        $reqBody = @{
            prompt    = "Verificacion de conectividad ex-ante."
            messages  = @(@{ role = "user"; content = "Verificacion de conectividad ex-ante." })
            tenant_id = $SmokeTenant
            mode      = "EX_ANTE_INSPECTION_ONLY"
        } | ConvertTo-Json -Depth 4

        $resp = Invoke-RestMethod -Uri $chatEndpoint -Method Post -Headers $reqHeaders -Body $reqBody -TimeoutSec 10
        Write-Host " -> [OK] Prueba de humo completada para tenant [$SmokeTenant] (success=$([bool]$resp.success))" -ForegroundColor Green
    } catch {
        Write-Host " -> [ERROR] Fallo prueba de humo para [$SmokeTenant]: $($_.Exception.Message)" -ForegroundColor Red
        $testFailureCount++
    }
}

if ($testFailureCount -gt 0) {
    Write-Host "`n[COMPLETADO CON ADVERTENCIAS/FALLOS] Fallos detectados: $testFailureCount" -ForegroundColor Red
    exit 1
}

Write-Host "`n==> [OK] Despliegue maestro completado." -ForegroundColor Green