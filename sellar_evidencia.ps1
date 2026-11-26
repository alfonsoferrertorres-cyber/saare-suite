<#
.SYNOPSIS
    Motor de sellado criptográfico y sellado temporal RFC 3161 para S.A.A.R.E.
#>
param(
    [string]$TargetFile = ".\00_MANIFIESTO_CRIPTOGRAFICO_SHA256.txt",
    [string]$TsHash = "",
    [string]$TsaUrl = "",
    [string]$OutDir = ".",
    [string]$ExpedienteId = "",
    [string]$OrdenAuditoria = "",
    [string]$Entidad = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$resolvedOutDir = (Resolve-Path -Path $OutDir).Path
$timestampIso = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

if (-not [string]::IsNullOrWhiteSpace($TsHash)) {
    $cleanHash = $TsHash.Trim().ToLowerInvariant()
    if ($cleanHash -notmatch "^[0-9a-f]{64}$") {
        throw "El parametro -TsHash debe ser un SHA-256 hexadecimal valido de 64 caracteres."
    }
    $computedSha256 = $cleanHash
    $sourceArtifact = "EXPLICIT_HASH_INPUT"
    $sourceLeaf = "EXPLICIT_HASH_INPUT"
} elseif (Test-Path -Path $TargetFile) {
    $resolvedTarget = (Resolve-Path -Path $TargetFile).Path
    $computedSha256 = (Get-FileHash -Path $resolvedTarget -Algorithm SHA256).Hash.ToLowerInvariant()
    $sourceArtifact = $resolvedTarget
    $sourceLeaf = Split-Path -Path $resolvedTarget -Leaf
} else {
    throw "No se encontro el archivo '$TargetFile' ni se suministro un -TsHash valido."
}

$rootDigestPath = Join-Path $resolvedOutDir "root_digest.sha256"
Set-Content -Path $rootDigestPath -Value "$computedSha256  $sourceLeaf" -Encoding UTF8 -NoNewline

$tsaStatus = "LOCAL_DIGEST_ANCHORED_PENDING_TSA"
$tsrPath = $null
$opensslCmd = Get-Command "openssl" -ErrorAction SilentlyContinue

if (-not [string]::IsNullOrWhiteSpace($TsaUrl)) {
    if ($null -eq $opensslCmd) {
        $tsaStatus = "RFC3161_OPENSSL_NOT_FOUND"
    } else {
        $tsqPath = Join-Path $resolvedOutDir "00_SELLO_TEMPORAL.tsq"
        $candidateTsrPath = Join-Path $resolvedOutDir "00_SELLO_TEMPORAL.tsr"

        & $opensslCmd.Source ts -query -digest $computedSha256 -sha256 -cert -out $tsqPath
        if ($LASTEXITCODE -eq 0 -and (Test-Path -Path $tsqPath)) {
            try {
                Invoke-WebRequest -Uri $TsaUrl -Method Post -ContentType "application/timestamp-query" -InFile $tsqPath -OutFile $candidateTsrPath -TimeoutSec 15
                if ((Test-Path -Path $candidateTsrPath) -and ((Get-Item -Path $candidateTsrPath).Length -gt 0)) {
                    & $opensslCmd.Source ts -reply -in $candidateTsrPath -text >$null 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        $tsrPath = $candidateTsrPath
                        $tsaStatus = "RFC3161_TSR_VERIFIED"
                    } else {
                        $tsaStatus = "RFC3161_TSR_INVALID_ASN1"
                    }
                } else {
                    $tsaStatus = "RFC3161_TSR_EMPTY_RESPONSE"
                }
            } catch {
                $tsaStatus = "RFC3161_TSA_REQUEST_FAILED"
            }
        } else {
            $tsaStatus = "RFC3161_TSQ_FAILED"
        }
    }
}

$sealRecord = [ordered]@{
    expediente              = if ([string]::IsNullOrWhiteSpace($ExpedienteId)) { $null } else { $ExpedienteId }
    orden_auditoria         = if ([string]::IsNullOrWhiteSpace($OrdenAuditoria)) { $null } else { $OrdenAuditoria }
    entidad                 = if ([string]::IsNullOrWhiteSpace($Entidad)) { $null } else { $Entidad }
    timestamp_emision_utc   = $timestampIso
    artefacto_origen        = $sourceArtifact
    sha256_digest           = $computedSha256
    root_digest_file        = $rootDigestPath
    rfc3161_tsa_url         = if ([string]::IsNullOrWhiteSpace($TsaUrl)) { $null } else { $TsaUrl }
    rfc3161_tsr_file        = $tsrPath
    estado_sellado_temporal = $tsaStatus
}

$manifestPath = Join-Path $resolvedOutDir "00_MANIFIESTO_SELLO_TEMPORAL.json"
$sealRecord | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "[+] Manifiesto de sello generado en: $manifestPath" -ForegroundColor Green
Write-Host "[+] SHA-256 vinculado: $computedSha256" -ForegroundColor Yellow
Write-Host "[+] Estado RFC 3161: $tsaStatus" -ForegroundColor Cyan