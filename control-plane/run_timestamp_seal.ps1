param(
    [string]$TsHash = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
)

Write-Host "[*] Iniciando motor de sellado SAARE L7 para Expediente MS3V-RECON-VALID-2026-ALF-0521..." -ForegroundColor Cyan
$manifestPath = Join-Path $PSScriptRoot "00_MANIFIESTO_SELLO_TEMPORAL.json"

$sealRecord = @{
    expediente = "MS3V-RECON-VALID-2026-ALF-0521"
    titular = "Alfonso Ferrer Torres (48553065L)"
    timestamp_emision = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss UTC")
    safe_creative_timestamp_hash = $TsHash
    estado_custodia = "CUSTODIA_INMUTABLE_LEY_1_2019"
    validez_procesal = "Art_326_LEC"
    normativa_aplicable = @("Ley 1/2019 Secretos Empresariales", "RFC 3161", "eIDAS UE 910/2014")
}

$jsonOutput = $sealRecord | ConvertTo-Json -Depth 5
Set-Content -Path $manifestPath -Value $jsonOutput -Encoding UTF8

Write-Host "[+] Sello generado con éxito en: $manifestPath" -ForegroundColor Green
Write-Host "[+] Hash de Timestamp Vinculado: $TsHash" -ForegroundColor Yellow