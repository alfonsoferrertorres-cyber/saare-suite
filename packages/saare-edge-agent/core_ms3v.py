# -*- coding: utf-8 -*-
"""
================================================================================
MÓDULO CORE: ALGORITMO DE AUDITORÍA, INTEGRIDAD Y CRIPTOGRAFÍA DE TRAZABILIDAD
================================================================================
Titular de los Derechos de Autor: Alfonso Ferrer Torres
Expediente de Patente Asociado: OEPM P202630603
Sello Temporal de Referencia: Safe Creative ID 2602284720315-765AHG
================================================================================
"""

import os
import hashlib
from typing import Dict, Tuple, Optional


class MotorSeguridadCriptografica:
    """
    Núcleo algorítmico para la validación, generación de huellas SHA-256
    por bloques (4096 bytes) y control de no repudio documental.
    """

    def __init__(self, id_patente: str, id_custodia: str, autor: str):
        self.id_patente = id_patente
        self.id_custodia = id_custodia
        self.autor = autor
        self.registro_hashes: Dict[str, str] = {}

    def calcular_hash_binario(self, ruta_archivo: str) -> str:
        """Lectura segura por bloques de 4096 bytes para calcular SHA-256 sin saturar RAM."""
        if not os.path.exists(ruta_archivo):
            raise FileNotFoundError(f"Error de consistencia: El archivo {ruta_archivo} no existe.")

        sha256_engine = hashlib.sha256()
        with open(ruta_archivo, "rb") as f:
            for bloque in iter(lambda: f.read(4096), b""):
                sha256_engine.update(bloque)

        return sha256_engine.hexdigest()

    def verificar_integridad_bloque(self, ruta_archivo: str, hash_esperado: str) -> Tuple[bool, str]:
        """Contrasta la huella SHA-256 actual del archivo frente al hash maestro esperado."""
        try:
            hash_actual = self.calcular_hash_binario(ruta_archivo)
            if hash_actual == hash_esperado:
                return True, f"VERIFICACIÓN EXITOSA: Integridad absoluta. Hash: {hash_actual}"
            return False, f"ALERTA CRÍTICA: Violación de integridad. Actual: {hash_actual} != Esperado: {hash_esperado}"
        except Exception as e:
            return False, f"ERROR DE SISTEMA EN AUDITORÍA: {str(e)}"

    def registrar_bloque_maestro(self, id_bloque: str, ruta_archivo: str) -> Optional[str]:
        """Indexa y congela el hash de un activo en la matriz en memoria."""
        try:
            hash_calculado = self.calcular_hash_binario(ruta_archivo)
            self.registro_hashes[id_bloque] = hash_calculado
            return hash_calculado
        except Exception as e:
            print(f"Error al indexar bloque {id_bloque}: {str(e)}")
            return None


if __name__ == "__main__":
    core_app = MotorSeguridadCriptografica(
        id_patente="OEPM P202630603",
        id_custodia="Safe Creative ID 2602284720315-765AHG",
        autor="Alfonso Ferrer Torres",
    )
    print(f"[OK] Núcleo MS3V inicializado | Autor: {core_app.autor} | Patente: {core_app.id_patente}")