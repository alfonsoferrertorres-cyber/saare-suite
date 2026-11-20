-- ==============================================================================
-- S.A.A.R.E. Enterprise — Esquema de Base de Datos WORM / D1 (SGP 1.0)
-- 100% Sincronizado con worker.js
-- ==============================================================================

CREATE TABLE IF NOT EXISTS consolidated_traces (
  trace_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  final_evaluator_node TEXT NOT NULL DEFAULT 'MS3V_BLOCK_LOGIC_PEP_L7',
  final_decision TEXT NOT NULL DEFAULT 'ALLOW',
  final_action TEXT NOT NULL DEFAULT 'ALLOWED',
  execution_latency_ms REAL DEFAULT 0.0,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  prompt TEXT NOT NULL DEFAULT '',
  sanitized_payload TEXT DEFAULT '',
  verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
  anchored INTEGER DEFAULT 0,
  ms3v_hash TEXT DEFAULT '',
  ms3v_timestamp_ns TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_consolidated_traces_tenant_anchored
  ON consolidated_traces (tenant_id, anchored, timestamp);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_id TEXT UNIQUE NOT NULL,
  trace_id TEXT NOT NULL,
  verdictId TEXT NOT NULL,
  decision TEXT NOT NULL DEFAULT 'ALLOW',
  verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
  user TEXT NOT NULL DEFAULT 'anonymous',
  tenant TEXT NOT NULL DEFAULT 'DEFAULT_TENANT',
  prompt TEXT DEFAULT '',
  responseOutput TEXT DEFAULT '',
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_user
  ON runs (tenant, user, id DESC);

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'PROFESSIONAL_649',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  quota INTEGER NOT NULL DEFAULT 25000,
  expires_at TEXT,
  config_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CISO_ADMIN',
  is_verified INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_company
  ON users (company);

CREATE TABLE IF NOT EXISTS merkle_anchors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  batch_size INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_merkle_anchors_tenant
  ON merkle_anchors (tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS custom_rules (
  id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS tenant_usage (
  tenant_id TEXT NOT NULL,
  billing_period TEXT NOT NULL,
  verdict_count INTEGER DEFAULT 0,
  PRIMARY KEY (tenant_id, billing_period)
);

CREATE TABLE IF NOT EXISTS cpaas_audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  message_id TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL,
  evidence_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cpaas_audit_logs_tenant
  ON cpaas_audit_logs (tenant_id, created_at DESC);