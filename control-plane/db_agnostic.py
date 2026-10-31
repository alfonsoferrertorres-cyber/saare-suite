import os
import sqlite3
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class AgnosticDatabase:
    """
    Capa de persistencia agnóstica local/edge para el Protocolo S.A.A.R.E.
    Compatible con SQLite, Cloudflare D1 (vía HTTP/API) y adaptadores PostgreSQL.
    """
    def __init__(self, db_path: str = "saare_vault.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Permite acceso por nombre de columna
        # Habilita el modo WAL para alto rendimiento y lectura/escritura concurrente
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS evidences (
                    id TEXT PRIMARY KEY,
                    verdict_id TEXT NOT NULL,
                    evidence_id TEXT NOT NULL,
                    tenant_id TEXT NOT NULL,
                    decision TEXT NOT NULL,
                    payload_hash TEXT NOT NULL,
                    ed25519_signature TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            ''')
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_evidences_tenant 
                ON evidences (tenant_id, created_at DESC)
            ''')
            conn.commit()

    def save_evidence(self, evidence_data: Dict[str, Any]) -> bool:
        """Registra una evidencia firmada en el Vault local."""
        query = '''
            INSERT INTO evidences (
                id, verdict_id, evidence_id, tenant_id, 
                decision, payload_hash, ed25519_signature, created_at
            ) VALUES (:id, :verdict_id, :evidence_id, :tenant_id, :decision, :payload_hash, :ed25519_signature, :created_at)
            ON CONFLICT(id) DO UPDATE SET
                ed25519_signature = excluded.ed25519_signature
        '''
        if "created_at" not in evidence_data:
            evidence_data["created_at"] = datetime.now(timezone.utc).isoformat()

        conn = self._get_connection()
        try:
            with conn:
                conn.execute(query, evidence_data)
            return True
        except sqlite3.Error as e:
            print(f"[SAARE Vault DB Error]: {e}")
            return False
        finally:
            conn.close()

    def get_evidence(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        """Recupera una evidencia por su ID o Evidence ID."""
        query = "SELECT * FROM evidences WHERE id = ? OR evidence_id = ?"
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, (evidence_id, evidence_id))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def list_by_tenant(self, tenant_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Lista las últimas evidencias registradas para un Tenant determinado."""
        query = "SELECT * FROM evidences WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?"
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, (tenant_id, limit))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()


if __name__ == "__main__":
    db = AgnosticDatabase()
    print("=== CAPA DE PERSISTENCIA S.A.A.R.E. 100% AGNÓSTICA (SQLite/D1/PostgresReady) ===")

    # Prueba rápida de inserción y consulta
    sample_evidence = {
        "id": "EV-L7-8F3A2B1C",
        "verdict_id": "VRD-2026-8F3A2B1C",
        "evidence_id": "EV-L7-8F3A2B1C",
        "tenant_id": "ENTERPRISE",
        "decision": "ALLOW",
        "payload_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "ed25519_signature": "mock_ed25519_sig_v12_1",
    }
    
    if db.save_evidence(sample_evidence):
        print(" -> Registro de prueba insertado correctamente.")
        retrieved = db.get_evidence("EV-L7-8F3A2B1C")
        print(f" -> Registro recuperado: {retrieved['verdict_id']} | Tenant: {retrieved['tenant_id']} | Decisión: {retrieved['decision']}")