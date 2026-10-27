import subprocess
import os
import sys

# Obtener directorio raíz de forma dinámica (relativa)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONSOLE_DIR = os.path.join(BASE_DIR, "saare-console")

print("[S.A.A.R.E.] Iniciando entorno agnóstico L7...")

# Arrancar Backend Python (Nodo L7)
backend_process = subprocess.Popen(
    [sys.executable, os.path.join(BASE_DIR, "saare_l7_node.py")],
    cwd=BASE_DIR
)

# Arrancar Frontend React
npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
frontend_process = subprocess.Popen(
    [npm_cmd, "run", "dev"],
    cwd=CONSOLE_DIR
)

try:
    backend_process.wait()
    frontend_process.wait()
except KeyboardInterrupt:
    print("\n[S.A.A.R.E.] Deteniendo nodos...")
    backend_process.terminate()
    frontend_process.terminate()