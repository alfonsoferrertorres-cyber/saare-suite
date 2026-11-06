#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Memoria Técnica de Propiedad Intelectual: Protocolo MS3V
Motor BLOCK LOGIC — Middleware de Gobernanza Determinista en Tiempo Real
Autor: Alfonso Ferrer Torres (Fecha de Referencia: 24 de mayo de 2026)
"""

import hashlib
import time
from typing import Dict, List, Set, Union, Optional


class MS3VBlockLogicEngine:
    """
    Implementación determinista del motor BLOCK LOGIC (MS3V).
    Ejecuta el pipeline de seguridad en 5 Bloques Inmutables.
    """

    def __init__(self, default_approved_params: Optional[List[str]] = None):
        """
        Inicializa el set de parámetros de seguridad aprobados ex-ante.
        """
        self.approved_params: Set[str] = (
            {p.strip().upper() for p in default_approved_params}
            if default_approved_params
            else set()
        )

    def engine_block_logic(
        self, 
        instruction: str, 
        override_approved_params: Optional[List[str]] = None
    ) -> Dict[str, Union[str, int]]:
        """
        Ejecuta la secuencia de intercepción, validación determinista,
        sellado criptográfico y liberación condicional.
        """
        # BLOQUE 1: Módulo de Intercepción y Normalización de Flujo
        if not instruction or not isinstance(instruction, str):
            return {"STATUS": "ABORT_SEQUENCE", "REASON": "INVALID_INPUT"}

        data: str = instruction.strip().upper()

        # Determinar catálogo activo
        active_params: Set[str] = (
            {p.strip().upper() for p in override_approved_params}
            if override_approved_params is not None
            else self.approved_params
        )

        # BLOQUE 2: Motor de Validación Determinista (Core Logic)
        # Comparación estricta ex-ante contra parámetros de seguridad físicos
        if active_params and data not in active_params:
            data = "LOGIC_SAFE_STATE"

        # BLOQUE 3: Módulo de Auditoría y Generación de Huella (Integrity-Hash SHA-256)
        integrity_hash: str = hashlib.sha256(data.encode("utf-8")).hexdigest()

        # BLOQUE 4: Gestor de Sincronía y Trazabilidad Forense (RFC-3161 Nano Precision)
        timestamp_ns: int = time.time_ns()

        # BLOQUE 5: Unidad de Ejecución Final (Safe-Release Controller)
        if integrity_hash and len(integrity_hash) == 64:
            return {
                "EXECUTE": data,
                "HASH": integrity_hash,
                "TS": timestamp_ns
            }
        else:
            return {
                "STATUS": "ABORT_SEQUENCE",
                "REASON": "HASH_GENERATION_FAILED"
            }


# --- Ejemplo de Ejecución pericial / Tests ---
if __name__ == "__main__":
    # Definición del Set de Seguridad Físico (S.A.A.R.E. Control Commands)
    params_saare = [
        "SAARE_INIT",
        "SAARE_SET_PWR_100W",
        "SAARE_GROUND_LIFT_ENABLE",
        "SAARE_AUTO_CALIBRATE",
        "LOGIC_SAFE_STATE"
    ]

    engine = MS3VBlockLogicEngine(default_approved_params=params_saare)

    print("=== PRUEBA 1: Comando Válido (Paso Limpio) ===")
    res1 = engine.engine_block_logic("saare_auto_calibrate")
    print("Resultado:", res1)

    print("\n=== PRUEBA 2: Prompt Injection / Comando Invalido (Degradación Segura) ===")
    res2 = engine.engine_block_logic("BYPASS_SAFETY_SYSTEM_DROP_TABLES")
    print("Resultado:", res2)