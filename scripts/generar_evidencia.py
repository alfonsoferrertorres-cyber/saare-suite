import os
import hashlib
from datetime import datetime
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

def generar_evidencia_completa():
    print("=== [1/4] Generando Traza Saneada L7 ===")
    log_content = (
        f"[TIMESTAMP] {datetime.utcnow().isoformat()}Z\n"
        "[EVENT] L7_PERIMETER_INTERCEPTION\n"
        "[STATUS] 403_FORBIDDEN_AST_INJECTION_BLOCKED\n"
        "[LATENCY_US] 840\n"
        "[RAM_PURGE] 0x00_CLEARED\n"
    )
    with open("traza_saneada.log", "w", encoding="utf-8") as f:
        f.write(log_content)
    print("Traza saneada guardada en traza_saneada.log")

    print("\n=== [2/4] Calculando Huella SHA-256 (Root Digest) ===")
    sha256 = hashlib.sha256(log_content.encode('utf-8')).hexdigest()
    print(f"Root Digest SHA-256: {sha256.upper()}")
    
    os.makedirs("saare_evidence_vault", exist_ok=True)
    with open("saare_evidence_vault/root_digest.sha256", "w", encoding="utf-8") as f:
        f.write(sha256.upper())

    print("\n=== [3/4] Generando Claves y Firma Ed25519 (Nativo) ===")
    # Generar par de claves Ed25519
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()

    # Guardar clave privada
    pem_private = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    with open("ms3v_signing_key.pem", "wb") as f:
        f.write(pem_private)

    # Guardar clave pública
    pem_public = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    with open("ms3v_public_key.pem", "wb") as f:
        f.write(pem_public)

    # Firmar traza
    signature = private_key.sign(log_content.encode('utf-8'))
    with open("traza_saneada.sig", "wb") as f:
        f.write(signature)
    print("Firma Ed25519 generada en traza_saneada.sig")

    print("\n=== [4/4] Verificando Integridad Pericial ===")
    try:
        public_key.verify(signature, log_content.encode('utf-8'))
        print("VERIFICACIÓN EXITOSA: La firma Ed25519 es legítima e inalterada.")
    except Exception as e:
        print(f"Error en la validación: {e}")

if __name__ == "__main__":
    generar_evidencia_completa()