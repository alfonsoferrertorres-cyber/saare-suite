<#
.SYNOPSIS
    Motor de sellado criptográfico y sellado temporal RFC 3161 para S.A.A.R.E.
.DESCRIPTION
    Calcula el digest SHA-256 del archivo o hash indicado, genera 00_MANIFIESTO_SELLO_TEMPORAL.json,
    actualiza root_digest.sha256 y, si se indica -TsaUrl y OpenSSL está disponible, solicita
    y guarda la respuesta binaria RFC 3161 (.tsr).
#>
param(
    [string]$TargetFile = ".\00_MANIFIESTO_CRIPTOGRAFICO_SHA256.txt",
    [string]$TsHash = "",
    [string]$TsaUrl = "",
    [string]$OutDir = "."
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$resolvedOutDir = (Resolve-Path -Path $OutDir).Path
$timestampIso = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

if (-not [string]::IsNullOrWhiteSpace($TsHash)) {
    $computedSha256 = $TsHash.Trim().ToLowerInvariant()
    $sourceArtifact = "EXPLICIT_HASH_INPUT"
} elseif (Test-Path -Path $TargetFile) {
    $computedSha256 = (Get-FileHash -Path $TargetFile -Algorithm SHA256).Hash.ToLowerInvariant()
    $sourceArtifact = (Resolve-Path -Path $TargetFile).Path
} else {
    throw "No se encontro el archivo '$TargetFile' ni se suministro un -TsHash valido."
}

$rootDigestPath = Join-Path $resolvedOutDir "root_digest.sha256"
Set-Content -Path $rootDigestPath -Value "$computedSha256  $(Split-Path -Path $sourceArtifact -Leaf)" -Encoding UTF8

$tsaStatus = "LOCAL_DIGEST_ANCHORED_PENDING_TSA"
$tsrPath = $null
$opensslCmd = Get-Command "openssl" -ErrorAction SilentlyContinue

if (-not [string]::IsNullOrWhiteSpace($TsaUrl) -and $null -ne $opensslCmd) {
    $tsqPath = Join-Path $resolvedOutDir "00_SELLO_TEMPORAL.tsq"
    $tsrPath = Join-Path $resolvedOutDir "00_SELLO_TEMPORAL.tsr"

    & $opensslCmd.Source ts -query -digest $computedSha256 -sha256 -cert -out $tsqPath
    if ($LASTEXITCODE -eq 0 -and (Test-Path -Path $tsqPath)) {
        Invoke-WebRequest -Uri $TsaUrl -Method Post -ContentType "application/timestamp-query" -InFile $tsqPath -OutFile $tsrPath
        if ((Test-Path -Path $tsrPath) -and ((Get-Item -Path $tsrPath).Length -gt 0)) {
            $tsaStatus = "RFC3161_TSR_RECEIVED"
        } else {
            $tsaStatus = "RFC3161_TSR_EMPTY_RESPONSE"
        }
    } else {
        $tsaStatus = "RFC3161_TSQ_FAILED"
    }
}

$sealRecord = [ordered]@{
    expediente                   = "MS3V-RECON-VALID-2026-ALF-0521"
    orden_auditoria              = "IA-2026-VAL-AUD-8842-XF"
    titular                      = "Alfonso Ferrer Torres (48553065L)"
    entidad                      = "MS3V S.A.A.R.E. SL"
    timestamp_emision_utc        = $timestampIso
    artefacto_origen             = $sourceArtifact
    sha256_digest                = $computedSha256
    root_digest_file             = $rootDigestPath
    rfc3161_tsa_url              = if ([string]::IsNullOrWhiteSpace($TsaUrl)) { $null } else { $TsaUrl }
    rfc3161_tsr_file             = $tsrPath
    estado_sellado_temporal      = $tsaStatus
    estado_custodia              = "CUSTODIA_INMUTABLE_LEY_1_2019"
    validez_procesal             = "Art_326_LEC"
}

$manifestPath = Join-Path $resolvedOutDir "00_MANIFIESTO_SELLO_TEMPORAL.json"
$sealRecord | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "[+] Manifiesto de sello generado en: $manifestPath" -ForegroundColor Green
Write-Host "[+] SHA-256 vinculado: $computedSha256" -ForegroundColor Yellow
Write-Host "[+] Estado RFC 3161: $tsaStatus" -ForegroundColor Cyan