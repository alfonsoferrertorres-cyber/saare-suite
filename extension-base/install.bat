@echo off
:: Configurar consola a UTF-8 para evitar caracteres extraños
chcp 65001 >nul
title SAARE Sovereign Sensor - Instalador Asistido
color 0B

:: Copiar la ruta exacta de la carpeta actual al portapapeles (sin saltos de línea)
<nul set /p="%~dp0" | clip

echo ========================================================
echo   S.A.A.R.E. L7 EX-ANTE EXECUTION GUARD - INSTALADOR
echo ========================================================
echo.
echo [INFO] Este directorio contiene los artefactos certificados del sensor.
echo [EXITO] ¡La ruta de esta carpeta se ha copiado automáticamente a tu portapapeles!
echo.
echo [PASO 1] Abra Google Chrome o Microsoft Edge.
echo [PASO 2] Escriba en la barra de direcciones: chrome://extensions/ (o edge://extensions/)
echo [PASO 3] Active la casilla "Modo de desarrollador" (arriba a la derecha).
echo [PASO 4] Haga clic en "Cargar descomprimida".
echo [PASO 5] Presione (Ctrl + V) para pegar la ruta en la ventana y haga clic en "Seleccionar carpeta".
echo.
echo ========================================================
echo Presione cualquier tecla para salir...
pause >nul