import os
import sys
import json
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request
import urllib.error

# Añadir packages/ms3v-core al path para importar SAARECoreV6
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MS3V_CORE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "ms3v-core"))
if MS3V_CORE_DIR not in sys.path:
    sys.path.insert(0, MS3V_CORE_DIR)

from saare_core_v6 import SAARECoreV6

BIND_HOST = "127.0.0.1"  # Bloqueo estricto de tráfico entrante externo
BIND_PORT = 8080
UPSTREAM_LLM_URL = os.getenv("SAARE_UPSTREAM_URL", "https://api.openai.com/v1/chat/completions")


class UnidirectionalPEPHandler(BaseHTTPRequestHandler):
    core = SAARECoreV6()

    def _send_json(self, status_code: int, payload: dict, verdict: str = "DENY"):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("X-SAARE-Verdict", verdict)
        self.send_header("X-SAARE-Port-Policy", "TCP_8080_STRICT_UNIDIRECTIONAL")
        self.send_header("Connection", "close")  # Cierre inmediato: sin lazo de retorno persistente
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        # Rechazar cualquier petición entrante de lectura/sondeo externo
        self._send_json(405, {
            "error": "METHOD_NOT_ALLOWED",
            "policy": "TCP_8080_STRICT_UNIDIRECTIONAL",
            "detail": "Flujo estrictamente unidireccional de salida (POST)."
        })

    def do_POST(self):
        # Verificar origen estrictamente local
        client_ip = self.client_address[0]
        if client_ip != "127.0.0.1":
            self._send_json(403, {"error": "EXTERNAL_INGRESS_BLOCKED", "ip": client_ip})
            return

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0:
            self._send_json(400, {"error": "EMPTY_PAYLOAD"})
            return

        raw_body = self.rfile.read(content_length).decode("utf-8", errors="replace")

        # 1. Auditoría Ex-Ante en RAM (Fail-Closed)
        audit = self.core.evaluate_ex_ante(raw_body)
        if audit["decision"] != "ALLOW":
            self._send_json(403, {
                "status": "BLOCKED_BY_SAARE_L7",
                "audit": audit
            }, verdict="DENY")
            return

        # 2. Reenvío unidireccional saliente hacia el proveedor LLM
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
                self._send_json(resp.status, {
                    "saare_audit": audit,
                    "upstream_response": upstream_data
                }, verdict="ALLOW")
        except urllib.error.HTTPError as e:
            self._send_json(e.code, {"error": "UPSTREAM_HTTP_ERROR", "detail": str(e)}, verdict="ALLOW")
        except Exception as e:
            # Fail-Closed ante cualquier fallo de red
            self._send_json(502, {"error": "FAIL_CLOSED_NETWORK_ERROR", "detail": str(e)}, verdict="DENY")


def start_unidirectional_gateway():
    server = HTTPServer((BIND_HOST, BIND_PORT), UnidirectionalPEPHandler)
    server.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    print(f"[SAARE-EDGE] Aduana TCP_8080_STRICT_UNIDIRECTIONAL activa en {BIND_HOST}:{BIND_PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SAARE-EDGE] Apagando aduana perimetral y purgando búferes...")
        server.server_close()


if __name__ == "__main__":
    start_unidirectional_gateway()