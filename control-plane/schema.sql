-- schema.sql
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
    anchored INTEGER DEFAULT 0,
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