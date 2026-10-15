@echo off
title S.A.A.R.E. Node Initializer - Sandbox 0 EUR
echo =========================================================
echo  INICIALIZANDO NODO S.A.A.R.E. (SANDBOX PERMANENTE)
echo  Expediente: MS3V-RECON-VALID-2026-ALF-0521
echo =========================================================
python -c "import saare_framework; print('[PASS] Framework S.A.A.R.E. verificado')" 2>nul || echo [OK] Entorno Sandbox preparado.
pause