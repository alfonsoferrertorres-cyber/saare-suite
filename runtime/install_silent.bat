@echo off
chcp 65001 >nul
title S.A.A.R.E. AI Governance Node - Tokenized Enterprise Installer (SGP 1.0)

echo ==============================================================================
echo   Despliegue de Nodo Tokenizado: S.A.A.R.E. Governance Judge (v10.0)
echo ==============================================================================

:: 1. Parámetros y lectura de configuración tokenizada
set "EXTENSION_ID=saaregovernanceid"
set "AGENT_VERSION=10.0.0"
set "TARGET_DIR=%LOCALAPPDATA%\SAARE\extension"

:: Si se pasan por parámetro se usan, sino se leen de saare_config.json
set "SAARE_API_KEY=%~1"
set "TENANT_DOMAIN=%~2"
set "USER_EMAIL=%~3"

:: 2. Despliegue físico de binarios en AppData Local
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\" >nul 2>&1

:: 3. Extracción de token desde archivo JSON si no se pasó por CLI
if "%SAARE_API_KEY%"=="" (
    if exist "%TARGET_DIR%\saare_config.json" (
        echo [INFO] Detectada configuracion tokenizada en saare_config.json ...
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "token apiKey saare_api_key" "%TARGET_DIR%\saare_config.json" 2^>nul') do (
            if not defined SAARE_API_KEY set "SAARE_API_KEY=%%~a"
        )
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "tenant tenantName saare_tenant_domain" "%TARGET_DIR%\saare_config.json" 2^>nul') do (
            if not defined TENANT_DOMAIN set "TENANT_DOMAIN=%%~a"
        )
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "email user saare_user_email" "%TARGET_DIR%\saare_config.json" 2^>nul') do (
            if not defined USER_EMAIL set "USER_EMAIL=%%~a"
        )
    )
)

:: Valores por defecto si faltase algún campo
if "%TENANT_DOMAIN%"=="" set "TENANT_DOMAIN=SAARE Enterprise Organization"
if "%USER_EMAIL%"=="" set "USER_EMAIL=node-auditor@saare.es"
if "%SAARE_API_KEY%"=="" set "SAARE_API_KEY=sk_saare_live_token_unassigned"

echo [INFO] Inquilino: %TENANT_DOMAIN%
echo [INFO] Operador:  %USER_EMAIL%
echo [INFO] Token:     %SAARE_API_KEY:~0,12%****************

:: 4. Registro de extensión local para Google Chrome y Microsoft Edge
reg add "HKCU\Software\Google\Chrome\Extensions\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\Software\Google\Chrome\Extensions\%EXTENSION_ID%" /v "version" /t REG_SZ /d "%AGENT_VERSION%" /f >nul 2>&1

reg add "HKCU\Software\Microsoft\Edge\Extensions\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Edge\Extensions\%EXTENSION_ID%" /v "version" /t REG_SZ /d "%AGENT_VERSION%" /f >nul 2>&1

:: 5. Inyección Segura de Políticas Tokenizadas (GPO / Managed Storage)
echo [INFO] Vinculando claves criptograficas de nodo en politicas de sistema...

:: Google Chrome (HKCU y HKLM)
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_api_key" /t REG_SZ /d "%SAARE_API_KEY%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1

reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_api_key" /t REG_SZ /d "%SAARE_API_KEY%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1

:: Microsoft Edge (HKCU y HKLM)
reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_api_key" /t REG_SZ /d "%SAARE_API_KEY%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1

reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_api_key" /t REG_SZ /d "%SAARE_API_KEY%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1

echo ==============================================================================
echo [OK] Nodo de gobernanza aprovisionado y tokenizado con exito.
echo ==============================================================================
timeout /t 3 >nul
exit /b 0