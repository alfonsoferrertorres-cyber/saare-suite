$ErrorActionPreference = "SilentlyContinue"
$targetDir = "$env:LOCALAPPDATA\SAARE\Extension"

# Crear directorio de destino
if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }

# Extraer y copiar archivos de la extensión
$sourceFiles = Join-Path $PSScriptRoot "saare-files"
if (Test-Path $sourceFiles) {
    Copy-Item -Path "$sourceFiles\*" -Destination $targetDir -Recurse -Force
}

# Notificación al usuario
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.MessageBox]::Show("S.A.A.R.E. AI Runtime Interceptor se ha instalado correctamente en su equipo.`n`nEndpoint Cloud: https://console.saare.es/api", "S.A.A.R.E. Governance Suite", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
