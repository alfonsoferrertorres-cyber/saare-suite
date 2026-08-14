import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const VAULT_DIR = path.join(__dirname, 'evidence_vault');
const USERS_FILE = path.join(__dirname, 'users_db.json');
const SCENARIOS_FILE = path.join(__dirname, 'scenarios_state.json');

if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });

// Inicializar DB de usuarios
if (!fs.existsSync(USERS_FILE)) {
  const initialUsers = {
    "alfonsosb1@gmail.com": {
      passwordHash: crypto.createHash('sha256').update('Password123!').digest('hex'),
      verified: true,
      role: 'Auditor CISO Principal'
    }
  };
  fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf8');
}

const defaultScenarios = [
  { id: 'scen-es-lopd', badge: 'NORMATIVA', title: 'ES España - LOPDGDD & AEPD', desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.', licensed: true },
  { id: 'scen-jailbreak', badge: 'TOP L7', title: 'Jailbreak & Prompt Injection Guard', desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).', licensed: true },
  { id: 'scen-forensic', badge: 'ANALÍTICO', title: 'Fact-Checking Forense & Fake Disprover ★', desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.', licensed: false },
  { id: 'scen-tokens', badge: 'ESTRELLA', title: 'Optimizador de Tokens & CostGuard ★', desc: 'Reducción de coste computacional y desinfección de prompts redundantes.', licensed: false }
];

if (!fs.existsSync(SCENARIOS_FILE)) {
  fs.writeFileSync(SCENARIOS_FILE, JSON.stringify(defaultScenarios, null, 2), 'utf8');
}

function getUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { return {}; }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}
function getScenarios() {
  try { return JSON.parse(fs.readFileSync(SCENARIOS_FILE, 'utf8')); } catch { return defaultScenarios; }
}
function saveScenarios(sc) {
  fs.writeFileSync(SCENARIOS_FILE, JSON.stringify(sc, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. LOGIN Y REGISTRO
  if (req.method === 'POST' && pathname === '/api/v1/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        const cleanEmail = (email || 'alfonsosb1@gmail.com').toLowerCase().trim();
        const users = getUsers();
        const userRecord = users[cleanEmail] || { role: 'Auditor Autorizado' };
        
        const sessionToken = 'SAARE-AUTH-' + crypto.randomUUID();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'SUCCESS',
          token: sessionToken,
          user: { email: cleanEmail, role: userRecord.role }
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. TOGGLE DE LICENCIAS
  if (req.method === 'GET' && pathname === '/api/v1/scenarios') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(getScenarios()));
  }

  if (req.method === 'POST' && (pathname === '/api/v1/scenarios/toggle' || pathname === '/api/v1/toggle-license')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { id } = JSON.parse(body || '{}');
        const scList = getScenarios().map(sc => sc.id === id ? { ...sc, licensed: !sc.licensed } : sc);
        saveScenarios(scList);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK', scenarios: scList }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 3. RECEPTOR UNIVERSAL L7 (REGISTRA TODO: TANTO PERMITIDOS COMO RECHAZADOS)
  if (req.method === 'POST' && (pathname === '/api/v1/runs' || pathname === '/api/v1/inbound' || pathname === '/api/v1/intercept')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const evId = payload.evidenceId || ('EV-' + Math.floor(100000 + Math.random() * 900000));
        const now = new Date();
        const rawText = payload.promptInput || payload.prompt || payload.promptSummary || '';

        // Detección de patrones sensibles
        const containsDni = /\b\d{8}[A-HJ-NP-TV-Z]\b/i.test(rawText);
        const containsSensitive = /nómina|nomina|sueldo|cuenta|iban|password|secreto|dni/i.test(rawText);

        const currentScenarios = getScenarios();
        const esLopdActive = currentScenarios.find(s => s.id === 'scen-es-lopd')?.licensed ?? true;

        let verdict = 'PERMITIDO';
        let scenarioApplied = 'Auditoría Estándar ISO 42001';

        if (esLopdActive && (containsDni || containsSensitive)) {
          verdict = 'RECHAZADO';
          scenarioApplied = 'España - LOPDGDD & AEPD';
        }

        const evidence = {
          evidenceId: evId,
          timestamp: now.toTimeString().split(' ')[0],
          timestampRaw: now.getTime(),
          isoTimestamp: now.toISOString(),
          user: payload.user || 'alfonsosb1@gmail.com',
          promptSummary: rawText,
          scenario: scenarioApplied,
          verdict: verdict,
          signature: 'SHA256:' + crypto.createHash('sha256').update(rawText + now.toISOString()).digest('hex').substring(0, 16).toUpperCase()
        };

        // SIEMPRE ESCRIBE EN LA BÓVEDA (TRAZABILIDAD 100%)
        fs.writeFileSync(path.join(VAULT_DIR, `${evId}.json`), JSON.stringify(evidence, null, 2), 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK', runId: evId, verdict, evidence }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 4. LECTURA DE LA BÓVEDA PARA LA CONSOLA
  if (req.method === 'GET' && (pathname === '/api/v1/events' || pathname === '/api/v1/runs')) {
    try {
      const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith('.json'));
      const events = files.map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(VAULT_DIR, f), 'utf8')); } catch { return null; }
      }).filter(Boolean);

      events.sort((a, b) => (b.timestampRaw || 0) - (a.timestampRaw || 0));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'SUCCESS', count: events.length, events }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

server.listen(PORT, () => {
  console.log(`=== SAARE CONTROL PLANE ACTIVO EN PUERTO :${PORT} ===`);
  console.log(`=== MODO AUDITORÍA CONTINUA 100%: REGISTRO ACTIVO PARA TODOS LOS PROMPTS ===`);
});
