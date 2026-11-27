# ==============================================================================
# SCRIPT MAESTRO DE PRODUCCION INTEGRAL S.A.A.R.E. Enterprise (v9.2 - Hardened)
# ==============================================================================
param(
    [string[]]$SmokeTenants = @("ENTERPRISE", "PRO", "STARTER"),
    [string]$SmokeToken = "",
    [string]$CrossTenantProbeId = "TENANT_ISOLATION_PROBE",
    [switch]$ConfigureMasterTestPassword,
    [switch]$RemoveMasterTestPassword,
    [switch]$SkipSmokeTests,
    [switch]$SkipMultiTenantChecks,
    [switch]$SkipGitPush,
    [switch]$SkipNativeDeps,
    [switch]$SkipPythonDeps,
    [switch]$SkipPackageInstall
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

function Refresh-ProcessPath {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = ($machinePath, $userPath | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }) -join ";"
}

function Resolve-ToolInStandardPaths {
    param(
        [Parameter(Mandatory = $true)][string]$CommandName
    )
    if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
        return $true
    }

    $knownCandidates = @(
        "$env:ProgramFiles\Git\cmd\$CommandName.exe",
        "$env:ProgramFiles\nodejs\$CommandName.exe",
        "$env:ProgramFiles\OpenSSL-Win64\bin\$CommandName.exe",
        "C:\Program Files (x86)\OpenSSL-Win32\bin\$CommandName.exe",
        "$env:LOCALAPPDATA\Microsoft\WinGet\Links\$CommandName.exe"
    ) | Where-Object { $_ -and (Test-Path $_) }

    foreach ($candidate in $knownCandidates) {
        $dir = Split-Path $candidate -Parent
        if ($env:Path -notlike "*$dir*") {
            $env:Path = "$dir;$env:Path"
        }
        if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
            return $true
        }
    }

    $searchRoots = @(
        "C:\Program Files",
        "C:\Program Files (x86)",
        $env:LOCALAPPDATA
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) -and (Test-Path $_) }

    $found = Get-ChildItem -Path $searchRoots -Filter "$CommandName.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found -and -not [string]::IsNullOrWhiteSpace($found.DirectoryName)) {
        $dir = $found.DirectoryName
        if ($env:Path -notlike "*$dir*") {
            $env:Path = "$dir;$env:Path"
        }
    }

    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

function Ensure-NativeTool {
    param(
        [Parameter(Mandatory = $true)][string]$CommandName,
        [Parameter(Mandatory = $true)][string]$WingetId,
        [Parameter(Mandatory = $true)][string]$DisplayName
    )
    if (Resolve-ToolInStandardPaths -CommandName $CommandName) {
        Write-Host " -> [OK] $DisplayName disponible." -ForegroundColor Green
        return
    }

    if ($SkipNativeDeps) {
        throw "Falta la herramienta nativa '$DisplayName' ($CommandName) y se indico -SkipNativeDeps."
    }

    if (-not (Get-Command "winget" -ErrorAction SilentlyContinue)) {
        throw "Falta '$DisplayName' ($CommandName) y 'winget' no esta disponible para instalarlo automaticamente."
    }

    Write-Host " -> Instalando dependencia nativa $DisplayName ($WingetId) via winget..." -ForegroundColor Yellow
    winget install --id $WingetId --exact --source winget --accept-package-agreements --accept-source-agreements --silent
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189) {
        throw "Fallo al instalar $DisplayName con winget (ExitCode=$LASTEXITCODE)"
    }

    Refresh-ProcessPath
    if (-not (Resolve-ToolInStandardPaths -CommandName $CommandName)) {
        throw "Se instalo $DisplayName pero '$CommandName' sigue sin encontrarse en PATH. Reinicia la terminal y reintenta."
    }

    Write-Host " -> [OK] $DisplayName instalado y listo." -ForegroundColor Green
}

