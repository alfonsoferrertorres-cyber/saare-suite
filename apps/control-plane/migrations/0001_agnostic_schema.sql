CREATE TABLE IF NOT EXISTS evidences (
  id VARCHAR(64) PRIMARY KEY,
  verdict_id VARCHAR(64) NOT NULL,
  evidence_id VARCHAR(64) NOT NULL,
  tenant_id VARCHAR(64) NOT NULL,
  decision VARCHAR(16) NOT NULL,
  payload_hash VARCHAR(64) NOT NULL,
  ed25519_signature TEXT NOT NULL,
  created_at VARCHAR(32) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_evidences_tenant ON evidences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evidences_verdict ON evidences(verdict_id);
