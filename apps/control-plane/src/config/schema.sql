-- config/schema.sql — Esquema de Referencia Relacional S.A.A.R.E. Enterprise (SGP 1.0 / V12.1 Producción)

-- 1. Tabla de Usuarios y Operadores RBAC
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    company TEXT DEFAULT 'ORGANISMO_DEMO_01',
    role TEXT DEFAULT 'CISO_ADMIN',
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla Principal de Trazas Forenses y Bóveda D1 (Zero-Disk / mlock_ephemeral)
CREATE TABLE IF NOT EXISTS consolidated_traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id TEXT UNIQUE NOT NULL,
    evidence_id TEXT UNIQUE,
    tenant_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    final_evaluator_node TEXT DEFAULT 'RPI-2607076315021',
    final_decision TEXT NOT NULL, -- ALLOW / DENY
    execution_latency_ms REAL DEFAULT 0.84,
    prompt TEXT,                  -- Payload interceptado ex-ante en RAM
    sanitized_payload TEXT,       -- Payload sanitizado / sustituido
    verdict TEXT NOT NULL,        -- PERMITIDO / RECHAZADO
    anchored INTEGER DEFAULT 0,   -- Estado de anclaje Merkle (0 = pendiente, 1 = anclado)
    node TEXT DEFAULT 'RPI-2607076315021',
    proof_bundle TEXT,            -- Paquete de prueba eIDAS / Ed25519 en formato JSON
    timestamp TEXT NOT NULL
);

-- 3. Tabla de Ejecuciones de Auditoría e Infecciones (Compatibilidad Legacy / Fallback)
CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id TEXT UNIQUE NOT NULL,
    trace_id TEXT NOT NULL,
    verdictId TEXT NOT NULL,
    decision TEXT NOT NULL,
    user TEXT NOT NULL,
    tenant TEXT DEFAULT 'ORGANISMO_DEMO_01',
    prompt TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Anclajes de Árboles Merkle y Custodia Safe Creative / eIDAS
CREATE TABLE IF NOT EXISTS merkle_anchors (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    merkle_root TEXT NOT NULL,
    batch_size INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

-- 5. Tabla de Metering y Control de Uso por Tenant
CREATE TABLE IF NOT EXISTS tenant_usage (
    tenant_id TEXT NOT NULL,
    billing_period TEXT NOT NULL,
    verdict_count INTEGER DEFAULT 0,
    PRIMARY KEY (tenant_id, billing_period)
);

-- 6. Índices de Alto Rendimiento para Consultas Forenses y SSE
CREATE INDEX IF NOT EXISTS idx_traces_tenant_time ON consolidated_traces(tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traces_user ON consolidated_traces(user_email);
CREATE INDEX IF NOT EXISTS idx_traces_anchored ON consolidated_traces(tenant_id, anchored);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);