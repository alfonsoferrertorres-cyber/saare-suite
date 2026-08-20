@echo off
title S.A.A.R.E. Silent Enterprise Installer L7
echo ===================================================
echo  Instalando S.A.A.R.E. L7 Gateway de forma desatendida...
echo ===================================================

set TARGET_DIR=%LOCALAPPDATA%\SAARE\extension
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\" >nul

:: Registrar ruta en pol?ticas locales de Chrome / Edge
reg add "HKCU\Software\Google\Chrome\Extensions\saaregovernanceid" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\Software\Google\Chrome\Extensions\saaregovernanceid" /v "version" /t REG_SZ /d "3.3.0" /f >nul 2>&1

echo [OK] Agente desplegado correctamente en el sistema.
timeout /t 2 >nul
exit
