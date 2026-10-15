$scriptDir =$PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent$MyInvocation.MyCommand.Path }
if (-not $scriptDir) {$scriptDir = Get-Location }
cd $scriptDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PASO 1: SELLADO DE INTEGRIDAD DE ARCHIVOS (V4 READY)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Expediente: MS3V-RECON-VALID-2026-ALF-0521`n" -ForegroundColor Yellow

$ignoredFiles = @("hashes.sha256", "root_digest.sha256", "ROOT_MANIFEST_SEAL.json", "sellar.ps1", "verificar_cadena_custodia.ps1", "sellar_y_verificar.ps1")
$allFiles = Get-ChildItem -Path $scriptDir -Recurse -File | Where-Object { $ignoredFiles -notcontains $_.Name }

$hashEntries = @()
$sha = [System.Security.Cryptography.SHA256]::Create()

foreach ($file in $allFiles) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $hashBytes = $sha.ComputeHash($bytes)
    $hashHex = ($hashBytes | ForEach-Object { "{0:x2}" -f $_ }) -join ""
    $rel = $file.FullName.Substring($scriptDir.Length + 1)
    $hashEntries += "$hashHex  $rel"
    Write-Host "[SHA-256 OK] $rel" -ForegroundColor Green
}

$hashEntries = $hashEntries | Sort-Object
$manifestContent = ($hashEntries -join "`r`n") + "`r`n"
[System.IO.File]::WriteAllText("$scriptDir\hashes.sha256", $manifestContent, [System.Text.Encoding]::UTF8)

$manifestBytes = [System.IO.File]::ReadAllBytes("$scriptDir\hashes.sha256")
$rootDigestBytes = $sha.ComputeHash($manifestBytes)
$rootDigestHex = ($rootDigestBytes | ForEach-Object { "{0:x2}" -f $_ }) -join ""
[System.IO.File]::WriteAllText("$scriptDir\root_digest.sha256", "$rootDigestHex  hashes.sha256`r`n", [System.Text.Encoding]::UTF8)

Write-Host "`n[OK] hashes.sha256 consolidado ($($allFiles.Count) artefactos sellados)." -ForegroundColor Green
Write-Host "[ROOT DIGEST GENERADO]: $rootDigestHex`n" -ForegroundColor Yellow

# ==============================================================================
# PASO 2: VERIFICACIÓN INMEDIATA DE LA CADENA DE CUSTODIA
# ==============================================================================
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PASO 2: VERIFICACIÓN DE CADENA DE CUSTODIA (EX-ANTE)   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$hashFile = "$scriptDir\hashes.sha256"
$rootFile = "$scriptDir\root_digest.sha256"

if (-not (Test-Path $hashFile) -or -not (Test-Path $rootFile)) {
    Write-Host "[ERROR] No se encuentra el fichero de hashes o el root digest." -ForegroundColor Red
    exit
}

$errorsFound = 0
$savedHashes = @{}

Get-Content $hashFile | ForEach-Object {
    if ($_ -match "^([a-fA-F0-9]{64})\s+(.+)$") {
        $savedHashes[$matches[2].Trim()] = $matches[1].Trim()
    }
}

foreach ($file in $allFiles) {
    $rel = $file.FullName.Substring($scriptDir.Length + 1)
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $hashBytes = $sha.ComputeHash($bytes)
    $hashHex = ($hashBytes | ForEach-Object { "{0:x2}" -f $_ }) -join ""

    if ($savedHashes.ContainsKey($rel)) {
        if ($savedHashes[$rel] -eq $hashHex) {
            Write-Host "[VERIFICADO OK] $rel" -ForegroundColor Green
        } else {
            Write-Host "[ALTERADO / ERROR] $rel (El hash no coincide con el manifiesto)" -ForegroundColor Red
            $errorsFound++
        }
        $savedHashes.Remove($rel)
    } else {
        Write-Host "[NUEVO / NO INDEXADO] $rel (Archivo añadido tras el sellado)" -ForegroundColor Yellow
        $errorsFound++
    }
}

foreach ($missing in $savedHashes.Keys) {
    Write-Host "[FALTANTE] $missing (El archivo registrado ya no existe en el directorio)" -ForegroundColor Red
    $errorsFound++
}

$manifestBytes = [System.IO.File]::ReadAllBytes($hashFile)
$currentRootHex = (($sha.ComputeHash($manifestBytes)) | ForEach-Object { "{0:x2}" -f $_ }) -join ""
$expectedRootLine = Get-Content $rootFile -TotalCount 1
$expectedRootHex = $expectedRootLine.Split(" ")[0].Trim()

Write-Host "`n---------------------------------------------------"
Write-Host "Verificación de la Huella Raíz (Root Digest):" -ForegroundColor Cyan
if ($currentRootHex -eq$expectedRootHex) {
    Write-Host "[ROOT DIGEST OK] Coincide exactamente: $currentRootHex" -ForegroundColor Green
} else {
    Write-Host "[ROOT DIGEST ERROR] El manifiesto ha sido alterado." -ForegroundColor Red
    Write-Host "  Esperado:  $expectedRootHex" -ForegroundColor Yellow
    Write-Host "  Calculado: $currentRootHex" -ForegroundColor Red
    $errorsFound++
}

Write-Host "---------------------------------------------------"
if ($errorsFound -eq 0) {
    Write-Host "[INTEGRIDAD COMPROBADA] La cadena de custodia está intacta. 0 alteraciones." -ForegroundColor Green
} else {
    Write-Host "[ALERTA] Se han encontrado $errorsFound incidencias de integridad en el expediente." -ForegroundColor Red
}