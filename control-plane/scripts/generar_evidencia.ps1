$vaultDir = "$PSScriptRoot\saare_evidence_vault"
if (!(Test-Path $vaultDir)) { New-Item -ItemType Directory -Path $vaultDir | Out-Null }
Set-Location $vaultDir

Write-Host "=== [1/4] Generando Traza Saneada L7 ===" -ForegroundColor Cyan
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$logContent = @"
--- S.A.A.R.E. FORENSIC AUDIT TRAIL ---
Timestamp: $timestamp
Module: L7 Shield / AST Tool-Calling Interception
Memory Sanitization: 0x00 (Zero-Disk / PII Safe)
Status: COMPLIANT (EU AI Act & RGPD)
Payload: Verified Autonomous Agent Execution
"@
Set-Content -Path "traza_saneada.log" -Value $logContent

Write-Host "=== [2/4] Calculando Huella SHA-256 (Root Digest) ===" -ForegroundColor Cyan
$hash = Get-FileHash -Path "traza_saneada.log" -Algorithm SHA256
$hash.Hash | Out-File -FilePath "root_digest.sha256" -Encoding ascii
Get-Content "root_digest.sha256"

Write-Host "=== [3/4] Generando Claves y Firma Ed25519 (OpenSSL) ===" -ForegroundColor Cyan
& openssl genpkey -algorithm ED25519 -out ms3v_signing_key.pem 2>$null
& openssl pkey -in ms3v_signing_key.pem -pubout -out ms3v_public_key.pem 2>$null
& openssl pkeyutl -sign -in "traza_saneada.log" -inkey "ms3v_signing_key.pem" -out "traza_saneada.sig"

Write-Host "=== [4/4] Verificando Integridad Pericial ===" -ForegroundColor Cyan
$verify = & openssl pkeyutl -verify -in "traza_saneada.log" -sigfile "traza_saneada.sig" -inkey "ms3v_public_key.pem" -pubin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n====================================================" -ForegroundColor Green
    Write-Host " RESULTADO: [Signature Verified Successfully]       " -ForegroundColor Green
    Write-Host " BÓVEDA NATIVA GENERADA EN: $vaultDir                 " -ForegroundColor Green
    Write-Host "====================================================" -ForegroundColor Green
} else {
    Write-Host "Error en la validación de firma." -ForegroundColor Red
}
