@echo off
title S.A.A.R.E. L7 - Instalador Forzado de Extension
color 0B
echo ============================================================
echo   S.A.A.R.E. L7 - INSTALACION FORZADA EN GOOGLE CHROME
echo ============================================================
echo.

:: 1. Cerrar procesos de Chrome para evitar bloqueos
echo [*] Cerrando instancias de Chrome...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: 2. Configurar arranque forzado de la extension en Chrome
echo [*] Vinculando extension desde: C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO\saare-extension
start chrome.exe --load-extension="C:\Users\alfon\Desktop\CLOUD_ISV_DESARROLLO_AGOSTO\saare-extension" --no-first-run --restore-last-session "https://gemini.google.com" "https://console.saare.es"

echo.
echo ============================================================
echo   [OK] EXTENSION CARGADA E INICIADA CORRECTAMENTE
echo ============================================================
pause
