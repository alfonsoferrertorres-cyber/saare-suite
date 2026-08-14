param()

$keyPath = "$env:USERPROFILE\.tauri\saare.key"
if (Test-Path $keyPath) {
    $env:TAURI_SIGNING_PRIVATE_KEY = Get-Content $keyPath -Raw
    $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "7319"
}

Write-Host "--- 1. Compilando aplicación Tauri (Windows) ---" -ForegroundColor Cyan
npx tauri build

$sigPath = "src-tauri\target\release\bundle\nsis\saare_0.1.1_x64-setup.exe.sig"
$jsonPath = "public\downloads\latest.json"

if (Test-Path $sigPath) {
    Write-Host "--- 2. Extrayendo firma criptográfica Ed25519 ---" -ForegroundColor Yellow
    $signature = Get-Content $sigPath -Raw

    $latest = Get-Content $jsonPath | ConvertFrom-Json
    $latest.platforms.'windows-x86_64'.signature = $signature.Trim()
    $latest.pub_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $latest | ConvertTo-Json -Depth 5 | Set-Content $jsonPath -Encoding UTF8
    
    Write-Host "--- 3. Manifiesto latest.json actualizado con éxito ---" -ForegroundColor Green
} else {
    Write-Host "¡ALERTA! No se encontró el archivo .sig en la ruta esperada." -ForegroundColor Red
    exit
}

# 4. Evitar copiar el binario grande dentro de public/ para no superar los 25MB de Cloudflare Pages
if (Test-Path "public\downloads\saare-setup.exe") {
    Remove-Item "public\downloads\saare-setup.exe" -Force
}

Write-Host "--- 5. Compilando Web y Desplegando Consola a Cloudflare Pages ---" -ForegroundColor Cyan
npm run build
npx wrangler pages deploy dist --project-name=saare-suite --commit-dirty=true
Write-Host "¡Despliegue de la Consola y Manifiesto de Actualización completado!" -ForegroundColor Green
