import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { TenantManager } from './tenantManager.js';
import { AuthMiddleware } from './authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const VAULT_DIR = path.join(__dirname, 'evidence_vault');

if (!fs.existsSync(VAULT_DIR)) {
  fs.mkdirSync(VAULT_DIR, { recursive: true });
}

// Inicializar Gestor de Tenants y Autenticación
const tenantManager = new TenantManager();
const authMiddleware = new AuthMiddleware();

// Registrar Tenant demo por defecto
tenantManager.registerTenant('saare-corp-01', 'SAARE Enterprise Global', {
  quota: 50000,
  scenarios: ['banca_dora_pci_dss', 'lopdgdd_aepd', 'iso_42001']
});

// Helper para crear JWT firmado
function generateToken(payload, secret = 'enterprise_oidc_secret_key_v3') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

const server = http.createServer((req, res) => {
  // Encabezados CORS y Private Network Access (PNA)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  // 1. ENDPOINT DE AUTENTICACIÓN (POST /api/v1/auth/login)
  if (req.method === 'POST' && url === '/api/v1/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        
        // Validación de acceso corporativo
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Debe ingresar correo y contraseña' }));
        }

        // Demo validación (acepta credenciales corporativas o ciso demo)
        const tenant = tenantManager.getTenant('saare-corp-01');
        const role = email.includes('ciso') ? 'saare-ciso-group' : (email.includes('ops') ? 'saare-ops-group' : 'saare-ciso-group');
        
        const exp = Math.floor(Date.now() / 1000) + (8 * 3600); // 8 horas
        const claims = {
          sub: 'usr_' + crypto.randomBytes(4).toString('hex'),
          email: email,
          tenant_id: tenant.tenantId,
          tenant_name: tenant.name,
          groups: [role],
          exp: exp
        };

        const token = generateToken(claims);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'SUCCESS',
          token: token,
          user: {
            email: email,
            role: role === 'saare-ciso-group' ? 'Business / CISO' : 'Operator',
            tenantId: tenant.tenantId,
            tenantName: tenant.name
          }
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. ENDPOINT INBOUND L7 / RUNTIME (POST /api/v1/runs)
  if (req.method === 'POST' && (url === '/api/v1/runs' || url === '/api/v1/inbound')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const evId = 'EV-' + Math.floor(100000 + Math.random() * 900000);
        const now = new Date();
        const rawText = payload.promptInput || payload.prompt || 'Prompt interceptado L7';

        const containsDni = /\b\d{8}[A-HJ-NP-TV-Z]\b/i.test(rawText);
        const containsSensitive = /nómina|nomina|sueldo|cuenta|iban|password|secreto|dni/i.test(rawText);
        const verdict = (containsDni || containsSensitive) ? 'RECHAZADO' : 'APROBADO_CON_RESTRICCIONES';

        const evidence = {
          evidenceId: evId,
          timestamp: now.toTimeString().split(' ')[0],
          timestampRaw: now.getTime(),
          isoTimestamp: now.toISOString(),
          user: payload.user || 'Alfonso Ferrer (Auditor SOC)',
          tenantId: payload.tenantId || 'saare-corp-01',
          token: payload.token || 'W3C-SAARE-SEC-TOKEN',
          promptSummary: rawText,
          scenario: containsDni || containsSensitive ? 'España - LOPDGDD & AEPD' : 'Auditoría Estándar ISO 42001',
          verdict: verdict,
          signature: 'W3C-SAARE-PASS-' + Math.random().toString(36).substring(2, 9).toUpperCase()
        };

        fs.writeFileSync(path.join(VAULT_DIR, `${evId}.json`), JSON.stringify(evidence, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK', verdict, evidence }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 3. LECTURA DE HISTORIAL ORDENADO DESCENDENTE (GET /api/v1/events)
  if (req.method === 'GET' && (url === '/api/v1/events' || url === '/api/v1/vault/inspect')) {
    try {
      const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith('.json'));
      const events = files.map(file => {
        try {
          const stats = fs.statSync(path.join(VAULT_DIR, file));
          const content = JSON.parse(fs.readFileSync(path.join(VAULT_DIR, file), 'utf8'));
          if (!content.timestampRaw) content.timestampRaw = stats.mtimeMs;
          return content;
        } catch {
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

  // Ruta por defecto
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'SAARE_ACTIVE_L7' }));
});

server.listen(PORT, () => {
  console.log(`[S.A.A.R.E. Control Plane] Activo en http://localhost:${PORT} con soporte PNA y Auth OIDC`);
});
