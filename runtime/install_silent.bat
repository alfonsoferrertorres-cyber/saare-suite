@echo off
chcp 65001 >nul
title SAARE AI Execution Authorization Node - Enterprise Installer (SGP 1.0)

echo ==============================================================================
echo    Despliegue de Sensor L7: SAARE Execution Guard Node (v10.0.4)
echo ==============================================================================

:: 1. Parámetros y lectura de configuración tokenizada
set "EXTENSION_ID=saareexecutionguardid"
set "AGENT_VERSION=10.0.4"
set "TARGET_DIR=%LOCALAPPDATA%\SAARE\extension"

:: Parámetros CLI opcionales
set "SAARE_BOOTSTRAP_TOKEN=%~1"
set "TENANT_DOMAIN=%~2"
set "USER_EMAIL=%~3"

:: 2. Despliegue físico de binarios en AppData Local
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\" >nul 2>&1

:: 3. Extracción de directivas desde archivo JSON si no se pasaron por CLI
if "%SAARE_BOOTSTRAP_TOKEN%"=="" (
    if exist "%TARGET_DIR%\saare_config.json" (
        echo [INFO] Detectada configuración en saare_config.json ...
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_token token apiKey bootstrap_token" "%TARGET_DIR%\saare_config.json" 2^>nul') do (
            if not defined SAARE_BOOTSTRAP_TOKEN set "SAARE_BOOTSTRAP_TOKEN=%%~a"
        )
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_tenant_domain tenant tenantDomain" "%TARGET_DIR%\saare_config.json" 2^>nul') do (
            if not defined TENANT_DOMAIN set "TENANT_DOMAIN=%%~a"
        )
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_user_email user userEmail" "%TARGET_DIR%\saare_config.json" 2^>nul') do (
            if not defined USER_EMAIL set "USER_EMAIL=%%~a"
        )
    )
)

:: Valores por defecto si faltase algún campo
if "%TENANT_DOMAIN%"=="" set "TENANT_DOMAIN=CORP_ENTERPRISE_DOMAIN"
if "%USER_EMAIL%"=="" set "USER_EMAIL=workload-operator@empresa.com"
if "%SAARE_BOOTSTRAP_TOKEN%"=="" set "SAARE_BOOTSTRAP_TOKEN=boot_sgp10_managed_enrollment"

echo [INFO] Inquilino: %TENANT_DOMAIN%
echo [INFO] Operador:  %USER_EMAIL%
echo [INFO] Token:     %SAARE_BOOTSTRAP_TOKEN:~0,12%****************

:: 4. Registro de extensión local para Google Chrome y Microsoft Edge
reg add "HKCU\Software\Google\Chrome\Extensions\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\Software\Google\Chrome\Extensions\%EXTENSION_ID%" /v "version" /t REG_SZ /d "%AGENT_VERSION%" /f >nul 2>&1

reg add "HKCU\Software\Microsoft\Edge\Extensions\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Edge\Extensions\%EXTENSION_ID%" /v "version" /t REG_SZ /d "%AGENT_VERSION%" /f >nul 2>&1

:: 5. Inyección de Políticas Administradas (GPO / Managed Storage Schema)
echo [INFO] Vinculando directivas SGP 1.0 en políticas de sistema...

:: Google Chrome (HKCU y HKLM)
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_bootstrap_token" /t REG_SZ /d "%SAARE_BOOTSTRAP_TOKEN%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "enforcement_mode" /t REG_SZ /d "FAIL_CLOSED" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "governance_protocol" /t REG_SZ /d "SGP_1.0" /f >nul 2>&1

reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_bootstrap_token" /t REG_SZ /d "%SAARE_BOOTSTRAP_TOKEN%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "enforcement_mode" /t REG_SZ /d "FAIL_CLOSED" /f >nul 2>&1
reg add "HKLM\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "governance_protocol" /t REG_SZ /d "SGP_1.0" /f >nul 2>&1

:: Microsoft Edge (HKCU y HKLM)
reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_bootstrap_token" /t REG_SZ /d "%SAARE_BOOTSTRAP_TOKEN%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "enforcement_mode" /t REG_SZ /d "FAIL_CLOSED" /f >nul 2>&1
reg add "HKCU\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "governance_protocol" /t REG_SZ /d "SGP_1.0" /f >nul 2>&1

reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_bootstrap_token" /t REG_SZ /d "%SAARE_BOOTSTRAP_TOKEN%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "enforcement_mode" /t REG_SZ /d "FAIL_CLOSED" /f >nul 2>&1
reg add "HKLM\Software\Policies\Microsoft\Edge\3rdparty\extensions\%EXTENSION_ID%\policy" /v "governance_protocol" /t REG_SZ /d "SGP_1.0" /f >nul 2>&1

echo ==============================================================================
echo [OK] Nodo de autorización perimetral aprovisionado con éxito (FAIL_CLOSED).
echo ==============================================================================
timeout /t 3 >nul
exit /b 0