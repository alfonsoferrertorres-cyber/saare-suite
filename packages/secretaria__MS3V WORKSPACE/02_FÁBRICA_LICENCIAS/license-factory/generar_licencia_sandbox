# -*- coding: utf-8 -*-
"""
Generador de Licencias Sandbox 0 € (Acceso Permanente / Ilimitado)
Secretaría S.A.A.R.E. MS3V - Expediente MS3V-RECON-VALID-2026-ALF-0521
"""
import json, sys, os
from datetime import datetime

def crear_licencia_sandbox(nombre_cliente: str) -> dict:
    return {
        "$schema": "https://saare.es/schemas/license-v1.json",
        "expediente": "MS3V-RECON-VALID-2026-ALF-0521",
        "issued_to": nombre_cliente,
        "tier": "SANDBOX",
        "price_eur": 0,
        "expires_at": None,  # Acceso ilimitado sin caducidad de 7 días
        "unlimited_trial": True,
        "issued_at": datetime.utcnow().isoformat() + "Z",
        "features": [
            "L7_INTERCEPTION",
            "AUDIT_VAULT",
            "ISO42001_COMPLIANCE",
            "ZERO_DISK_RAM"
        ],
        "verdict": "PERMANENT_SANDBOX_GRANTED"
    }

if __name__ == "__main__":
    cliente = sys.argv[1] if len(sys.argv) > 1 else "CLIENTE_EVALUACION"
    lic = crear_licencia_sandbox(cliente)
    
    out_dir = os.path.join(os.path.dirname(__file__), "LICENCIAS_CONCEDIDAS")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, f"{cliente}_sandbox.json")
    
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(lic, f, indent=2, ensure_ascii=False)
        
    print(f"[OK] Licencia Sandbox 0 € (Permanente) generada para '{cliente}' en: {out_file}")