import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const VAULT_DIR = path.join(__dirname, 'evidence_vault');

if (!fs.existsSync(VAULT_DIR)) {
  fs.mkdirSync(VAULT_DIR, { recursive: true });
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url.split('?')[0];

  // 1. Intercepción Pre-Flight L7 (/api/v1/runs)
  if (req.method === 'POST' && (url === '/api/v1/runs' || url === '/api/toggle-license')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const evId = 'EV-' + Math.floor(100000 + Math.random() * 900000);
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];

        const evidence = {
          evidenceId: evId,
          id: evId,
          runId: 'RUN-' + Date.now(),
          timestamp: timeStr,
          timestampRaw: Date.now(),
          token: data.token || 'VK4WH7ZA7rnYNC9',
          user: data.user || 'Alfonso Ferrer (Auditor SOC)',
          prompt: data.promptInput || 'Intercepción L7 activa',
          promptSummary: data.promptInput || 'Intercepción L7 activa',
          verdict: 'RECHAZADO',
          scenarioApplied: 'España - LOPDGDD & AEPD',
          sceneId: 'ES_CUMPLIMIENTO_ESPANA',
          complianceFramework: 'ISO 42001 / LOPDGDD Art. 5',
          action: 'Verificar W3C',
          cryptoSeal: 'AES256-AEPD-ES-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          ramAddress: '0x7FFF8A42B100'
        };

        const filePath = path.join(VAULT_DIR, `${evId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(evidence, null, 2), 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK', verdict: 'RECHAZADO', evidence }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. Historial de Eventos (/api/v1/events y /api/v1/vault/inspect)
  if (req.method === 'GET' && (url === '/api/v1/events' || url === '/api/v1/vault/inspect')) {
    try {
      const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith('.json'));
      const events = files.map(file => {
        try {
          const content = fs.readFileSync(path.join(VAULT_DIR, file), 'utf8');
          return JSON.parse(content);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      events.sort((a, b) => (b.timestampRaw || 0) - (a.timestampRaw || 0));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ events, count: events.length, status: 'CONNECTED' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. Fallback
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'SAARE_ACTIVE_L7' }));
});

server.listen(PORT, () => {
  console.log(`[S.A.A.R.E. Control Plane] Activo y escuchando en http://localhost:${PORT}`);
});
