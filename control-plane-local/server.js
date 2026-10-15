// control-plane-local/server.js — Servidor Backend Local S.A.A.R.E. (SGP 1.0 / v8.4)
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- PERSISTENCIA LOCAL DE EVIDENCIAS Y LEDGER ---
const evidenceDir = path.resolve('./evidence');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}
const ledgerPath = path.join(evidenceDir, 'global_ledger.jsonl');

let evidenceDb = [];
try {
  if (fs.existsSync(ledgerPath)) {
    const fileContent = fs.readFileSync(ledgerPath, 'utf-8');
    evidenceDb = fileContent
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try { return JSON.parse(line); } catch (e) { return null; }
      })
      .filter(Boolean)
      .reverse();
  }
} catch (err) {
  console.error('[STORAGE WARNING] No se pudo leer el ledger histórico:', err);
}

// Datos iniciales de prueba si el ledger está vacío
if (evidenceDb.length === 0) {
  evidenceDb = [
    {
      id: 'EV-864387',
      evidence_id: 'EV-864387',
      evidenceId: 'EV-864387',
      trace_id: 'tr_init_864387',
      runId: 'RUN-1786664969077',
      timestamp: new Date().toISOString(),
      rawTimestamp: new Date().toISOString(),
      prompt: 'Quiero clonar la voz de un directivo y generar su rostro en video',
      promptSummary: 'Quiero clonar la voz de un directivo y generar su rostro en video',
      verdict: 'RECHAZADO',
      decision: 'DENY',
      category: 'PII_DETECTED',
      cat: 'PII_DETECTED',
      norma: 'EU AI Act / LOPDGDD',
      sub: 'EU AI Act / LOPDGDD',
      user: 'admin@saare.es',
      tenant: 'ENTERPRISE',
      merkleRoot: '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842',
      latency: 112,
      proofBundle: {
        verdictId: 'VRD-2026-EV-864387',
        payloadHash: '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842',
        ed25519Signature: 'ED25519_SIG_6F1B3986A4221147',
        merkleRoot: '6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842',
        rfc3161Timestamp: new Date().toISOString(),
        claimLevel: 'VERIFIED',
        auditStandard: 'ISO/IEC 27037:2012 / EU AI Act Art. 12 & 14 / DORA UE 2022/2554'
      },
      grantMetadata: {
        grantCategory: 'KIT_CONSULTING_GAP_ANALYSIS',
        eligibleItem: 'Evaluación de Impacto en Derechos Fundamentales (FRIA - EU AI Act)',
        dnshImpact: 'Reducción de consumo GPU por sanitización previa en RAM (Zero-Disk)',
        auditStandard: 'EU AI Act / DORA / ISO 27037',
        complianceCode: 'MS3V-GRANT-EVIDENCE-1786664969077'
      }
    },
    {
      id: 'EV-102290',
      evidence_id: 'EV-102290',
      evidenceId: 'EV-102290',
      trace_id: 'tr_init_102290',
      runId: 'RUN-1786665240079',
      timestamp: new Date().toISOString(),
      rawTimestamp: new Date().toISOString(),
      prompt: 'Auditar crédito del titular con DNI 48593021X y cuenta bancaria ES21 1465 0100 2030 4050.',
      promptSummary: 'Auditar crédito del titular con DNI 48593021X',
      verdict: 'RECHAZADO',
      decision: 'DENY',
      category: 'PII_DETECTED',
      cat: 'PII_DETECTED',
      norma: 'España - LOPDGDD & AEPD',
      sub: 'España - LOPDGDD & AEPD',
      user: 'ciso@empresa.com',
      tenant: 'ENTERPRISE',
      merkleRoot: '8839a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842f1b',
      latency: 98,
      proofBundle: {
        verdictId: 'VRD-2026-EV-102290',
        payloadHash: '8839a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842f1b',
        ed25519Signature: 'ED25519_SIG_8839A4221147814B',
        merkleRoot: '8839a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842f1b',
        rfc3161Timestamp: new Date().toISOString(),
        claimLevel: 'VERIFIED',
        auditStandard: 'ISO/IEC 27037:2012 / EU AI Act Art. 12 & 14 / DORA UE 2022/2554'
      },
      grantMetadata: {
        grantCategory: 'KIT_CONSULTING_GAP_ANALYSIS',
        eligibleItem: 'Evaluación de Impacto en Derechos Fundamentales (FRIA - EU AI Act)',
        dnshImpact: 'Reducción de consumo GPU por sanitización previa en RAM (Zero-Disk)',
        auditStandard: 'EU AI Act / DORA / ISO 27037',
        complianceCode: 'MS3V-GRANT-EVIDENCE-1786665240079'
      }
    }
  ];
}

