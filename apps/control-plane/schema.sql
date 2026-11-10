-- ==============================================================================
-- S.A.A.R.E. Enterprise — Esquema de Base de Datos WORM / D1 (SGP 1.0)
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

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_id TEXT UNIQUE,
  trace_id TEXT NOT NULL,
  verdictId TEXT,
  decision TEXT NOT NULL DEFAULT 'ALLOW',
  verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
  user TEXT NOT NULL DEFAULT 'anonymous',
  tenant TEXT NOT NULL DEFAULT 'ENTERPRISE',
  prompt TEXT DEFAULT '',
  responseOutput TEXT DEFAULT '',
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  plan TEXT,
  status TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'CISO_ADMIN',
  is_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS merkle_anchors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  batch_size INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS custom_rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenant_usage (
  tenant_id TEXT NOT NULL,
  billing_period TEXT NOT NULL,
  verdict_count INTEGER DEFAULT 0,
  PRIMARY KEY (tenant_id, billing_period)
);