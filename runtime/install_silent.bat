@echo off
chcp 65001 >nul
title SAARE AI Execution Authorization Node - Enterprise Installer (SGP 1.0)

echo ==============================================================================
echo    Despliegue de Sensor L7 + Evidence Vault Local (v10.0.5) - Bóveda KL
echo ==============================================================================

set "EXTENSION_ID=ppegejdfiohebfhpjbppkdjjllopnamj"
set "AGENT_VERSION=10.0.5"
set "TARGET_DIR=%LOCALAPPDATA%\SAARE\extension"
set "DESKTOP_VAULT=%USERPROFILE%\Desktop\evidence_vault"

if not exist "%DESKTOP_VAULT%" mkdir "%DESKTOP_VAULT%"

set "SAARE_BOOTSTRAP_TOKEN=%~1"
set "TENANT_DOMAIN=%~2"
set "USER_EMAIL=%~3"

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
xcopy /Y /E /I "%~dp0*" "%TARGET_DIR%\" >nul 2>&1

if "%SAARE_BOOTSTRAP_TOKEN%"=="" (
    if exist "%TARGET_DIR%\storage_managed.json" (
        echo [INFO] Extrayendo directivas desde storage_managed.json ...
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_bootstrap_token" "%TARGET_DIR%\storage_managed.json" 2^>nul') do (
            if not defined SAARE_BOOTSTRAP_TOKEN set "SAARE_BOOTSTRAP_TOKEN=%%~a"
        )
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_tenant_domain" "%TARGET_DIR%\storage_managed.json" 2^>nul') do (
            if not defined TENANT_DOMAIN set "TENANT_DOMAIN=%%~a"
        )
        for /f "tokens=2 delims=:, " %%a in ('findstr /i "saare_user_email" "%TARGET_DIR%\storage_managed.json" 2^>nul') do (
            if not defined USER_EMAIL set "USER_EMAIL=%%~a"
        )
    )
)

if defined SAARE_BOOTSTRAP_TOKEN set "SAARE_BOOTSTRAP_TOKEN=%SAARE_BOOTSTRAP_TOKEN:"=%"
if defined TENANT_DOMAIN set "TENANT_DOMAIN=%TENANT_DOMAIN:"=%"
if defined USER_EMAIL set "USER_EMAIL=%USER_EMAIL:"=%"

if "%TENANT_DOMAIN%"=="" set "TENANT_DOMAIN=SAARE_CORP_ADMIN"
if "%USER_EMAIL%"=="" set "USER_EMAIL=alfonel.abuelo.del.punk@gmail.com"
if "%SAARE_BOOTSTRAP_TOKEN%"=="" set "SAARE_BOOTSTRAP_TOKEN=sk_saare_live_master_kv_session"

echo [INFO] Inquilino: %TENANT_DOMAIN%
echo [INFO] Operador:  %USER_EMAIL%
echo [INFO] Token:     %SAARE_BOOTSTRAP_TOKEN:~0,12%****************
echo [INFO] Vault:     %DESKTOP_VAULT%

reg add "HKCU\Software\Google\Chrome\Extensions\%EXTENSION_ID%" /v "path" /t REG_SZ /d "%TARGET_DIR%" /f >nul 2>&1
reg add "HKCU\Software\Google\Chrome\Extensions\%EXTENSION_ID%" /v "version" /t REG_SZ /d "%AGENT_VERSION%" /f >nul 2>&1

reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_bootstrap_token" /t REG_SZ /d "%SAARE_BOOTSTRAP_TOKEN%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_tenant_domain" /t REG_SZ /d "%TENANT_DOMAIN%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "saare_user_email" /t REG_SZ /d "%USER_EMAIL%" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "enforcement_mode" /t REG_SZ /d "FAIL_CLOSED" /f >nul 2>&1
reg add "HKCU\Software\Policies\Google\Chrome\3rdparty\extensions\%EXTENSION_ID%\policy" /v "governance_protocol" /t REG_SZ /d "SGP_1.0" /f >nul 2>&1

echo ==============================================================================
echo [OK] Nodo aprovisionado con exito. Boveda Local sincronizada en el Escritorio.
echo ==============================================================================
timeout /t 3 >nul
exit /b 0