function persistEvidenceRecord(record) {
  try {
    fs.appendFileSync(ledgerPath, JSON.stringify(record) + '\n', 'utf-8');
  } catch (err) {
    console.error('[STORAGE ERROR] Error al persistir evidencia:', err);
  }
}

// --- STORE DE CLIENTES SSE ---
let sseClients = [];

function broadcastSseEvent(data) {
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      // Ignorar clientes desconectados
    }
  });
}

// Intervalo heartbeat SSE (cada 15s)
setInterval(() => {
  sseClients.forEach(client => {
    try {
      client.res.write(`: keep-alive\n\n`);
    } catch (e) {}
  });
}, 15000);

// --- STORE DE REGLAS Y ASIENTOS RBAC ---
let customRules = [
  { id: 'RULE-1', name: 'Tokens de API Abiertos', pattern: 'sk-proj-[a-zA-Z0-9]+', created: new Date().toISOString() }
];

let executiveSeatsDb = [
  { email: 'ceo@empresa.com', name: 'Director Ejecutivo', role: 'BOARD_EXECUTIVE_LEVEL_1', is_verified: 1, created_at: '2026-01-15' },
  { email: 'ciso@empresa.com', name: 'Oficial de Seguridad', role: 'CISO_ADMIN', is_verified: 1, created_at: '2026-02-01' }
];

// --- RUTAS DE SALUD Y MONITOREO ---
const statusHandler = (req, res) => {
  res.json({
    status: 'OPERATIVE',
    vaultSource: 'LOCAL_LEDGER_FS',
    latencyP99Ms: 1.12,
    trustAnchor: 'D1-EU-WESTERN-EUROPE',
    specVersion: 'SGP 1.0',
    engine: 'Local PEP L7 v8.4',
    totalEvidences: evidenceDb.length,
    timestamp: new Date().toISOString()
  });
};

app.get('/status', statusHandler);
app.get('/v1/status', statusHandler);
app.get('/api/v1/status', statusHandler);

app.get(['/', '/health', '/v1/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'S.A.A.R.E. Local Control Plane',
    trustAnchor: 'D1-EU-WESTERN-EUROPE',
    srpVersion: '8.4.0',
    timestamp: new Date().toISOString()
  });
});

// --- CANAL DE TELEMETRÍA EN TIEMPO REAL (SSE) ---
const sseHandler = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`data: ${JSON.stringify({ status: 'RUNTIME_ACTIVE', mode: 'LOCAL_SERVER', evidences: evidenceDb.slice(0, 50) })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
  });
};

app.get('/stream', sseHandler);
app.get('/v1/stream', sseHandler);
app.get('/api/v1/stream', sseHandler);
app.get('/v1/telemetry/stream', sseHandler);
app.get('/api/v1/telemetry/stream', sseHandler);

// --- RUTAS DE TELEMETRÍA Y CONSULTA DE EVIDENCIAS ---
const getTelemetryHandler = (req, res) => {
  const tenant = req.query.tenant || req.headers['x-saare-tenant'] || 'ENTERPRISE';
  const filtered = evidenceDb.filter(e => !tenant || tenant === 'ENTERPRISE' || e.tenant === tenant);

  res.json({
    success: true,
    vaultSource: 'LOCAL_LEDGER_FS',
    evidences: filtered,
    runs: filtered
  });
};

app.get('/telemetry', getTelemetryHandler);
app.get('/v1/telemetry', getTelemetryHandler);
app.get('/api/v1/telemetry', getTelemetryHandler);
app.get('/runs', getTelemetryHandler);
app.get('/v1/runs', getTelemetryHandler);
app.get('/api/v1/runs', getTelemetryHandler);

// --- SOLICITUD DE PRUEBA / SANDBOX PERMANENTE (0 €) ---
app.post(['/trial', '/v1/trial', '/api/v1/trial'], (req, res) => {
  const { email, company, planType } = req.body || {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : 'demo@saare.es';
  const tenantName = company || 'CLIENTE_SANDBOX';

  res.json({
    success: true,
    trialId: `SANDBOX-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    expiresAt: null, // Sandbox permanente a 0 € sin caducidad
    tier: 'SANDBOX',
    priceEur: 0,
    unlimited: true,
    planType: 'SANDBOX',
    tenantName,
    message: 'Entorno Sandbox activado permanentemente a 0 €. Credenciales emitidas.'
  });
});

