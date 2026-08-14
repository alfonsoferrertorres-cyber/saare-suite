Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   SAARE PLATFORM - DEMO INTEGRADA L7 & DLP IA    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Arrancar Control Plane (3001)
Start-Process powershell -ArgumentList "-NoExit -Command "Set-Location 'C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO\control-plane'; npm start""

# 2. Arrancar Consola SOC (5173)
Start-Process powershell -ArgumentList "-NoExit -Command "Set-Location 'C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO\saare-console'; npm run dev -- --port 5173""

# 3. Arrancar Tienda Suite (5174)
Start-Process powershell -ArgumentList "-NoExit -Command "Set-Location 'C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO\saare-suite'; npm run dev -- --port 5174""

Write-Host "
Servicios iniciando..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 4. Abrir navegadores
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5174"

Write-Host "
Entorno desplegado correctamente." -ForegroundColor Green
