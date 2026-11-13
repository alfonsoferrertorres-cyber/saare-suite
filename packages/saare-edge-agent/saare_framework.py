# -*- coding: utf-8 -*-
"""
================================================================================
S.A.A.R.E. NATIVE EDGE AGENT L7 (SIDECAR STATELESS EN RAM + PUENTE D1)
================================================================================
Titular de los Derechos de Autor: Alfonso Ferrer Torres
Expediente de Patente Asociado: OEPM P202630603
Sello Temporal de Referencia: Safe Creative ID 2602284720315-765AHG
================================================================================
"""

import os
import sys
import json
import time
import hashlib
import argparse
import urllib.request
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from core_ms3v import MotorSeguridadCriptografica
from semantic_detox import SemanticDetoxEngine


def cargar_entorno_local() -> None:
    """Carga variables desde archivos .env locales sin dependencias externas."""
    base_dir = Path(__file__).resolve().parent
    env_files = sorted(base_dir.glob("*.env"))
    for env_path in env_files:
        try:
            for raw_line in env_path.read_text(encoding="utf-8").splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
        except Exception as exc:
            print(f"[WARN] No se pudo leer {env_path.name}: {exc}", file=sys.stderr)


cargar_entorno_local()

CONTROL_PLANE_URL = os.getenv("SAARE_CONTROL_PLANE_URL", "https://api.saare.es/api/v1/ingest-trace")
TENANT_ID = os.getenv("SAARE_TENANT_ID", "DEMO_ENTERPRISE")
LICENSE_KEY = os.getenv("SAARE_LICENSE_KEY", "")
STRICT_MODE = os.getenv("SAARE_STRICT_DETOX", "false").lower() == "true"

ALLOWED_ORIGINS = {
    "https://console.saare.es",
    "https://saare-console.pages.dev",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}

core_crypto = MotorSeguridadCriptografica(
    id_patente="OEPM P202630603",
    id_custodia="Safe Creative ID 2602284720315-765AHG",
    autor="Alfonso Ferrer Torres",
)
detox_engine = SemanticDetoxEngine(strict_block_on_threat=STRICT_MODE)


def calcular_hash_ram(contenido: str) -> str:
    """Genera la huella SHA-256 en memoria volátil sin escritura en disco (Zero-Disk)."""
    return hashlib.sha256(contenido.encode("utf-8")).hexdigest()


