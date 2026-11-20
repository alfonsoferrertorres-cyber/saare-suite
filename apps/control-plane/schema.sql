-- S.A.A.R.E. Enterprise Control Plane - Cloudflare D1 Schema (v1.5.0)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS consolidated_traces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trace_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  protocol_version TEXT DEFAULT 'SGP-1.0/MS3V',
  decision TEXT NOT NULL CHECK (decision IN ('ALLOW', 'BLOCK', 'SANITIZE', 'CHALLENGE')),
  risk_score REAL DEFAULT 0.0,
  reasons_json TEXT DEFAULT '[]',
  redacted_fields_json TEXT DEFAULT '[]',
  latency_ms INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_consolidated_traces_tenant_created
  ON consolidated_traces (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consolidated_traces_decision
  ON consolidated_traces (decision, created_at DESC);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  trace_id TEXT,
  profile_name TEXT DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'BLOCKED')),
  input_hash TEXT,
  output_hash TEXT,
  metadata_json TEXT DEFAULT '{}',
  started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_status
  ON runs (tenant_id, status, started_at DESC);

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'ENTERPRISE',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRIAL')),
  default_policy_json TEXT DEFAULT '{}',
  monthly_quota INTEGER DEFAULT 1000000,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'AUDITOR', 'MEMBER')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_email
  ON users (tenant_id, email);

CREATE TABLE IF NOT EXISTS merkle_anchors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anchor_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT,
  merkle_root TEXT NOT NULL,
  leaf_count INTEGER NOT NULL CHECK (leaf_count >= 0),
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  anchored_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_merkle_anchors_window
  ON merkle_anchors (window_end DESC);

CREATE TABLE IF NOT EXISTS custom_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  priority INTEGER NOT NULL DEFAULT 100,
  action TEXT NOT NULL CHECK (action IN ('ALLOW', 'BLOCK', 'SANITIZE', 'CHALLENGE')),
  pattern TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_custom_rules_tenant_enabled
  ON custom_rules (tenant_id, enabled, priority ASC);

CREATE TABLE IF NOT EXISTS tenant_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  billing_period TEXT NOT NULL, -- Formato YYYY-MM
  requests_count INTEGER NOT NULL DEFAULT 0,
  blocked_count INTEGER NOT NULL DEFAULT 0,
  sanitized_count INTEGER NOT NULL DEFAULT 0,
  tokens_processed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (tenant_id, billing_period),
  FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cpaas_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  channel TEXT NOT NULL, -- SMS, VOICE, WHATSAPP, EMAIL, WEBHOOK
  direction TEXT NOT NULL DEFAULT 'OUTBOUND' CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  recipient_hash TEXT,
  decision TEXT NOT NULL CHECK (decision IN ('ALLOW', 'BLOCK', 'SANITIZE', 'CHALLENGE')),
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_cpaas_audit_logs_tenant_created
  ON cpaas_audit_logs (tenant_id, created_at DESC);