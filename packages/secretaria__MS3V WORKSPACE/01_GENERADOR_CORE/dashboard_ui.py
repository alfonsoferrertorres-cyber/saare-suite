import os
import socket
import tkinter as tk
from dotenv import load_dotenv

# Cargar variables de entorno de configuración local
load_dotenv(dotenv_path="config.env")

class SAAREDashboard:
    def __init__(self, root):
        self.root = root
        self.root.title("S.A.A.R.E. v7.0 PRO - Panel de Telemetría Oficial")
        self.root.geometry("600x420")
        self.root.configure(bg="#f4f6f8")
        
        # Extracción de variables de identidad
        self.cliente = os.getenv("SAARE_CLIENT_NAME", "Desarrollador Autorizado")
        self.puerto = int(os.getenv("SAARE_PORT", "8080"))
        
        self.crear_interfaz()

    def crear_interfaz(self):
        # Encabezado Corporativo
        header = tk.Frame(self.root, bg="#0d233a", height=70)
        header.pack(fill="x", side="top")
        
        lbl_titulo = tk.Label(header, text="🧠 S.A.A.R.E. TELEMETRY SYSTEM", font=("Segoe UI", 14, "bold"), fg="white", bg="#0d233a")
        lbl_titulo.pack(pady=20, padx=20, side="left")
        
        # Contenedor Principal
        cuerpo = tk.Frame(self.root, bg="#ffffff", bd=1, relief="solid")
        cuerpo.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Datos del Perfil / Licenciatario
        lbl_cliente_tit = tk.Label(cuerpo, text="LICENCIATARIO COMPLIANT:", font=("Segoe UI", 10, "bold"), fg="#333333", bg="#ffffff")
        lbl_cliente_tit.pack(anchor="w", padx=20, pady=(15, 2))
        
        self.lbl_cliente_val = tk.Label(cuerpo, text=self.cliente, font=("Segoe UI", 12), fg="#e65c00", bg="#ffffff")
        self.lbl_cliente_val.pack(anchor="w", padx=20, pady=(0, 10))
        
        lbl_puerto_tit = tk.Label(cuerpo, text="SOCKET LOCAL ASIGNADO:", font=("Segoe UI", 10, "bold"), fg="#333333", bg="#ffffff")
        lbl_puerto_tit.pack(anchor="w", padx=20, pady=(0, 2))
        
        lbl_puerto_val = tk.Label(cuerpo, text=f"Puerto {self.puerto} (Loopback)", font=("Segoe UI", 11), fg="#444444", bg="#ffffff")
        lbl_puerto_val.pack(anchor="w", padx=20, pady=(0, 15))
        
        # Testigo de Estado Visual (Indicador estático)
        self.lbl_estado = tk.Label(cuerpo, text="NODO DETENIDO / ESPERANDO ESCANEO", font=("Segoe UI", 11, "bold"), fg="white", bg="#888888", width=45, height=2)
        self.lbl_estado.pack(pady=10)
        
        # EL BOTÓN DE TESTEO INTERACTIVO (Vuelve a estar activo)
        self.btn_test = tk.Button(cuerpo, text="🔍 FORZAR ESCANEO DE CAPA 7", font=("Segoe UI", 10, "bold"), fg="white", bg="#0d233a", command=self.verificar_conexion_nodo, width=30, height=1, cursor="hand2")
        self.btn_test.pack(pady=5)

    def verificar_conexion_nodo(self):
        """Verifica manualmente la disponibilidad del puerto al hacer clic."""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1.0)
        
        # Intentamos conectar al puerto local del Core
        resultado = sock.connect_ex(('127.0.0.1', self.puerto))
        sock.close()
        
        # Cambiar estados visuales
        if resultado == 0:
            self.lbl_estado.config(text="🛡️ BLINDAJE ACTIVO - MODO SEGURO", bg="#28a745") # Verde éxito
        else:
            self.lbl_estado.config(text="❌ NODO DESCONECTADO (CAPA 7 INACTIVA)", bg="#dc3545") # Rojo fallo

if __name__ == "__main__":
    root = tk.Tk()
    app = SAAREDashboard(root)
    root.mainloop()