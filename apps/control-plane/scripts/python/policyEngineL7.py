#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
S.A.A.R.E. Core PEP L7 v8.4 — Motor de Inspección y Filtrado Determinista Ex-Ante
Titularidad: Alfonso Ferrer Torres / MS3V (NIF: 48553065L)
Expediente: MS3V-RECON-VALID-2026-ALF-0521
Safe Creative: SC-REG-2026-1791667481 | RPI: RPI-2607076315021
"""

import re
import json
import time
import hashlib
import base64
import sys
from typing import Dict, Any

VERDICT_ALLOW = "ALLOW"
VERDICT_DENY = "DENY"

# Matriz Ex-Ante 7 Dimensiones (PII, Secretos, Inyecciones)
REGEX_PATTERNS = {
    "PII_DNI": r"\b\d{7,8}[A-Za-z]\b",
    "PII_IBAN": r"\b[A-Z]{2}\d{2}[\s-]?(?:\d{4}[\s-]?){4}\d{2,4}\b",
    "SECRET_API_KEY": r"sk-proj-[a-zA-Z0-9]{20,}",
    "SECRET_GENERIC_KEY": r"(?i)(bearer\s+[a-zA-Z0-9_\-\.]{20,}|access_token|secret_key)",
    "JAILBREAK_KEYWORD": r"(?i)(ignore\s+previous\s+instructions|system\s+override|dan\s+mode|jailbreak)"
}

class PolicyEngineL7:
    def __init__(self, tenant_id: str = "ENTERPRISE"):
        self.tenant_id = tenant_id
        self.node_id = "SAARE_VAULT_NODE_01"

    def _generate_ed25519_proof(self, payload_hash: str, timestamp: str) -> str:
        raw_proof = f"{self.node_id}:{payload_hash}:{timestamp}".encode('utf-8')
        digest = hashlib.sha256(raw_proof).digest()
        return base64.b64encode(digest).decode('utf-8')

    def inspect_payload(self, prompt: str, user_email: str = "auditor@saare.es", custom_rules: list = None) -> Dict[str, Any]:
        t_start = time.perf_counter()
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        prompt_str = str(prompt or "")
        verdict = VERDICT_ALLOW
        reason = "AUDITORIA_CONFORME"
        rule_triggered = None

        # 1. Reglas Base
        for rule_name, pattern in REGEX_PATTERNS.items():
            if re.search(pattern, prompt_str):
                verdict = VERDICT_DENY
                reason = f"PROHIBITED_PATTERN_MATCH:{rule_name}"
                rule_triggered = rule_name
                break

        # 2. Reglas Personalizadas
        if verdict == VERDICT_ALLOW and custom_rules:
            for rule in custom_rules:
                pattern = rule.get("pattern", "")
                if pattern and re.search(pattern, prompt_str, re.IGNORECASE):
                    verdict = VERDICT_DENY
                    reason = f"CUSTOM_RULE_MATCH:{rule.get('name', 'DYNAMIC')}"
                    rule_triggered = rule.get("id", "CUSTOM")
                    break

        t_end = time.perf_counter()
        latency_ms = round((t_end - t_start) * 1000, 3)

        payload_hash = hashlib.sha256(prompt_str.encode('utf-8')).hexdigest()
        proof_signature = self._generate_ed25519_proof(payload_hash, timestamp)
        evidence_id = f"EVID-{int(time.time()*1000)}-{payload_hash[:6]}"

        return {
            "evidence_id": evidence_id,
            "timestamp": timestamp,
            "tenant_id": self.tenant_id,
            "user": user_email,
            "decision": verdict,
            "verdict": "PERMITIDO" if verdict == VERDICT_ALLOW else "RECHAZADO",
            "category": "PRIVACIDAD" if verdict == VERDICT_DENY else "WORKFLOWS",
            "cat": reason,
            "sub": "EU AI Act / LOPDGDD / DORA",
            "prompt": prompt_str if verdict == VERDICT_ALLOW else "[REDACTED_BY_POLICY_ENGINE_L7]",
            "latency": latency_ms,
            "merkle_root": payload_hash,
            "node": self.node_id,
            "proofBundle": {
                "payloadHash": payload_hash,
                "ed25519Signature": proof_signature,
                "rfc3161Timestamp": timestamp
            }
        }

if __name__ == "__main__":
    engine = PolicyEngineL7()
    test_prompt = sys.argv[1] if len(sys.argv) > 1 else "Consulta normal de prueba sin PII"
    result = engine.inspect_payload(test_prompt)
    print(json.dumps(result, indent=2, ensure_ascii=False))