def sincronizar_traza_d1(
    evidence_hash: str,
    verdict: str,
    status: str,
    scenario: str,
    latency_ms: float,
    tenant_override: str = "",
) -> bool:
    """Reporta la evidencia criptográfica al Control Plane de Cloudflare para persistencia en D1."""
    target_tenant = tenant_override.strip() or TENANT_ID
    payload = json.dumps({
        "tenant_id": target_tenant,
        "evidence_hash": evidence_hash,
        "verdict": verdict,
        "scenario_id": scenario or "SEMANTIC_DETOX_L7",
        "detox_status": status,
        "latency_ms": round(latency_ms, 3),
        "source": "SAARE_NATIVE_SIDECAR",
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "X-SAARE-Agent-Version": "1.0.0-native",
    }
    if LICENSE_KEY:
        headers["Authorization"] = f"Bearer {LICENSE_KEY}"

    req = urllib.request.Request(CONTROL_PLANE_URL, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            return resp.status in (200, 201)
    except Exception as exc:
        print(f"[WARN] Telemetría D1 diferida ({exc})", file=sys.stderr)
        return False


def inspeccionar_flujo(raw_prompt: str, scenario: str = "EU_AI_ACT_L7", tenant_override: str = "") -> dict:
    """Pipeline completo: Desintoxicación -> Hashing SHA-256 -> Registro D1."""
    active_tenant = tenant_override.strip() or TENANT_ID

    if scenario == "HEALTH" or raw_prompt == "PING_HEALTH_CHECK":
        return {
            "status": "HEALTHY",
            "mode": "LOCAL_SIDECAR_RAM",
            "tenant_id": active_tenant,
            "strict_detox": STRICT_MODE,
            "patente": core_crypto.id_patente,
        }

    t0 = time.perf_counter()
    detox_res = detox_engine.detoxify(raw_prompt)
    evidence_hash = calcular_hash_ram(f"{active_tenant}:{detox_res['clean_prompt']}:{detox_res['verdict']}")
    latency_ms = (time.perf_counter() - t0) * 1000

    synced = sincronizar_traza_d1(
        evidence_hash=evidence_hash,
        verdict=detox_res["verdict"],
        status=detox_res["status"],
        scenario=scenario,
        latency_ms=latency_ms,
        tenant_override=active_tenant,
    )

    return {
        "tenant_id": active_tenant,
        "scenario": scenario,
        "verdict": detox_res["verdict"],
        "detox_status": detox_res["status"],
        "threat_detected": detox_res["threat_detected"],
        "threat_count": detox_res["threat_count"],
        "evidence_hash": evidence_hash,
        "d1_vault_synced": synced,
        "latency_ms": round(latency_ms, 3),
        "system_guardrails": detox_res["system_guardrails"],
        "clean_prompt": detox_res["clean_prompt"] if detox_res["verdict"] == "ALLOW" else None,
    }


class SaareSidecarHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self) -> None:
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS or origin.endswith(".saare-console.pages.dev"):
            self.send_header("Access-Control-Allow-Origin", origin)
        else:
            self.send_header("Access-Control-Allow-Origin", "https://console.saare.es")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-SAARE-Tenant")
        self.send_header("Access-Control-Expose-Headers", "X-SAARE-Evidence-Hash")

    def _send_json(self, status_code: int, data: dict, extra_headers: dict | None = None) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/health":
            self._send_json(200, {
                "status": "HEALTHY",
                "service": "saare-native-sidecar-l7",
                "tenant_id": TENANT_ID,
                "strict_detox": STRICT_MODE,
                "control_plane": CONTROL_PLANE_URL,
            })
            return
        self._send_json(404, {"error": "Endpoint no encontrado"})

    def do_POST(self) -> None:
        if self.path != "/api/v1/validate":
            self._send_json(404, {"error": "Endpoint no encontrado"})
            return

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0:
            self._send_json(400, {"error": "Cuerpo de petición vacío"})
            return

        raw_body = self.rfile.read(content_length).decode("utf-8", errors="replace")

        try:
            data = json.loads(raw_body)
            if not isinstance(data, dict):
                raise ValueError("El payload JSON debe ser un objeto")
            raw_prompt = str(data.get("prompt", ""))
            scenario = str(data.get("scenario", "EU_AI_ACT_L7"))
            tenant_override = str(data.get("tenant_id") or self.headers.get("X-SAARE-Tenant") or "")
        except Exception:
            self._send_json(400, {"error": "JSON inválido"})
            return

        resultado = inspeccionar_flujo(raw_prompt, scenario, tenant_override)
        http_code = 403 if resultado.get("verdict") == "DENY" else 200
        extra = {}
        if "evidence_hash" in resultado:
            extra["X-SAARE-Evidence-Hash"] = resultado["evidence_hash"]

        self._send_json(http_code, resultado, extra_headers=extra)

    def log_message(self, format: str, *args) -> None:
        return


def main() -> None:
    parser = argparse.ArgumentParser(description="S.A.A.R.E. Native Edge Agent L7")
    parser.add_argument("--audit", type=str, help="Ruta de archivo local para auditoría de integridad SHA-256")
    parser.add_argument("--port", type=int, default=8080, help="Puerto local del interceptor REST (defecto: 8080)")
    args = parser.parse_args()

    if args.audit:
        file_hash = core_crypto.calcular_hash_binario(args.audit)
        print(json.dumps({
            "file": args.audit,
            "sha256": file_hash,
            "patente": core_crypto.id_patente,
            "custodia": core_crypto.id_custodia,
        }, indent=2, ensure_ascii=False))
        sys.exit(0)

    server = ThreadingHTTPServer(("127.0.0.1", args.port), SaareSidecarHandler)
    print("=====================================================================")
    print(f"[SAARE L7 SIDECAR] Activo en http://127.0.0.1:{args.port}/api/v1/validate")
    print(f"[TENANT] {TENANT_ID} | Strict Detox: {STRICT_MODE} | Control Plane: {CONTROL_PLANE_URL}")
    print("=====================================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SAARE L7 SIDECAR] Deteniendo nodo perimetral de forma segura...")
        server.server_close()


if __name__ == "__main__":
    main()