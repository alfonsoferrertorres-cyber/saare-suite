-- S.A.A.R.E. Enterprise Control Plane - Cloudflare D1 Schema (Unificado con worker.js)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  email TEXT,
  name TEXT,
  plan TEXT DEFAULT 'ENTERPRISE',
  plan_id TEXT DEFAULT 'ENTERPRISE_1990',
  status TEXT DEFAULT 'ACTIVE',
  quota INTEGER DEFAULT 1000000,
  monthly_quota INTEGER DEFAULT 1000000,
  expires_at TEXT,
  default_policy_json TEXT DEFAULT '{}',
  config_json TEXT DEFAULT '{}',
  updated_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  company TEXT,
  role TEXT DEFAULT 'CISO_ADMIN',
  is_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS consolidated_traces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trace_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  final_evaluator_node TEXT DEFAULT 'MS3V_BLOCK_LOGIC_PEP_L7',
  final_decision TEXT NOT NULL DEFAULT 'ALLOW',
  decision TEXT NOT NULL DEFAULT 'ALLOW',
  execution_latency_ms REAL DEFAULT 0.0,
  anchored INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  sanitized_payload TEXT DEFAULT '',
  prompt TEXT DEFAULT '',
  verdict TEXT DEFAULT 'PERMITIDO',
  it_risk_level TEXT,
  dpia_status TEXT,
  bias_metrics TEXT,
  esg_impact TEXT,
  final_action TEXT NOT NULL DEFAULT 'ALLOWED',
  ms3v_hash TEXT DEFAULT '',
  ms3v_timestamp_ns TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_id TEXT UNIQUE NOT NULL,
  trace_id TEXT NOT NULL,
  verdictId TEXT NOT NULL,
  decision TEXT NOT NULL DEFAULT 'ALLOW',
  user TEXT NOT NULL DEFAULT 'anonymous',
  created_at TEXT DEFAULT (datetime('now')),
  verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
  tenant TEXT NOT NULL DEFAULT '',
  prompt TEXT DEFAULT '',
  responseOutput TEXT DEFAULT '',
  payload_json TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS merkle_anchors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  batch_size INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forensic_batches (
  batch_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  leaf_count INTEGER NOT NULL DEFAULT 0,
  is_qualified_eidas INTEGER NOT NULL DEFAULT 0,
  assurance_level TEXT NOT NULL DEFAULT 'LOCAL_INTEGRITY',
  tsa_reference TEXT DEFAULT '',
  tsa_status TEXT DEFAULT 'LOCAL_INTEGRITY',
  tsr_base64 TEXT DEFAULT '',
  batch_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS custom_rules (
  id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  enabled INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 100,
  action TEXT NOT NULL DEFAULT 'BLOCK',
  description TEXT,
  updated_at TEXT,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE IF NOT EXISTS tenant_rule_settings (
  tenant_id TEXT PRIMARY KEY,
  rules_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenant_protocol_settings (
  tenant_id TEXT PRIMARY KEY,
  commands_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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

CREATE TABLE IF NOT EXISTS tenant_soa_iso42001 (
  tenant_id TEXT PRIMARY KEY,
  role_type TEXT NOT NULL,
  ai_act_scope TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  approver_email TEXT NOT NULL DEFAULT '',
  controls_json TEXT NOT NULL,
  compiled_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consolidated_traces_tenant_created
  ON consolidated_traces (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_created
  ON runs (tenant, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_merkle_anchors_tenant_created
  ON merkle_anchors (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forensic_batches_tenant_created
  ON forensic_batches (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_custom_rules_tenant_enabled
  ON custom_rules (tenant_id, enabled, priority ASC);

CREATE INDEX IF NOT EXISTS idx_cpaas_audit_logs_tenant_created
  ON cpaas_audit_logs (tenant_id, created_at DESC);