function Install-SidecarPythonDependencies {
    param(
        [Parameter(Mandatory = $true)][string]$SidecarDir,
        [string]$RequirementsFile = "",
        [string]$PyprojectFile = ""
    )

    if (-not (Get-Command "uv" -ErrorAction SilentlyContinue)) {
        python -m pip --version >$null 2>&1
        if ($LASTEXITCODE -ne 0) {
            python -m ensurepip --upgrade
            Assert-LastExitCode -FailureMessage "Fallo al inicializar pip con ensurepip"
        }
    }

    if ($RequirementsFile -and (Test-Path $RequirementsFile)) {
        Write-Host " -> Instalando dependencias desde $RequirementsFile..." -ForegroundColor Gray
        if (Get-Command "uv" -ErrorAction SilentlyContinue) {
            uv pip install --system -r $RequirementsFile
        } else {
            python -m pip install --upgrade -r $RequirementsFile
        }
        Assert-LastExitCode -FailureMessage "Fallo al instalar requirements.txt"
    }

    if ($PyprojectFile -and (Test-Path $PyprojectFile)) {
        Write-Host " -> Revisando dependencias en $PyprojectFile..." -ForegroundColor Gray
        $depCode = @"
import sys, tomllib
from pathlib import Path
p = Path(sys.argv[1])
data = tomllib.loads(p.read_text(encoding="utf-8"))
deps = data.get("project", {}).get("dependencies", [])
for d in deps:
    print(d)
"@
        $pyDepScript = Join-Path $env:TEMP ("saare_parse_deps_" + [guid]::NewGuid().ToString("N") + ".py")
        Set-Content -Path $pyDepScript -Value $depCode -Encoding UTF8
        try {
            $parsedDeps = @(& python $pyDepScript $PyprojectFile 2>$null | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        } finally {
            if (Test-Path $pyDepScript) {
                Remove-Item $pyDepScript -Force -ErrorAction SilentlyContinue
            }
        }

        if ($parsedDeps.Count -gt 0) {
            Write-Host " -> Instalando $($parsedDeps.Count) dependencias declaradas en pyproject.toml..." -ForegroundColor Gray
            if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                uv pip install --system @parsedDeps
            } else {
                python -m pip install --upgrade @parsedDeps
            }
            Assert-LastExitCode -FailureMessage "Fallo al instalar dependencias de pyproject.toml"
        } else {
            Write-Host " -> Sin dependencias adicionales en [project].dependencies." -ForegroundColor DarkGray
        }

        if (-not $SkipPackageInstall) {
            Write-Host " -> Instalando paquete Python local $SidecarDir..." -ForegroundColor Gray
            if (Get-Command "uv" -ErrorAction SilentlyContinue) {
                uv pip install --system --no-build-isolation --no-deps $SidecarDir
            } else {
                python -m pip install --upgrade --no-build-isolation --no-deps $SidecarDir
            }
            Assert-LastExitCode -FailureMessage "Fallo al instalar el paquete Python $SidecarDir"
            Write-Host " -> [OK] Paquete $SidecarDir instalado." -ForegroundColor Green
        } else {
            Write-Host " -> Instalacion del paquete local omitida por parametro (-SkipPackageInstall)." -ForegroundColor Yellow
        }
    }
}

function Get-HttpStatusSafe {
    param([Parameter(Mandatory = $true)]$ExceptionRecord)
    try {
        $resp = $ExceptionRecord.Exception.Response
        if ($null -ne $resp) {
            if ($resp.PSObject.Properties.Match("StatusCode").Count -gt 0) {
                $code = $resp.StatusCode
                if ($null -ne $code) {
                    if ($code.PSObject.Properties.Match("value__").Count -gt 0) {
                        return [int]$code.value__
                    }
                    return [int]$code
                }
            }
        }
    } catch {
        # Ignorar si la excepcion no expone codigo HTTP numerico
    }
    return $null
}

function Invoke-TenantChatProbe {
    param(
        [Parameter(Mandatory = $true)][string]$Endpoint,
        [Parameter(Mandatory = $true)][string]$HeaderTenant,
        [string]$BodyTenant = "",
        [string]$Token = "",
        [string]$PromptText = "Verificacion de conectividad ex-ante multitenant."
    )

    $headers = @{
        "Content-Type"            = "application/json"
        "x-saare-tenant"          = $HeaderTenant
        "x-saare-browser-profile" = "AUDIT_PROBE"
        "x-saare-client-profile"  = "DEPLOY_PIPELINE_V9_2"
    }
    if (-not [string]::IsNullOrWhiteSpace($Token)) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $effectiveBodyTenant = if ([string]::IsNullOrWhiteSpace($BodyTenant)) { $HeaderTenant } else { $BodyTenant }

    $payload = @{
        prompt    = $PromptText
        messages  = @(@{ role = "user"; content = $PromptText })
        tenant_id = $effectiveBodyTenant
        mode      = "EX_ANTE_INSPECTION_ONLY"
    } | ConvertTo-Json -Depth 4

    try {
        $resp = Invoke-RestMethod -Uri $Endpoint -Method Post -Headers $headers -Body $payload -TimeoutSec 15
        return @{
            Ok         = $true
            StatusCode = 200
            Response   = $resp
            ErrorText  = ""
        }
    } catch {
        $status = Get-HttpStatusSafe -ExceptionRecord $_
        $detail = $_.Exception.Message
        if ($_.ErrorDetails -and -not [string]::IsNullOrWhiteSpace($_.ErrorDetails.Message)) {
            $detail = "$detail | $($_.ErrorDetails.Message)"
        }
        return @{
            Ok         = $false
            StatusCode = $status
            Response   = $null
            ErrorText  = $detail
        }
    }
}

