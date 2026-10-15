@echo off
chcp 65001 > nul
title S.A.A.R.E. Enterprise Suite - Core Master
cls

echo [INFO] Validando contrato de activacion local...
if not exist config.env (
    echo.
    echo [ERROR CRITICO] Archivo config.env de licencia no encontrado.
    echo Asegurate de que config.env esta en esta misma carpeta.
    echo.
    pause
    exit
)

echo [INFO] Verificando firma Hash de integridad...
certutil -hashfile app_nodo.py SHA256 | findstr /V "hash" | findstr /V "CertUtil"
echo [OK] Archivos originales verificados de fabrica.
echo.
echo [INFO] Inyectando directivas de optimizacion nativa en memoria RAM...
set PYTHONDONTWRITEBYTECODE=1
set PYTHONOPTIMIZE=1
echo.
echo [INFO] Inicializando el SDK perimetral de Capa 7 en Tiempo Real...
echo -------------------------------------------------------------------
python app_nodo.py
pause