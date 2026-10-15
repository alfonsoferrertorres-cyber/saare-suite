$scriptDir = Split-Path -Parent$MyInvocation.MyCommand.Path
cd $scriptDir

Write-Host "=== VERIFICANDO CADENA DE CUSTODIA (EX-ANTE V4) ===" -ForegroundColor Cyan
Write-Host "Expediente: MS3V-RECON-VALID-2026-ALF-0521`n" -ForegroundColor Yellow

$hashFile = "$scriptDir\hashes.sha256"
$rootFile = "$scriptDir\root_digest.sha256"

if (-not (Test-Path $hashFile) -or -not (Test-Path $rootFile)) {
    Write-Host "[ERROR] No se encuentra el fichero de hashes o el root digest. Ejecute primero el script de sellado." -ForegroundColor Red
    exit
}

$ignoredFiles = @("hashes.sha256", "root_digest.sha256", "ROOT_MANIFEST_SEAL.json", "verificar_cadena_custodia.ps1", "sellar.ps1")
$allFiles = Get-ChildItem -Path $scriptDir -Recurse -File | Where-Object { $ignoredFiles -notcontains $_.Name }

$sha = [System.Security.Cryptography.SHA256]::Create()
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
    $hashHex = (($sha.ComputeHash($bytes)) | ForEach-Object { "{0:x2}" -f $_ }) -join ""

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
    Write-Host "[ROOT DIGEST ERROR] El manifiesto ha sido alterado o no coincide." -ForegroundColor Red
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