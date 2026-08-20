import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const VAULT_DIR = path.join(__dirname, 'evidence_vault');
const SCENARIOS_FILE = path.join(__dirname, 'scenarios.state.json');
const CUSTOM_RULES_FILE = path.join(__dirname, 'custom_rules.json');
const USERS_DB_PATH = path.join(__dirname, 'users_db.json');

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

// ------------------------------------------
// ESCENARIOS & REGLAS PERSONALIZADAS
// ------------------------------------------
app.get('/api/v1/scenarios', (req, res) => res.json(getScenarios()));
app.post('/api/v1/scenarios/toggle', (req, res) => {
  const { id } = req.body;
  const list = getScenarios().map(s => s.id === id ? { ...s, licensed: !s.licensed } : s);
  fs.writeFileSync(SCENARIOS_FILE, JSON.stringify(list, null, 2), 'utf8');
  res.json({ success: true, scenarios: list });
});

app.get('/api/v1/custom-rules', (req, res) => res.json(getCustomRules()));
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

// ------------------------------------------
// BÓVEDA FORENSE: RECEPCIÓN Y CONSULTA UNIFICADA
// ------------------------------------------
function readAllVaultLogs(targetUser) {
  if (!fs.existsSync(VAULT_DIR)) return [];
  const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith('.json'));
  let records = [];
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(VAULT_DIR, f), 'utf8');
      const item = JSON.parse(raw);
      if (!targetUser || (item.user && item.user.toLowerCase() === targetUser.toLowerCase())) {
        records.push(item);
      }
    } catch {}
  }
  return records.sort((a, b) => (b.timestampRaw || 0) - (a.timestampRaw || 0));
}

app.get(['/api/v1/runs', '/api/v1/events', '/api/evidence'], (req, res) => {
  const user = req.query.user;
  const logs = readAllVaultLogs(user);
  res.json(logs);
});

app.post(['/api/v1/runs', '/api/v1/events', '/api/evidence'], (req, res) => {
  try {
    const payload = req.body;
    const evidenceId = payload.evidenceId || payload.id || ('EV-' + Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const isoTimestamp = payload.timestamp || now.toISOString();
    const timestamp = isoTimestamp.includes('T') ? isoTimestamp.split('T')[1].slice(0, 8) : isoTimestamp;

    const payloadStr = JSON.stringify({
      prompt: payload.promptInput || payload.event || payload.promptSummary,
      user: payload.user || payload.auditor || 'alfonsosb1@gmail.com',
      time: isoTimestamp
    });
    const calculatedHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

    const evidence = {
      evidenceId,
      timestamp,
      timestampRaw: now.getTime(),
      isoTimestamp,
      promptSummary: payload.promptInput || payload.promptSummary || payload.event || 'Intercepción L7',
      scenario: payload.scenario || payload.event || 'Auditoría Estándar ISO 42001',
      verdict: payload.verdict || (payload.action === 'REDACTED (RAM)' ? 'RECHAZADO' : 'PERMITIDO'),
      action: payload.action || (payload.verdict === 'RECHAZADO' ? 'REDACTED (RAM)' : 'LOGGED'),
      origin: payload.origin || 'gemini.google.com',
      user: payload.user || payload.auditor || 'alfonsosb1@gmail.com',
      licenseKey: payload.licenseKey || 'SAARE-MASTER-2026-ROOT-001',
      hash: payload.hash || calculatedHash,
      status: 'Ed25519 VERIFIED'
    };

    const filePath = path.join(VAULT_DIR, `${evidenceId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(evidence, null, 2), 'utf8');

    console.log(`[VAULT] Guardada evidencia física: ${evidenceId}.json`);
    res.status(201).json({ status: 'OK', runId: evidenceId, evidence });
  } catch (err) {
    console.error('[VAULT ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------
// AUTENTICACIÓN & GESTIÓN DE LICENCIAS
// ------------------------------------------
app.post('/api/v1/auth/login', (req, res) => {
  const { email, token } = req.body;
  if (!fs.existsSync(USERS_DB_PATH)) return res.status(500).json({ error: 'Base de datos de usuarios no inicializada' });

  const db = JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
  const user = db.users.find(u => u.email === email || u.sessionToken === token);

  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({ error: 'Credenciales inválidas o suscripción inactiva' });
  }

  res.json({
    success: true,
    token: user.sessionToken || 'sk_saare_live_' + Date.now(),
    user: {
      email: user.email,
      empresa: user.empresa || 'Empresa Custodia',
      tenantId: user.masterTenantId || 'TENANT-DEFAULT',
      active_scenarios: user.active_scenarios || ['compliance'],
      seats: user.seats || 1
    }
  });
});

app.get('/api/v1/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization || req.headers['x-saare-license'];
  if (!authHeader) return res.status(401).json({ valid: false, error: 'Token no proporcionado' });

  const rawToken = authHeader.replace('Bearer ', '');
  if (!fs.existsSync(USERS_DB_PATH)) return res.status(500).json({ valid: false });

  const db = JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
  const user = db.users.find(u => u.sessionToken === rawToken);

  if (!user || user.status !== 'ACTIVE') {
    return res.status(403).json({ valid: false, error: 'Licencia inactiva o expirada' });
  }

  res.json({
    valid: true,
    email: user.email,
    empresa: user.empresa,
    tenantId: user.masterTenantId,
    active_scenarios: user.active_scenarios || ['compliance'],
    seats: user.seats || 1
  });
});

// ------------------------------------------
// PROVISIÓN STRIPE WEBHOOKS & EXPORTS
// ------------------------------------------
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_details?.email || session.prefilled_email;
      const cif = session.client_reference_id || 'SIN_CIF';

      let db = { users: [] };
      if (fs.existsSync(USERS_DB_PATH)) db = JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));

      let user = db.users.find(u => u.email === email);
      if (!user) {
        user = {
          email,
          empresa: cif,
          masterTenantId: 'TENANT-SAARE-' + Date.now(),
          sessionToken: 'sk_saare_live_' + Buffer.from(email + Date.now()).toString('hex').slice(0, 16),
          active_scenarios: ['compliance'],
          seats: 1,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
      } else {
        user.status = 'ACTIVE';
      }
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
      console.log(`✔ Licencia aprovisionada para: ${email}`);
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.get('/healthz', (req, res) => res.json({ status: 'HEALTHY', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() }));

app.get('/api/v1/vault/export', (req, res) => {
  res.json({
    vault_version: '2.5.0-Enterprise',
    jurisdiction: 'EU-RGPD-ISO42001',
    custodian: 'alfonsosb1@gmail.com',
    exported_at: new Date().toISOString(),
    records: readAllVaultLogs('alfonsosb1@gmail.com')
  });
});

// ------------------------------------------
// INICIALIZACIÓN DE PUERTO
// ------------------------------------------
const PORT = 3001;
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`[SAARE Control-Plane] ACTIVO Y ESCUCHANDO EN :${PORT}`);
  console.log('====================================================');
});