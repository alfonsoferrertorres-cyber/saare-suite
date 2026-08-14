CREATE TABLE IF NOT EXISTS deployments (
  tenant_id TEXT PRIMARY KEY,
  active_scenario TEXT NOT NULL,
  scenario_name TEXT NOT NULL,
  governance_level TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
