# saare_framework.py — Framework de Auditoría y Validación de Licencias S.A.A.R.E. (SGP 1.0)
import os
import json
from datetime import datetime

def parse_license_file(file_path: str) -> dict:
    """Lee y parsea licencias en formato JSON o archivo .lic (key-value INI)."""
    if not os.path.exists(file_path):
        return {}

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            
        if content.startswith("{"):
            return json.loads(content)
        
        # Parseo de archivos .lic (KEY=VALUE)
        lic_data = {}
        for line in content.splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                lic_data[k.strip().lower()] = v.strip()
        return lic_data
    except Exception as e:
        print(f"[SAARE Framework Warning] Error al leer archivo de licencia: {e}")
        return {}


def verify_license_validity(license_input) -> dict:
    """
    Valida el estado de la licencia.
    Soporta licencias de pago con fecha ISO y licencias Sandbox 0 € / Perpetuas sin caducidad.
    """
    if isinstance(license_input, str):
        lic_data = parse_license_file(license_input)
    elif isinstance(license_input, dict):
        lic_data = license_input
    else:
        lic_data = {}

    tier = str(lic_data.get("tier") or lic_data.get("TIER") or "SANDBOX").upper()
    expires_at = lic_data.get("expires_at") if "expires_at" in lic_data else lic_data.get("EXPIRES_AT")

    # Evaluación de Sandbox o Licencia Perpetua (sin límite de caducidad)
    is_perpetual = (
        expires_at is None or
        str(expires_at).strip().upper() in ["PERPETUAL", "PERPETUAL_LICENSE", "NULL", "NEVER", "UNLIMITED", "NONE"] or
        tier == "SANDBOX"
    )

    if is_perpetual:
        return {
            "valid": True,
            "status": "ACTIVE",
            "tier": tier,
            "price_eur": 0 if tier == "SANDBOX" else lic_data.get("price_eur", 0),
            "expires_at": None,
            "days_remaining": "∞ (Permanente)",
            "unlimited": True,
            "message": f"Licencia {tier} activa en modo permanente"
        }

    # Lógica de cálculo de fecha para licencias temporales con expiración programada
    try:
        exp_date = datetime.fromisoformat(str(expires_at).replace("Z", "+00:00"))
        now = datetime.now(exp_date.tzinfo)
        days_left = (exp_date - now).days

        if days_left < 0:
            return {
                "valid": False,
                "status": "EXPIRED",
                "tier": tier,
                "days_remaining": 0,
                "message": "Licencia expirada"
            }

        return {
            "valid": True,
            "status": "ACTIVE",
            "tier": tier,
            "days_remaining": days_left,
            "message": f"Licencia activa ({days_left} días restantes)"
        }
    except Exception:
        # Fallback de seguridad Fail-Safe a modo Sandbox activo
        return {
            "valid": True,
            "status": "ACTIVE",
            "tier": "SANDBOX",
            "days_remaining": "∞ (Permanente)",
            "unlimited": True,
            "message": "Modo Sandbox asignado por defecto"
        }