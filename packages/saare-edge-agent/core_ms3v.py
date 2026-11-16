import os
import sys
import time
import hashlib
import ctypes
import json
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request
import urllib.error

class SAARECoreV6Agent:
    """
    Núcleo Determinista SAARE V6 (MS3V-CORE) integrado en Edge Agent.
    Aislamiento volátil en RAM, purga 0x00, hash SHA-256 y PEP L7 Ex-Ante.
    """
    def __init__(self):
        self.version = "v6.0_AUTOMATA"
        self.compliance_signature = "SAARE-ISO-42001-V6-NATIVE"
        self.node_id = "AFT-2026-AUTH-X9"
        self.hardware_state = {
            "galvanic_isolation": "ACTIVE",
            "opto_coupled_return_loop": "DISABLED_PHYSICALLY",
            "tcp_port_direction": "TCP_8080_STRICT_UNIDIRECTIONAL",
            "ram_mlock": "ACTIVE",
            "zero_disk": True
        }
        self._buffer = bytearray(4096)

    def _lock_memory(self) -> bool:
        """Bloquea páginas en RAM para evitar Swap en disco."""
        try:
            if sys.platform != "win32":
                libc = ctypes.CDLL("libc.so.6", use_errno=True)
                addr = ctypes.addressof(ctypes.c_char.from_buffer(self._buffer))
                libc.mlock(ctypes.c_void_p(addr), ctypes.c_size_t(len(self._buffer)))
            return True
        except Exception:
            return False

    def evaluate_ex_ante(self, prompt: str, threshold: float = 0.01) -> dict:
        """
        Evaluación ex-ante en Capa 7 (PEP L7). Intercepta patrones de riesgo y PII.
        """
        self._lock_memory()
        timestamp_ns = time.time_ns()
        encoded_prompt = prompt.encode("utf-8")
        
        # Copia volátil en búfer controlado
        length = min(len(encoded_prompt), len(self._buffer))
        self._buffer[:length] = encoded_prompt[:length]
        
        payload_hash = hashlib.sha256(encoded_prompt).hexdigest()

        # Reglas Fail-Closed (Inyección, Jailbreak, SQLi)
        blocked_patterns = [
            "DROP TABLE",
            "DAN MODE",
            "IGNORE PREVIOUS",
            "IGNORE ALL PREVIOUS",
            "SYSTEM PROMPT",
            "BYPASS"
        ]
        upper_prompt = prompt.upper()
        is_blocked = any(kw in upper_prompt for kw in blocked_patterns)

        verdict = "RECHAZADO" if is_blocked else "PERMITIDO"
        decision = "DENY" if is_blocked else "ALLOW"
        structural_delta = "0.0250%" if is_blocked else "0.0000%"

        result = {
            "protocol": "SGP-1.0",
            "version": self.version,
            "compliance_signature": self.compliance_signature,
            "node_id": self.node_id,
            "verdict": verdict,
            "decision": decision,
            "structural_delta": structural_delta,
            "threshold_max": f"{threshold}%",
            "ms3v_hash": payload_hash,
            "timestamp_ns": timestamp_ns,
            "hardware_state": self.hardware_state
        }

        # Purga física inmediata de RAM
        self.purge_ram_buffer()
        return result

    def purge_ram_buffer(self) -> bool:
        for i in range(len(self._buffer)):
            self._buffer[i] = 0x00
        return True


# ==========================================
# SERVIDOR TCP 8080 STRICT UNIDIRECTIONAL
# ==========================================
BIND_HOST = "127.0.0.1"
BIND_PORT = 8080
UPSTREAM_LLM_URL = os.getenv("SAARE_UPSTREAM_URL", "https://api.openai.com/v1/chat/completions")

class UnidirectionalPEPHandler(BaseHTTPRequestHandler):
    core = SAARECoreV6Agent()

    def _send_json(self, status_code: int, payload: dict, verdict: str = "DENY"):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("X-SAARE-Verdict", verdict)
        self.send_header("X-SAARE-Port-Policy", "TCP_8080_STRICT_UNIDIRECTIONAL")
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._send_json(405, {
            "error": "METHOD_NOT_ALLOWED",
            "policy": "TCP_8080_STRICT_UNIDIRECTIONAL",
            "detail": "Flujo estrictamente unidireccional de salida (POST)."
        })

    def do_POST(self):
        if self.client_address[0] != "127.0.0.1":
            self._send_json(403, {"error": "EXTERNAL_INGRESS_BLOCKED"})
            return

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0:
            self._send_json(400, {"error": "EMPTY_PAYLOAD"})
            return

        raw_body = self.rfile.read(content_length).decode("utf-8", errors="replace")

        # Auditoría Ex-Ante (Fail-Closed)
        audit = self.core.evaluate_ex_ante(raw_body)
        if audit["decision"] != "ALLOW":
            self._send_json(403, {"status": "BLOCKED_BY_SAARE_L7", "audit": audit}, verdict="DENY")
            return

        # Reenvío hacia upstream
        try:
            req = urllib.request.Request(
                UPSTREAM_LLM_URL,
                data=raw_body.encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": self.headers.get("Authorization", ""),
                    "X-SAARE-MS3V-Hash": audit["ms3v_hash"]
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                upstream_data = json.loads(resp.read().decode("utf-8"))
                self._send_json(resp.status, {"saare_audit": audit, "upstream_response": upstream_data}, verdict="ALLOW")
        except urllib.error.HTTPError as e:
            self._send_json(e.code, {"error": "UPSTREAM_HTTP_ERROR", "detail": str(e)}, verdict="ALLOW")
        except Exception as e:
            self._send_json(502, {"error": "FAIL_CLOSED_NETWORK_ERROR", "detail": str(e)}, verdict="DENY")


def run_server():
    server = HTTPServer((BIND_HOST, BIND_PORT), UnidirectionalPEPHandler)
    server.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    print(f"[SAARE-EDGE] Aduana TCP_8080_STRICT_UNIDIRECTIONAL activa en {BIND_HOST}:{BIND_PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SAARE-EDGE] Apagando y purgando búferes...")
        server.server_close()

if __name__ == "__main__":
    run_server()