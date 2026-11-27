-- ============================================================================
-- ESQUEMA UNIFICADO PARA CLOUDFLARE D1 (SQLITE) - PRODUCCIÓN MULTITENANT
-- Alineado con worker.js (SGP 1.0 / MS3V / Control Plane)
-- ============================================================================

-- Nota: Se mantiene compatibilidad con escrituras directas sin fallo por orden
-- de inserción entre tenants y trazas/evidencias en tiempo real.
PRAGMA foreign_keys = OFF;

-- 1. Tenants (aislamiento principal, cuotas y planes)
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id TEXT PRIMARY KEY,
  id TEXT,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'enterprise',
  plan_id TEXT NOT NULL DEFAULT 'ENTERPRISE_1990',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  quota INTEGER NOT NULL DEFAULT 1000000,
  expires_at TEXT,
  owner_email TEXT,
  config_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Usuarios scoped por email y tenant (company)
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  tenant_id TEXT,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CISO_ADMIN',
  is_verified INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Reglas DLP / políticas por tenant
CREATE TABLE IF NOT EXISTS custom_rules (
  id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'BLOCK',
  priority INTEGER NOT NULL DEFAULT 100,
  enabled INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tenant_id, id)
);

-- 4. Interruptor global de reglas y comandos de protocolo por tenant
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

-- 5. Consumo mensual de veredictos por tenant y periodo (YYYY-MM)
CREATE TABLE IF NOT EXISTS tenant_usage (
  tenant_id TEXT NOT NULL,
  billing_period TEXT NOT NULL,
  verdict_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, billing_period)
);

-- 6. Solicitudes de evaluación
CREATE TABLE IF NOT EXISTS evaluation_requests (
  request_id TEXT PRIMARY KEY,
  id TEXT,
  tenant_id TEXT NOT NULL DEFAULT 'DEFAULT',
  trace_id TEXT,
  work_email TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  ai_systems TEXT NOT NULL DEFAULT '',
  interest TEXT NOT NULL DEFAULT '',
  requirement TEXT NOT NULL DEFAULT '',
  payload_json TEXT,
  source_ip TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Trazas consolidadas y cadena de integridad por tenant
CREATE TABLE IF NOT EXISTS consolidated_traces (
  trace_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_email TEXT NOT NULL DEFAULT '',
  final_evaluator_node TEXT NOT NULL DEFAULT 'MS3V_BLOCK_LOGIC_PEP_L7',
  decision TEXT NOT NULL DEFAULT 'ALLOW',
  final_decision TEXT NOT NULL DEFAULT 'ALLOW',
  final_action TEXT NOT NULL DEFAULT 'ALLOWED',
  verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
  risk_score REAL NOT NULL DEFAULT 0,
  execution_latency_ms REAL NOT NULL DEFAULT 0,
  prompt TEXT NOT NULL DEFAULT '',
  sanitized_payload TEXT NOT NULL DEFAULT '',
  ms3v_hash TEXT NOT NULL DEFAULT '',
  ms3v_timestamp_ns TEXT NOT NULL DEFAULT '',
  anchored INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Evidencias detalladas (runs)
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_id TEXT UNIQUE NOT NULL,
  trace_id TEXT NOT NULL,
  verdictId TEXT NOT NULL,
  decision TEXT NOT NULL DEFAULT 'ALLOW',
  verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
  user TEXT NOT NULL DEFAULT 'anonymous',
  tenant TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  responseOutput TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Anclas Merkle y lotes forenses eIDAS / RFC 3161 por tenant
CREATE TABLE IF NOT EXISTS merkle_anchors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  batch_size INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forensic_batches (
  batch_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  leaf_count INTEGER NOT NULL DEFAULT 0,
  is_qualified_eidas INTEGER NOT NULL DEFAULT 0,
  assurance_level TEXT NOT NULL DEFAULT 'LOCAL_INTEGRITY',
  tsa_reference TEXT NOT NULL DEFAULT '',
  tsa_status TEXT NOT NULL DEFAULT 'LOCAL_INTEGRITY',
  tsr_base64 TEXT NOT NULL DEFAULT '',
  batch_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 10. Declaración de Aplicabilidad (SoA) ISO/IEC 42001 y auditoría CPaaS / alarmas
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

-- ============================================================================
-- SEMILLA INICIAL DE TENANTS BASE (EVITA FALSOS NEGATIVOS EN ARRANQUE)
-- ============================================================================

INSERT OR IGNORE INTO tenants (tenant_id, id, name, plan, plan_id, status, quota)
VALUES
  ('ENTERPRISE', 'ENTERPRISE', 'S.A.A.R.E. Enterprise Master Tenant', 'enterprise', 'ENTERPRISE_1990', 'ACTIVE', 1000000000),
  ('DEFAULT', 'DEFAULT', 'S.A.A.R.E. Default Tenant', 'enterprise', 'ENTERPRISE_1990', 'ACTIVE', 1000000);

-- ============================================================================
-- ÍNDICES OPTIMIZADOS PARA CONSULTAS MULTITENANT
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_company
  ON users(company);

CREATE INDEX IF NOT EXISTS idx_users_tenant_email
  ON users(tenant_id, email);

CREATE INDEX IF NOT EXISTS idx_tenants_status_plan
  ON tenants(status, plan_id);

CREATE INDEX IF NOT EXISTS idx_custom_rules_tenant_enabled
  ON custom_rules(tenant_id, enabled, priority);

CREATE INDEX IF NOT EXISTS idx_evaluation_requests_tenant_created
  ON evaluation_requests(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_evaluation_requests_trace_id
  ON evaluation_requests(trace_id);

CREATE INDEX IF NOT EXISTS idx_consolidated_traces_tenant_created
  ON consolidated_traces(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_consolidated_traces_tenant_anchored
  ON consolidated_traces(tenant_id, anchored, timestamp);

CREATE INDEX IF NOT EXISTS idx_runs_tenant_created
  ON runs(tenant, created_at);

CREATE INDEX IF NOT EXISTS idx_merkle_anchors_tenant_created
  ON merkle_anchors(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_forensic_batches_tenant_created
  ON forensic_batches(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_cpaas_audit_tenant_created
  ON cpaas_audit_logs(tenant_id, created_at);