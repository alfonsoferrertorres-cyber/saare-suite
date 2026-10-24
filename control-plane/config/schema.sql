-- config/schema.sql — Esquema de referencia relacional S.A.A.R.E. Enterprise

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    company TEXT,
    role TEXT DEFAULT 'CISO_ADMIN',
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consolidated_traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id TEXT UNIQUE NOT NULL,
    tenant_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    final_evaluator_node TEXT,
    final_decision TEXT NOT NULL,
    execution_latency_ms REAL,
    prompt TEXT,                     -- Mapeado ex-ante en RAM
    sanitized_payload TEXT,          -- Payload inspeccionado y sanitizado
    verdict TEXT,                    -- Estado del veredicto (PERMITIDO / RECHAZADO)
    anchored INTEGER DEFAULT 0,      -- Sello / Anclaje de Merkle
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id TEXT UNIQUE NOT NULL,
    trace_id TEXT UNIQUE NOT NULL,
    verdictId TEXT NOT NULL,
    decision TEXT NOT NULL,
    user TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merkle_anchors (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    merkle_root TEXT NOT NULL,
    batch_size INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_usage (
    tenant_id TEXT NOT NULL,
    billing_period TEXT NOT NULL,
    verdict_count INTEGER DEFAULT 0,
    PRIMARY KEY (tenant_id, billing_period)
);