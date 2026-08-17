@echo off
title S.A.A.R.E. Runtime - Instalador Corporativo L7
echo ============================================================
echo   S.A.A.R.E. Governance & Dual-Vault - Instalador L7
echo ============================================================
echo.
set TARGET_DIR=%LOCALAPPDATA%\SAARE\extension
echo [1/3] Creando directorio corporativo en: %TARGET_DIR%
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
echo [2/3] Desplegando archivos del nucleo L7...
xcopy /Y /E /I "saare-files\*" "%TARGET_DIR%\" >nul
echo [3/3] Extension instalada en local. Cargala en chrome://extensions
echo.
echo ============================================================
echo   INSTALACION FINALIZADA CON EXITO
echo ============================================================
pause