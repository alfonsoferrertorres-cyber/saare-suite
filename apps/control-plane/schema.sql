-- ============================================================================
-- ESQUEMA UNIFICADO PARA CLOUDFLARE D1 (SQLITE)
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  owner_email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS custom_rules (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'BLOCK',
  priority INTEGER NOT NULL DEFAULT 100,
  enabled INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluation_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  trace_id TEXT,
  payload_json TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consolidated_traces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trace_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  decision TEXT NOT NULL DEFAULT 'ALLOW',
  final_decision TEXT NOT NULL DEFAULT 'ALLOW',
  risk_score REAL DEFAULT 0,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);

CREATE INDEX IF NOT EXISTS idx_tenants_tenant_id
  ON tenants(tenant_id);

CREATE INDEX IF NOT EXISTS idx_custom_rules_tenant_enabled
  ON custom_rules(tenant_id, enabled, priority);

CREATE INDEX IF NOT EXISTS idx_evaluation_requests_tenant
  ON evaluation_requests(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_evaluation_requests_trace_id
  ON evaluation_requests(trace_id);

CREATE INDEX IF NOT EXISTS idx_consolidated_traces_trace_id
  ON consolidated_traces(trace_id);

CREATE INDEX IF NOT EXISTS idx_consolidated_traces_tenant
  ON consolidated_traces(tenant_id, created_at);