# ------------------------------------------------------------------------------
# FASE 0: PRE-FLIGHT CHECKS, NATIVAS & VERIFICACION DE PERMISOS
# ------------------------------------------------------------------------------
Write-Host "`n==> [0/7] Ejecutando verificaciones de entorno, nativas y credenciales..." -ForegroundColor Magenta

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($repoRoot -and (Test-Path $repoRoot)) {
    Set-Location $repoRoot
}
if ((Get-Location).Path.EndsWith("control-plane")) {
    Set-Location ..
}

Ensure-NativeTool -CommandName "git" -WingetId "Git.Git" -DisplayName "Git"
Ensure-NativeTool -CommandName "node" -WingetId "OpenJS.NodeJS.LTS" -DisplayName "Node.js LTS"
Ensure-NativeTool -CommandName "python" -WingetId "Python.Python.3.12" -DisplayName "Python 3"
Ensure-NativeTool -CommandName "openssl" -WingetId "ShiningLight.OpenSSL.Light" -DisplayName "OpenSSL"

if (-not (Resolve-ToolInStandardPaths -CommandName "pnpm")) {
    Write-Host " -> Instalando pnpm via corepack/npm..." -ForegroundColor Yellow
    if (Resolve-ToolInStandardPaths -CommandName "corepack") {
        corepack enable
        corepack prepare pnpm@latest --activate
        Assert-LastExitCode -FailureMessage "Fallo al activar pnpm con corepack"
    } else {
        npm install -g pnpm
        Assert-LastExitCode -FailureMessage "Fallo al instalar pnpm con npm"
    }
    Refresh-ProcessPath
    if (-not (Resolve-ToolInStandardPaths -CommandName "pnpm")) {
        throw "No se pudo localizar 'pnpm' tras la instalacion."
    }
}
Write-Host " -> [OK] pnpm disponible ($(pnpm -v))." -ForegroundColor Green

Write-Host " -> Verificando permisos en Cloudflare..." -ForegroundColor Gray
$whoamiRaw = & pnpm exec wrangler whoami 2>&1
$whoamiExit = $LASTEXITCODE
$whoamiFilteredLines = @(
    $whoamiRaw | ForEach-Object {
        if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.Exception.Message } else { [string]$_ }
    } | Where-Object { $_ -notmatch "^Scope:\s+all\s+\d+\s+workspace\s+projects" }
)
$whoamiText = ($whoamiFilteredLines -join "`n").Trim()

if ($whoamiExit -ne 0 -or ($whoamiText -match "You are not logged in|not authenticated|code: 10000")) {
    throw "No se pudo verificar la sesion en Cloudflare. Ejecuta 'pnpm exec wrangler login' o revisa CLOUDFLARE_API_TOKEN. Detalle: $whoamiText"
}
Write-Host " -> Sesion de Wrangler verificada correctamente." -ForegroundColor Green

Write-Host " -> Verificando estado del repositorio Git..." -ForegroundColor Gray
git rev-parse --is-inside-work-tree | Out-Null
Assert-LastExitCode -FailureMessage "El directorio actual no es un repositorio Git valido."

# ------------------------------------------------------------------------------
# FASE 1: DEPENDENCIAS (NODE + PYTHON), EMPAQUETADO L7 Y LIMPIEZA
# ------------------------------------------------------------------------------
Write-Host "`n==> [1/7] Resolviendo dependencias (Node/pnpm + Python), empaquetando L7 y limpiando builds..." -ForegroundColor Yellow
pnpm install --frozen-lockfile
Assert-LastExitCode -FailureMessage "Fallo al instalar dependencias con pnpm"

