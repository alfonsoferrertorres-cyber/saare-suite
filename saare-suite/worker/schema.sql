CREATE TABLE IF NOT EXISTS verdicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trace_id TEXT NOT NULL UNIQUE,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  verdict TEXT NOT NULL,
  policy TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verdicts_created_at ON verdicts(created_at);
CREATE INDEX IF NOT EXISTS idx_verdicts_verdict ON verdicts(verdict);