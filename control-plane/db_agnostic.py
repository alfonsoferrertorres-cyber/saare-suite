import os
import sqlite3

class AgnosticDatabase:
    def __init__(self, db_path="saare_vault.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
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
            conn.commit()

db = AgnosticDatabase()
print('=== CAPA DE PERSISTENCIA S.A.A.R.E. 100% AGNÓSTICA (SQLite/D1/PostgresReady) ===')
