import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware CORS universal compatible con Express 4 y Express 5
app.use(cors());
app.use(express.json());

const VAULT_DIR = path.join(__dirname, 'evidence_vault');
const SCENARIOS_FILE = path.join(__dirname, 'scenarios.state.json');
const CUSTOM_RULES_FILE = path.join(__dirname, 'custom_rules.json');

if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });

const DEFAULT_SCENARIOS = [
  { id: 'saare-espana-lopd', title: 'España - LOPDGDD & AEPD', desc: 'Detección de DNI, NIE, IBAN, nóminas y fuga de PII.', licensed: true, badge: 'PRIVACIDAD ES' },
  { id: 'saare-l7-jailbreak', title: 'TOP L7: Jailbreak & Prompt Injection Guard', desc: 'Mitigación de ataques adversarios y directivas de anulación.', licensed: true, badge: 'CIBERSEGURIDAD' },
  { id: 'saare-forensic-factcheck', title: 'Fact-Checking Forense & Fake Disprover', desc: 'Trazabilidad y sellado de consistencia documental e ISO 42001.', licensed: true, badge: 'TRAZABILIDAD' },
  { id: 'saare-token-costguard', title: 'Optimizador de Tokens & CostGuard', desc: 'Reducción de consumo de tokens y modo bypass de auditoría.', licensed: true, badge: 'FINOPS IT' }
];

function getScenarios() {
  try {
    if (fs.existsSync(SCENARIOS_FILE)) return JSON.parse(fs.readFileSync(SCENARIOS_FILE, 'utf8'));
  } catch {}
  return DEFAULT_SCENARIOS;
}

function getCustomRules() {
  try {
    if (fs.existsSync(CUSTOM_RULES_FILE)) return JSON.parse(fs.readFileSync(CUSTOM_RULES_FILE, 'utf8'));
  } catch {}
  return [];
}

function saveCustomRules(rules) {
  fs.writeFileSync(CUSTOM_RULES_FILE, JSON.stringify(rules, null, 2), 'utf8');
}

// Endpoints
app.get('/api/v1/scenarios', (req, res) => res.json(getScenarios()));
app.post('/api/v1/scenarios/toggle', (req, res) => {
  const { id } = req.body;
  const list = getScenarios().map(s => s.id === id ? { ...s, licensed: !s.licensed } : s);
  fs.writeFileSync(SCENARIOS_FILE, JSON.stringify(list, null, 2), 'utf8');
  res.json({ success: true, scenarios: list });
});

app.get('/api/v1/custom-rules', (req, res) => {
  res.json(getCustomRules());
});

app.post('/api/v1/custom-rules', (req, res) => {
  const { pattern, label } = req.body;
  if (!pattern || !pattern.trim()) return res.status(400).json({ error: 'Patrón inválido' });
  const rules = getCustomRules();
  const newRule = {
    id: 'CR-' + Date.now().toString().slice(-6),
    pattern: pattern.trim(),
    label: label?.trim() || 'Bloqueo Personalizado',
    createdAt: new Date().toISOString()
  };
  rules.unshift(newRule);
  saveCustomRules(rules);
  res.json({ success: true, rules });
});

app.delete('/api/v1/custom-rules/:id', (req, res) => {
  const { id } = req.params;
  const rules = getCustomRules().filter(r => r.id !== id);
  saveCustomRules(rules);
  res.json({ success: true, rules });
});

app.get('/api/v1/events', (req, res) => {
  try {
    const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith('.json'));
    const events = files.map(f => JSON.parse(fs.readFileSync(path.join(VAULT_DIR, f), 'utf8')));
    events.sort((a, b) => (b.timestampRaw || 0) - (a.timestampRaw || 0));
    res.json({ events });
  } catch {
    res.json({ events: [] });
  }
});

app.post('/api/v1/runs', (req, res) => {
  const { promptInput, user, verdict, violationDetails } = req.body;
  const runId = 'EV-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0];
  const payloadStr = JSON.stringify({ promptInput, user, timestamp: now.toISOString() });
  const signature = crypto.createHash('sha256').update(payloadStr).digest('hex');

  const evidence = {
    evidenceId: runId,
    timestamp,
    timestampRaw: now.getTime(),
    promptSummary: promptInput,
    scenario: violationDetails?.norma || 'Auditoría Estándar ISO 42001',
    verdict: verdict || 'PERMITIDO',
    signature: 'SHA256:' + signature,
    auditor: user || 'alfonsosb1@gmail.com',
    violationDetails: violationDetails || null
  };

  fs.writeFileSync(path.join(VAULT_DIR, `${runId}.json`), JSON.stringify(evidence, null, 2), 'utf8');
  res.json({ status: 'OK', runId, verdict: evidence.verdict, evidence });
});

app.listen(3001, () => {
  console.log('====================================================');
  console.log('[SAARE Control-Plane] ACTIVO Y ESCUCHANDO EN :3001');
  console.log('====================================================');
});
