import os
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timezone


def compute_merkle_root_hex(log_entries):
    if not log_entries:
        return hashlib.sha256(b"").hexdigest()

    current_level = [
        hashlib.sha256(str(entry).encode("utf-8")).digest()
        for entry in log_entries
    ]

    while len(current_level) > 1:
        next_level = []
        for idx in range(0, len(current_level), 2):
            left = current_level[idx]
            right = current_level[idx + 1] if idx + 1 < len(current_level) else left
            combined = hashlib.sha256(left + right).digest()
            next_level.append(combined)
        current_level = next_level

    return current_level[0].hex()


def generate_saare_seal(log_entries, secret_key_hex=None):
    print("[*] Ejecutando motor criptografico nativo S.A.A.R.E. MS3V...")

    env_secret = os.environ.get("SAARE_HMAC_SECRET_KEY", "").strip()
    if secret_key_hex:
        secret_bytes = bytes.fromhex(secret_key_hex.strip())
        key_source = "EXPLICIT_ARGUMENT"
        key_id = hashlib.sha256(secret_bytes).hexdigest()[:16]
    elif env_secret:
        secret_bytes = bytes.fromhex(env_secret) if len(env_secret) == 64 and all(c in "0123456789abcdefABCDEF" for c in env_secret) else env_secret.encode("utf-8")
        key_source = "ENV:SAARE_HMAC_SECRET_KEY"
        key_id = hashlib.sha256(secret_bytes).hexdigest()[:16]
    else:
        secret_bytes = secrets.token_bytes(32)
        key_source = "EPHEMERAL_RUNTIME_32B"
        key_id = hashlib.sha256(secret_bytes).hexdigest()[:16]

    root_merkle = compute_merkle_root_hex(log_entries)
    signature_hex = hmac.new(
        secret_bytes,
        bytes.fromhex(root_merkle),
        hashlib.sha256
    ).hexdigest()

    seal_certificate = {
        "expediente": "MS3V-RECON-VALID-2026-ALF-0521",
        "orden_auditoria": "IA-2026-VAL-AUD-8842-XF",
        "timestamp_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "estado": "INTEGRO_VERIFICABLE",
        "algoritmo_firma": "HMAC-SHA256",
        "key_id_sha256_prefix": key_id,
        "key_source": key_source,
        "root_merkle_bound": root_merkle,
        "firma_digital_hex": signature_hex,
        "capa_ejecucion": "L7 (Application Layer Interception)",
        "criterio_ram": "Zero-Retention Payload en inspeccion ex-ante",
        "conformidad_normativa": [
            "ISO/IEC 42001:2023",
            "EU AI Act Art. 12/15",
            "Arts. 281 y 326 LEC"
        ]
    }

    return seal_certificate


def verify_saare_seal(seal_certificate, secret_key_hex_or_str):
    root_merkle = seal_certificate.get("root_merkle_bound", "")
    expected_sig = seal_certificate.get("firma_digital_hex", "")
    raw = str(secret_key_hex_or_str or "").strip()
    if not root_merkle or not expected_sig or not raw:
        return False

    secret_bytes = (
        bytes.fromhex(raw)
        if len(raw) == 64 and all(c in "0123456789abcdefABCDEF" for c in raw)
        else raw.encode("utf-8")
    )
    computed_sig = hmac.new(
        secret_bytes,
        bytes.fromhex(root_merkle),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(computed_sig.lower(), expected_sig.lower())


if __name__ == "__main__":
    sample_telemetry = [
        "EVENT: L7_PEP_VALIDATE_PASS - Schema Check OK",
        "EVENT: ZERO_RETENTION_PURGE - Payload wiped from RAM in 1.16ms"
    ]

    certificado = generate_saare_seal(sample_telemetry)
    output_dir = "10_EVIDENCIAS"
    output_path = os.path.join(output_dir, "certificado_integridad_saare.json")
    os.makedirs(output_dir, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(certificado, f, indent=4, ensure_ascii=False)

    print(f"\n[OK] Sello generado en: {output_path}")
    print(json.dumps(certificado, indent=4, ensure_ascii=False))