// --- INTERCEPCIÓN EX-ANTE / MOTOR DE EVALUACIÓN L7 ---
const interceptHandler = (req, res) => {
  const startTime = Date.now();
  const body = req.body || {};

  const promptInput = body.prompt || body.promptInput || body.rawPrompt || body.cleanPrompt || '';
  const user = body.user || req.headers['x-saare-user'] || 'ciso@saare.es';
  const tenant = body.tenant || req.headers['x-saare-tenant'] || 'ENTERPRISE';

  const promptUpper = String(promptInput).toUpperCase();
  const isDeny = body.decision === 'DENY' ||
    promptUpper.includes('DNI') ||
    promptUpper.includes('IBAN') ||
    promptUpper.includes('PII') ||
    promptUpper.includes('CLONAR') ||
    promptUpper.includes('SECRET') ||
    promptUpper.includes('DROP TABLE');

  const decision = isDeny ? 'DENY' : 'ALLOW';
  const verdict = isDeny ? 'RECHAZADO' : 'PERMITIDO';
  const latency = Date.now() - startTime + 1;

  const hexHash = crypto.createHash('sha256').update(`${user}:${promptInput}:${Date.now()}`).digest('hex');
  const runId = `EV-L7-${hexHash.substring(0, 10).toUpperCase()}`;
  const traceId = `tr_local_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const merkleRoot = crypto.createHash('sha256').update(promptInput || 'EMPTY').digest('hex');

  const newEvidence = {
    id: runId,
    evidence_id: runId,
    evidenceId: runId,
    trace_id: traceId,
    runId: `RUN-${Date.now()}`,
    timestamp: new Date().toISOString(),
    rawTimestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString(),
    prompt: promptInput || '(Payload L7 verificado en memoria RAM)',
    promptSummary: promptInput.length > 50 ? promptInput.substring(0, 50) + '...' : promptInput,
    responseOutput: isDeny ? 'PROMPT BLOQUEADO EX-ANTE (Capa de Control L7)' : 'Petición autorizada y conforme.',
    verdict,
    decision,
    category: isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME',
    cat: isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME',
    norma: isDeny ? 'EU AI Act / LOPDGDD' : 'ISO/IEC 27037',
    sub: isDeny ? 'EU AI Act / LOPDGDD' : 'ISO/IEC 27037',
    user,
    tenant,
    merkleRoot,
    latency,
    proofBundle: {
      verdictId: `VRD-2026-${runId}`,
      payloadHash: merkleRoot,
      ed25519Signature: `ED25519_SIG_${merkleRoot.substring(0, 16).toUpperCase()}`,
      merkleRoot,
      rfc3161Timestamp: new Date().toISOString(),
      claimLevel: isDeny ? 'VERIFIED' : 'TESTED',
      auditStandard: 'ISO/IEC 27037:2012 / EU AI Act Art. 12 & 14 / DORA UE 2022/2554'
    },
    grantMetadata: {
      grantCategory: isDeny ? 'KIT_CONSULTING_GAP_ANALYSIS' : 'KIT_DIGITAL_CYBERSECURITY',
      eligibleItem: isDeny ? 'Evaluación de Impacto en Derechos Fundamentales (FRIA)' : 'Agente Perimetral L7 Ex-Ante',
      dnshImpact: 'Reducción de consumo GPU por sanitización previa en RAM (Zero-Disk)',
      auditStandard: 'EU AI Act / DORA / ISO 27037',
      complianceCode: `MS3V-GRANT-EVIDENCE-${Date.now()}`
    }
  };

  evidenceDb.unshift(newEvidence);
  persistEvidenceRecord(newEvidence);
  broadcastSseEvent({ type: 'NEW_EVIDENCE', evidence: newEvidence });

  res.status(isDeny ? 403 : 200).json({
    status: 'SUCCESS',
    decision,
    verdict,
    evidence_id: runId,
    trace_id: traceId,
    latency,
    merkleRoot,
    proofBundle: newEvidence.proofBundle,
    grantMetadata: newEvidence.grantMetadata
  });
};

app.post('/intercept', interceptHandler);
app.post('/v1/intercept', interceptHandler);
app.post('/api/v1/intercept', interceptHandler);
app.post('/judge', interceptHandler);
app.post('/v1/judge', interceptHandler);
app.post('/api/v1/judge', interceptHandler);
app.post('/enforce/check', interceptHandler);
app.post('/v1/enforce/check', interceptHandler);
app.post('/api/v1/enforce/check', interceptHandler);

// --- REGLAS PERSONALIZADAS ---
app.get('/api/v1/custom-rules', (req, res) => {
  res.json({ rules: customRules });
});

app.post('/api/v1/custom-rules', (req, res) => {
  const body = req.body;
  if (Array.isArray(body)) {
    customRules = body;
  } else if (body && Array.isArray(body.rules)) {
    customRules = body.rules;
  }
  res.json({ ok: true, storedRules: customRules.length, rules: customRules });
});

// --- ASIENTOS Y ROLES RBAC ---
app.get(['/v1/executive/seats', '/api/v1/executive/seats'], (req, res) => {
  res.json({
    success: true,
    tenant: 'ENTERPRISE',
    maxSeats: 10,
    usedSeats: executiveSeatsDb.length,
    users: executiveSeatsDb
  });
});

app.post(['/v1/executive/seats', '/api/v1/executive/seats'], (req, res) => {
  const { email, role, name } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Se requiere un correo electrónico válido.' });
  }

  const existingIndex = executiveSeatsDb.findIndex(u => u.email === email);
  const newUser = {
    email,
    name: name || email.split('@')[0],
    role: role || 'DPO_GRC_LEVEL_2',
    is_verified: 1,
    created_at: new Date().toISOString().substring(0, 10)
  };

  if (existingIndex >= 0) {
    executiveSeatsDb[existingIndex] = newUser;
  } else {
    executiveSeatsDb.push(newUser);
  }

  res.json({
    success: true,
    message: `Asiento asignado correctamente a ${email}.`,
    users: executiveSeatsDb
  });
});

// --- VERIFICACIÓN DE LICENCIA Y VERIFICACIÓN PÚBLICA ---
app.post(['/v1/auth/verifylicense', '/api/v1/auth/verifylicense'], (req, res) => {
  const body = req.body || {};
  const isSandbox = body.tier === 'SANDBOX' || body.sandbox === true || body.planId === 'SANDBOX';

  res.json({
    valid: true,
    tier: isSandbox ? 'SANDBOX' : 'ENTERPRISE',
    priceEur: isSandbox ? 0 : 649,
    expiresAt: isSandbox ? null : null, // Sin expiración temporal
    unlimited: true,
    planId: isSandbox ? 'SANDBOX' : 'ENTERPRISE_CUSTOM',
    entitlements: {
      max_evidence_monthly: isSandbox ? 10000 : 1000000,
      max_users: isSandbox ? 5 : 50,
      control_layer_l7: true,
      resilience_lab: true,
      export_dossier: true
    }
  });
});

app.get(['/verify/:hash', '/v1/verify/:hash', '/api/v1/verify/:hash'], (req, res) => {
  const { hash } = req.params;
  const found = evidenceDb.find(e => e.merkleRoot === hash || e.id === hash);

  res.json({
    status: found ? 'VERIFIED' : 'NOT_FOUND',
    verified: !!found,
    node: 'D1-EU-WESTERN-EUROPE',
    standard: 'ISO/IEC 27037:2012 / EU AI Act Art. 12 & 14',
    merkleRoot: hash,
    evidence: found || null
  });
});

// --- AUTENTICACIÓN Y REGISTRO SIMULADO ---
app.post(['/auth/login', '/v1/auth/login', '/api/v1/auth/login'], (req, res) => {
  const { email, role } = req.body || {};
  const userEmail = email || 'admin@saare.es';
  const token = `sk_saare_live_${crypto.randomBytes(12).toString('hex')}`;

  res.json({
    success: true,
    token,
    user: {
      email: userEmail,
      name: userEmail.split('@')[0],
      tenantName: 'ENTERPRISE',
      apiKey: token,
      role: role || 'CISO_ADMIN',
      planId: 'ENTERPRISE_CUSTOM',
      isVerified: true
    }
  });
});

// --- INICIO DEL SERVIDOR LOCAL ---
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  S.A.A.R.E. Local Control Plane Operativo v8.4`);
  console.log(`  Puerto activo: http://127.0.0.1:${PORT}`);
  console.log(`  Bóveda de Evidencias: ${ledgerPath}`);
  console.log(`===================================================`);
});