-- ============================================================================
-- S.A.A.R.E. Enterprise — D1 Database Schema Architecture (SGP 1.0 / v8.1)
-- ============================================================================

-- 1. TABLA DE ORGANIZACIONES Y LICENCIAS (TENANTS)
-- Gestiona la suscripción y límites de los clientes (Sincronizado vía Stripe / TenantManager)
CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'Software Core L7',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tenants_tenant_id ON tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);

-- 2. TABLA DE USUARIOS Y ROLES (RBAC MULTI-TENANT)
-- Soporta la jerarquía Nivel 0 (Agent) a Nivel 4 (CISO Admin) y la autenticación
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    company TEXT NOT NULL DEFAULT 'ENTERPRISE',
    role TEXT NOT NULL DEFAULT 'OPERATIONAL_AGENT_USER',
    is_verified INTEGER NOT NULL DEFAULT 0,
    verification_token TEXT,
    verification_expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);

-- 3. TABLA DE TRAZAS CONSOLIDADAS (DEDUPLICACIÓN DE MÉTRICAS - FIRST-TOUCH VETO)
-- Garantiza que 1 solicitud = 1 métrica en los dashboards, sin importar cuántos nodos la hayan procesado
CREATE TABLE IF NOT EXISTS consolidated_traces (
    trace_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    final_evaluator_node TEXT NOT NULL, -- 'DOM_HOOK', 'DAEMON_LOCAL' o 'EDGE_WORKER'
    final_action TEXT NOT NULL,         -- 'BLOCKED' o 'ALLOWED'
    rule_applied TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_consolidated_tenant_action ON consolidated_traces(tenant_id, final_action);
CREATE INDEX IF NOT EXISTS idx_consolidated_created_at ON consolidated_traces(created_at);

-- 4. BÓVEDA DE EVIDENCIAS Y EJECUCIONES (APPEND-ONLY ISO/IEC 27037)
-- Almacena el JSON canónico firmado criptográficamente para auditoría eIDAS / DORA / EU AI Act
CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verdictId TEXT NOT NULL,
    evidence_id TEXT UNIQUE NOT NULL,
    trace_id TEXT NOT NULL,
    decision TEXT NOT NULL, -- 'ALLOW' o 'DENY'
    user TEXT NOT NULL,
    tenant TEXT NOT NULL,
    verdict TEXT NOT NULL,  -- 'PERMITIDO' o 'RECHAZADO'
    prompt TEXT,
    responseOutput TEXT,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(trace_id) REFERENCES consolidated_traces(trace_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_runs_evidence_id ON runs(evidence_id);
CREATE INDEX IF NOT EXISTS idx_runs_tenant_user ON runs(tenant, user);
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at);