$distDirs = @(
    "saare-console/dist",
    "saare-suite/dist",
    "apps/saare-console/dist",
    "apps/saare-suite/dist",
    "control-plane/dist",
    "apps/control-plane/dist"
)
foreach ($d in $distDirs) {
    if (Test-Path $d) {
        Remove-Item -Recurse -Force $d
    }
}
Get-ChildItem -Recurse -Filter "vite.config.js.timestamp-*.mjs" -ErrorAction SilentlyContinue | Remove-Item -Force

$consolePublicDeploy = if (Test-Path "apps/saare-console") {
    Join-Path "apps/saare-console" "public/deploy"
} elseif (Test-Path "saare-console") {
    Join-Path "saare-console" "public/deploy"
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
    $extZipOut = Join-Path $consolePublicDeploy "saare_l7_proxy_extension.zip"
    Write-Host " -> Empaquetando Extension Proxy L7 en $extZipOut..." -ForegroundColor Gray
    $extStageDir = Join-Path $env:TEMP ("saare_l7_ext_stage_" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $extStageDir | Out-Null

    try {
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
            throw "Faltan archivos requeridos en $extSrc : $($missingExtFiles -join ', ')"
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

        if (Test-Path $extZipOut) {
            Remove-Item $extZipOut -Force
        }
        Compress-Archive -Path (Join-Path $extStageDir "*") -DestinationPath $extZipOut -Force
        Write-Host " -> [OK] Extension L7 empaquetada ($($requiredExtFiles.Count) archivos limpios)." -ForegroundColor Green
    } finally {
        if (Test-Path $extStageDir) {
            Remove-Item $extStageDir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host "[ADVERTENCIA] No se encontro el origen de la extension proxy. Se omitira el empaquetado del ZIP." -ForegroundColor DarkYellow
}

# 1.2 Librerias Python y empaquetado ZIP del Agente Nativo Python (Sidecar L7 RAM)
$sidecarSrc = if (Test-Path "packages/saare-edge-agent") {
    "packages/saare-edge-agent"
} elseif (Test-Path "saare-edge-agent") {
    "saare-edge-agent"
} else {
    $null
}

if ($sidecarSrc) {
    if (-not $SkipPythonDeps) {
        $reqFile = Join-Path $sidecarSrc "requirements.txt"
        $pyprojectFile = Join-Path $sidecarSrc "pyproject.toml"

        if ((Test-Path $reqFile) -or (Test-Path $pyprojectFile)) {
            Write-Host " -> Instalando librerias y paquete Python para el sidecar ($sidecarSrc)..." -ForegroundColor Gray
            Install-SidecarPythonDependencies -SidecarDir $sidecarSrc -RequirementsFile $reqFile -PyprojectFile $pyprojectFile
            Write-Host " -> [OK] Entorno Python del sidecar listo." -ForegroundColor Green
        } else {
            Write-Host " -> Sin requirements.txt ni pyproject.toml en $sidecarSrc; se omite instalacion de paquetes Python." -ForegroundColor DarkGray
        }
    } else {
        Write-Host " -> Instalacion de librerias Python omitida por parametro (-SkipPythonDeps)." -ForegroundColor Yellow
    }

    if ($consolePublicDeploy) {
        $sidecarZipOut = Join-Path $consolePublicDeploy "saare_native_sidecar.zip"
        Write-Host " -> Empaquetando Agente Nativo Python L7 en $sidecarZipOut..." -ForegroundColor Gray
        $sidecarStageDir = Join-Path $env:TEMP ("saare_sidecar_stage_" + [guid]::NewGuid().ToString("N"))
        New-Item -ItemType Directory -Path $sidecarStageDir | Out-Null

        try {
            $resolvedSidecarRoot = (Resolve-Path $sidecarSrc).Path
            $allowedExts = @(".py", ".toml", ".md", ".json", ".txt")
            $sidecarFiles = Get-ChildItem -Path $resolvedSidecarRoot -Recurse -File | Where-Object {
                $_.Extension -in $allowedExts -and
                $_.FullName -notmatch "\\(__pycache__|\.pytest_cache|\.venv|build|dist|[^\\]+\.egg-info)(\\|$)"
            }

            if ($sidecarFiles.Count -gt 0) {
                foreach ($f in $sidecarFiles) {
                    $relPath = $f.FullName.Substring($resolvedSidecarRoot.Length).TrimStart("\", "/")
                    $dstFile = Join-Path $sidecarStageDir $relPath
                    $dstParent = Split-Path $dstFile -Parent
                    if (-not (Test-Path $dstParent)) {
                        New-Item -ItemType Directory -Path $dstParent -Force | Out-Null
                    }
                    Copy-Item -Path $f.FullName -Destination $dstFile -Force
                }

                if (Test-Path $sidecarZipOut) {
                    Remove-Item $sidecarZipOut -Force
                }
                Compress-Archive -Path (Join-Path $sidecarStageDir "*") -DestinationPath $sidecarZipOut -Force
                Write-Host " -> [OK] Sidecar Python empaquetado ($($sidecarFiles.Count) archivos limpios)." -ForegroundColor Green
            } else {
                Write-Host "[ADVERTENCIA] La carpeta $sidecarSrc no contiene archivos empaquetables." -ForegroundColor DarkYellow
            }
        } finally {
            if (Test-Path $sidecarStageDir) {
                Remove-Item $sidecarStageDir -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
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
# FASE 3: SINCRONIZACION DE TIPOS EN CONTROL PLANE
# ------------------------------------------------------------------------------
Write-Host "`n==> [3/7] Sincronizando tipos de Wrangler en Control Plane..." -ForegroundColor Cyan
$controlPlanePath = if (Test-Path "control-plane") {
    "control-plane"
} elseif (Test-Path "apps/control-plane") {
    "apps/control-plane"
} else {
    $null
}

if (-not $controlPlanePath) {
    throw "No se encontro la carpeta del control-plane."
}

Push-Location $controlPlanePath
try {
    $dTsFile = "worker-configuration.d.ts"
    if (Test-Path $dTsFile) {
        $contentCheck = Get-Content -Path $dTsFile -Raw -ErrorAction SilentlyContinue
        if ($contentCheck -notmatch "Generated by Wrangler") {
            Remove-Item -Path $dTsFile -Force
        }
    }
    Write-Host " -> Sincronizando tipos TypeScript de Wrangler..." -ForegroundColor Gray
    pnpm exec wrangler types --env production
    Assert-LastExitCode -FailureMessage "Fallo al generar tipos con wrangler types"
} finally {
    Pop-Location
}

# ------------------------------------------------------------------------------
# FASE 4: DESPLIEGUE DE FRONTENDS A CLOUDFLARE PAGES
# ------------------------------------------------------------------------------
Write-Host "`n==> [4/7] Desplegando Frontends a Cloudflare Pages..." -ForegroundColor Cyan

$consoleDist = if (Test-Path "apps/saare-console/dist") {
    "apps/saare-console/dist"
} elseif (Test-Path "saare-console/dist") {
    "saare-console/dist"
} else {
    $null
}
if (-not $consoleDist) {
    throw "Fallo la compilacion de saare-console. No existe carpeta dist."
}
Write-Host " -> Desplegando Consola GRC ($consoleDist)..." -ForegroundColor Gray
pnpm exec wrangler pages deploy "$consoleDist" --project-name=saare-console --branch=main --commit-dirty=true
Assert-LastExitCode -FailureMessage "Fallo al desplegar saare-console"

$suiteDist = if (Test-Path "apps/saare-suite/dist") {
    "apps/saare-suite/dist"
} elseif (Test-Path "saare-suite/dist") {
    "saare-suite/dist"
} else {
    $null
}
if (-not $suiteDist) {
    throw "Fallo la compilacion de saare-suite. No existe carpeta dist."
}
Write-Host " -> Desplegando Landing Comercial ($suiteDist)..." -ForegroundColor Gray
pnpm exec wrangler pages deploy "$suiteDist" --project-name=saare-suite --branch=main --commit-dirty=true
Assert-LastExitCode -FailureMessage "Fallo al desplegar saare-suite"

# ------------------------------------------------------------------------------
# FASE 5: MIGRACIONES DE BASE DE DATOS, SECRETOS & CONTROL PLANE WORKER
# ------------------------------------------------------------------------------
Write-Host "`n==> [5/7] Aplicando esquemas D1, secretos y desplegando Control Plane Worker..." -ForegroundColor Cyan

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
        pnpm exec wrangler d1 execute saare-vault-d1 --env production --remote --file="$sqlPath" --yes
        Assert-LastExitCode -FailureMessage "Fallo al aplicar schema.sql en D1"
        Write-Host " -> [OK] Esquema D1 aplicado correctamente." -ForegroundColor Green
    } else {
        Write-Host "[ADVERTENCIA] No se encontro el archivo schema.sql. Omitiendo migracion D1." -ForegroundColor DarkYellow
    }

    Write-Host " -> Publicando Worker a Cloudflare (saare-control-plane-prod)..." -ForegroundColor Gray
    pnpm exec wrangler deploy --env production
    Assert-LastExitCode -FailureMessage "Fallo al desplegar el Worker"

    if ($RemoveMasterTestPassword) {
        Write-Host " -> Eliminando secreto MASTER_TEST_PASSWORD en produccion..." -ForegroundColor Gray
        pnpm exec wrangler secret delete MASTER_TEST_PASSWORD --env production
        Assert-LastExitCode -FailureMessage "Fallo al eliminar MASTER_TEST_PASSWORD"
        Write-Host " -> [OK] Secreto MASTER_TEST_PASSWORD eliminado." -ForegroundColor Green
    } elseif ($ConfigureMasterTestPassword) {
        Write-Host " -> Configurando secreto MASTER_TEST_PASSWORD de forma interactiva..." -ForegroundColor Gray
        pnpm exec wrangler secret put MASTER_TEST_PASSWORD --env production
        Assert-LastExitCode -FailureMessage "Fallo al configurar MASTER_TEST_PASSWORD"
        Write-Host " -> [OK] Secreto MASTER_TEST_PASSWORD actualizado en produccion." -ForegroundColor Green
    }
} finally {
    Pop-Location
}

# ------------------------------------------------------------------------------
# FASE 6: SINCRONIZACION DEL RELEASE CON GITHUB (TRAS DESPLIEGUE EXITOSO)
# ------------------------------------------------------------------------------
Write-Host "`n==> [6/7] Sincronizando repositorio con GitHub..." -ForegroundColor Cyan
if ($SkipGitPush) {
    Write-Host " -> Se omitio la sincronizacion Git por parametro (-SkipGitPush)." -ForegroundColor Yellow
} else {
    git add -A
    Assert-LastExitCode -FailureMessage "Fallo en git add"
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        $currentBranch = (git branch --show-current).Trim()
        if (-not $currentBranch) {
            $currentBranch = "HEAD"
        }

        git commit -m "chore(release): despliegue maestro v9.2"
        Assert-LastExitCode -FailureMessage "Fallo en git commit"
        git push origin HEAD
        Assert-LastExitCode -FailureMessage "Fallo en git push"
        Write-Host " -> [OK] Cambios subidos correctamente a GitHub (Ref: $currentBranch)." -ForegroundColor Green
    } else {
        Write-Host " -> No hay cambios pendientes en Git." -ForegroundColor Yellow
    }
}

# ------------------------------------------------------------------------------
# FASE 7: VERIFICACION INTEGRAL DE SALUD, ARTEFACTOS, CORS, HUMO & MULTITENANT
# ------------------------------------------------------------------------------
Write-Host "`n==> [7/7] Verificando salud, artefactos, CORS, humo y aislacion multitenant..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

$testFailureCount = 0

$apiEndpoints = @(
    "https://api.saare.es/health",
    "https://api.saare.es/api/v1/health"
)

$apiOnline = $false
foreach ($url in $apiEndpoints) {
    try {
        $health = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
        Write-Host " -> [OK] Estado API ($url): $($health.status)" -ForegroundColor Green
        $apiOnline = $true
        break
    } catch {
        # Intenta con el siguiente endpoint alternativo
    }
}

if (-not $apiOnline) {
    Write-Host "[FALLO] El Control Plane (api.saare.es) no respondio al chequeo de salud." -ForegroundColor Red
    $testFailureCount++
}

$frontendsToTest = @(
    @{ Name = "Consola GRC (saare-console)"; Url = "https://console.saare.es" },
    @{ Name = "Landing Comercial (saare-suite)"; Url = "https://saare.es" }
)

foreach ($fe in $frontendsToTest) {
    try {
        $response = Invoke-WebRequest -Uri $fe.Url -Method Get -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host " -> [OK] Frontend operativo: $($fe.Name) ($($fe.Url))" -ForegroundColor Green
        } else {
            Write-Host " -> [FALLO] $($fe.Name) respondio con codigo HTTP: $($response.StatusCode)" -ForegroundColor Red
            $testFailureCount++
        }
    } catch {
        $statusCode = Get-HttpStatusSafe -ExceptionRecord $_
        $codeLabel = if ($statusCode) { "HTTP $statusCode" } else { "Sin respuesta HTTP" }
        Write-Host " -> [FALLO] No se pudo conectar con $($fe.Name) en $($fe.Url) ($codeLabel): $($_.Exception.Message)" -ForegroundColor Red
        $testFailureCount++
    }
}

$artifactsToTest = @(
    @{ Name = "Extension L7 (.ZIP)"; Url = "https://console.saare.es/deploy/saare_l7_proxy_extension.zip" },
    @{ Name = "Agente Nativo Python Sidecar (.ZIP)"; Url = "https://console.saare.es/deploy/saare_native_sidecar.zip" }
)

foreach ($art in $artifactsToTest) {
    $reachable = $false
    foreach ($method in @("Head", "Get")) {
        try {
            $resp = Invoke-WebRequest -Uri $art.Url -Method $method -UseBasicParsing -TimeoutSec 10
            if ($resp.StatusCode -eq 200) {
                Write-Host " -> [OK] Artefacto publicado ($method): $($art.Name) ($($art.Url))" -ForegroundColor Green
                $reachable = $true
                break
            }
        } catch {
            # Prueba siguiente metodo
        }
    }
    if (-not $reachable) {
        Write-Host " -> [FALLO] Artefacto no accesible en CDN: $($art.Name) ($($art.Url))" -ForegroundColor Red
        $testFailureCount++
    }
}

$chatEndpoint = "https://api.saare.es/v1/chat/completions"
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
        $optResp = Invoke-WebRequest -Uri $chatEndpoint -Method Options -Headers $preflightHeaders -UseBasicParsing -TimeoutSec 10
        $rawAllowOrigin = $optResp.Headers["Access-Control-Allow-Origin"]
        $allowOrigin = if ($rawAllowOrigin -is [array]) { $rawAllowOrigin -join "," } else { [string]$rawAllowOrigin }

        $rawAllowHeaders = $optResp.Headers["Access-Control-Allow-Headers"]
        $allowHeaders = if ($rawAllowHeaders -is [array]) { ($rawAllowHeaders -join ",").ToLowerInvariant() } else { ([string]$rawAllowHeaders).ToLowerInvariant() }

        $tenantHeaderAllowed = ([string]::IsNullOrWhiteSpace($allowHeaders)) -or ($allowHeaders -like "*x-saare-tenant*")

        if ($optResp.StatusCode -in @(200, 204) -and ($allowOrigin -eq $origin -or $allowOrigin -eq "*") -and $tenantHeaderAllowed) {
            Write-Host " -> [OK] CORS Preflight multitenant validado para $origin (Allow-Origin: $allowOrigin)" -ForegroundColor Green
        } else {
            Write-Host " -> [FALLO] CORS inesperado para $origin (HTTP $($optResp.StatusCode), Allow-Origin: $allowOrigin, Allow-Headers: $allowHeaders)" -ForegroundColor Red
            $testFailureCount++
        }
    } catch {
        Write-Host " -> [ERROR] Fallo verificacion CORS para $origin : $($_.Exception.Message)" -ForegroundColor Red
        $testFailureCount++
    }
}

if (-not $SkipSmokeTests) {
    $tenantsToRun = @($SmokeTenants | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
    if ($tenantsToRun.Count -eq 0) {
        $tenantsToRun = @("ENTERPRISE")
    }

    foreach ($tId in $tenantsToRun) {
        $probe = Invoke-TenantChatProbe -Endpoint $chatEndpoint -HeaderTenant $tId -BodyTenant $tId -Token $SmokeToken -PromptText "Verificacion de conectividad ex-ante [$tId]."
        $isSuccess = ($probe.Ok -and $null -ne $probe.Response -and ($probe.Response.PSObject.Properties.Match("success").Count -gt 0) -and ($probe.Response.success -eq $true))
        if ($isSuccess) {
            $respTenant = $null
            if ($probe.Response.PSObject.Properties.Match("tenant_id").Count -gt 0) {
                $respTenant = [string]$probe.Response.tenant_id
            } elseif ($probe.Response.PSObject.Properties.Match("tenant").Count -gt 0) {
                $respTenant = [string]$probe.Response.tenant
            }

            if ($respTenant -and ($respTenant -ne $tId)) {
                Write-Host " -> [FALLO] Desajuste de tenant en respuesta para [$tId]: recibido '$respTenant'" -ForegroundColor Red
                $testFailureCount++
            } else {
                Write-Host " -> [OK] Prueba de humo completada para tenant [$tId] (success=True)" -ForegroundColor Green
            }
        } else {
            $errReason = if ($probe.ErrorText) { $probe.ErrorText } else { "Respuesta sin success=True" }
            Write-Host " -> [FALLO] Prueba de humo fallida para tenant [$tId]: $errReason" -ForegroundColor Red
            $testFailureCount++
        }
    }

    if (-not $SkipMultiTenantChecks) {
        # 7.1 Validacion de rechazo ante ausencia de tenant (si el backend exige tenant explicito)
        $noTenantHeaders = @{
            "Content-Type" = "application/json"
        }
        if (-not [string]::IsNullOrWhiteSpace($SmokeToken)) {
            $noTenantHeaders["Authorization"] = "Bearer $SmokeToken"
        }
        $noTenantBody = @{
            prompt   = "Sonda sin cabecera de tenant."
            messages = @(@{ role = "user"; content = "Sonda sin cabecera de tenant." })
            mode     = "EX_ANTE_INSPECTION_ONLY"
        } | ConvertTo-Json -Depth 4

        try {
            $noTenantResp = Invoke-RestMethod -Uri $chatEndpoint -Method Post -Headers $noTenantHeaders -Body $noTenantBody -TimeoutSec 10
            if ($noTenantResp -and ($noTenantResp.success -eq $false)) {
                Write-Host " -> [OK] Sonda sin cabecera de tenant controlada con success=False." -ForegroundColor Green
            } else {
                Write-Host " -> [AVISO] Sonda sin cabecera de tenant devolvio respuesta 200 sin rechazo explicito." -ForegroundColor DarkYellow
            }
        } catch {
            $noTenantStatus = Get-HttpStatusSafe -ExceptionRecord $_
            if ($noTenantStatus -in @(400, 401, 403, 422)) {
                Write-Host " -> [OK] Sonda sin cabecera de tenant rechazada correctamente (HTTP $noTenantStatus)." -ForegroundColor Green
            } else {
                Write-Host " -> [FALLO] Error inesperado en sonda sin cabecera de tenant: $($_.Exception.Message)" -ForegroundColor Red
                $testFailureCount++
            }
        }

        # 7.2 Validacion de coherencia/aislacion cuando x-saare-tenant y body.tenant_id difieren
        $primaryTenant = $tenantsToRun[0]
        $mismatchTenant = if ($CrossTenantProbeId -and ($CrossTenantProbeId -ne $primaryTenant)) {
            $CrossTenantProbeId
        } else {
            "TENANT_MISMATCH_PROBE"
        }

        $mismatchProbe = Invoke-TenantChatProbe -Endpoint $chatEndpoint -HeaderTenant $primaryTenant -BodyTenant $mismatchTenant -Token $SmokeToken -PromptText "Sonda de coherencia multitenant."
        if (-not $mismatchProbe.Ok -and ($mismatchProbe.StatusCode -in @(400, 401, 403, 409, 422))) {
            Write-Host " -> [OK] Conflicto de tenant (header=$primaryTenant vs body=$mismatchTenant) bloqueado (HTTP $($mismatchProbe.StatusCode))." -ForegroundColor Green
        } elseif ($mismatchProbe.Ok -and $mismatchProbe.Response) {
            if ($mismatchProbe.Response.success -eq $false) {
                Write-Host " -> [OK] Conflicto de tenant (header=$primaryTenant vs body=$mismatchTenant) denegado por politica (success=False)." -ForegroundColor Green
            } else {
                Write-Host " -> [FALLO] Conflicto de tenant (header=$primaryTenant vs body=$mismatchTenant) aceptado con success=True sin bloqueo." -ForegroundColor Red
                $testFailureCount++
            }
        } else {
            Write-Host " -> [FALLO] Fallo inesperado en sonda de coherencia multitenant: $($mismatchProbe.ErrorText)" -ForegroundColor Red
            $testFailureCount++
        }
    }
}

if ($testFailureCount -gt 0) {
    Write-Host "`n[COMPLETADO CON FALLOS] Fallos detectados: $testFailureCount" -ForegroundColor Red
    exit 1
}

Write-Host "`n==> [OK] Despliegue maestro completado correctamente." -ForegroundColor Green