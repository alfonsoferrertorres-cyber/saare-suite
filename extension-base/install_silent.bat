@echo off
chcp 65001 >nul
title S.A.A.R.E. Silent Enterprise Installer L7

echo ===================================================
echo  Instalando S.A.A.R.E. L7 Gateway de forma desatendida...
echo ===================================================

:: 1. Parámetros de configuración corporativa dinámicos
set "EXTENSION_ID=saaregovernanceid"
set "TENANT_DOMAIN=%~1"
set "USER_EMAIL=%~2"

:: 2. Despliegue de binarios del agente en AppData Local
set "TARGET_DIR=%LOCALAPPDATA%\SAARE\extension"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\" >nul 2>&1

:: 3. Registro de extensión local para Google Chrome y Microsoft Edge
reg add "HKCU\Software\Google\Chrome\Extensions\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\Software\Google\Chrome\Extensions\%EXTENSION_ID%" /v "version" /t REG_SZ /d "8.1.0" /f >nul 2>&1

reg add "HKCU\Software\Microsoft\Edge\Extensions\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Edge\Extensions\%EXTENSION_ID%" /v "version" /t REG_SZ /d "8.1.0" /f >nul 2>&1

:: 4. Inyección de políticas corporativas (Solo si se proporcionaron credenciales)
if not "%USER_EMAIL%"=="" (
    echo [INFO] Inyectando politicas GPO para %USER_EMAIL% ...
    
    :: Google Chrome (HKCU y HKLM)
    reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
    reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
    reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
    reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1

    :: Microsoft Edge (HKCU y HKLM)
    reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
    reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
    reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
    reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
) else (
    echo [INFO] No se proporcionaron credenciales corporativas. Instalacion generica realizada.
)

echo [OK] Agente desplegado correctamente en %TARGET_DIR%.
timeout /t 3 >nul
exit /b 0