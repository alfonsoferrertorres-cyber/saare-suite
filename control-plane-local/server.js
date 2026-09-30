import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', credentials: true }));
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
      evidenceId: 'EV-864387',
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
        claimLevel: 'VERIFIED'
      }
    },
    {
      id: 'EV-102290',
      evidenceId: 'EV-102290',
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
        claimLevel: 'VERIFIED'
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

// --- SSE CLIENTS STORE ---
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

// --- REGLAS Y DIRECTIVAS ---
let customRules = [
  { id: 'RULE-1', name: 'Tokens de API Abiertos', pattern: 'sk-proj-[a-zA-Z0-9]+', created: new Date().toISOString() }
];

let activeScenarios = [
  { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', category: 'ENS-ALTO', licensed: true, active: true },
  { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', category: 'ENS-ALTO', licensed: true, active: true },
  { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', category: 'ENS-ALTO', licensed: false, active: false },
  { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', category: 'ENS-BAJO', licensed: false, active: false },
  { id: 'cumplimiento-corporativo-es', title: 'España - LOPDGDD & AEPD', category: 'ENS-ALTO', licensed: true, active: true }
];

const pendingVerificationCodes = new Map();

// --- RUTAS DE SALUD Y CONTROL ---
app.get(['/api/v1/health', '/health'], (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'control-plane-local' }));

// --- TELEMETRÍA SSE STREAMING ---
app.get(['/telemetry/stream', '/api/v1/telemetry/stream'], (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Enviar estado inicial
  res.write(`data: ${JSON.stringify({ status: 'RUNTIME_ACTIVE', evidences: evidenceDb })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// --- LECTURA DE TELEMETRÍA DE CORRIDAS / EVIDENCIAS ---
app.get(['/api/v1/runs', '/runs', '/api/runs'], (req, res) => {
  res.json({
    evidences: evidenceDb,
    runs: evidenceDb,
    vaultSource: 'LOCAL_D1_EMULATOR',
    total: evidenceDb.length
  });
});

// --- EXECUTION / L7 INTERCEPTOR ---
const processInterception = (promptInput, user = 'ciso@empresa.com', tenant = 'ENTERPRISE') => {
  const runId = `RUN-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const evidenceId = `EV-L7-${Math.floor(100000 + Math.random() * 899999)}`;

  const hasDni = /\b\d{7,8}[A-Za-z]\b/i.test(promptInput) || /dni/i.test(promptInput);
  const hasIban = /\b[A-Z]{2}\d{2}[\s-]?(?:\d{4}[\s-]?){4}\d{2,4}\b/i.test(promptInput);
  const isJailbreak = /ignore previous instructions|system prompt|jailbreak|bypass|drop table|clonar|tarjeta/i.test(promptInput);

  let isDeny = hasDni || hasIban || isJailbreak;

  // Verificar reglas personalizadas
  customRules.forEach(rule => {
    if (rule.pattern) {
      try {
        const reg = new RegExp(rule.pattern, 'gi');
        if (reg.test(promptInput)) isDeny = true;
      } catch (e) {}
    }
  });

  const rawPayload = `${runId}:${timestamp}:${promptInput}`;
  const merkleRoot = crypto.createHash('sha256').update(rawPayload).digest('hex');

  const evidenceRecord = {
    id: evidenceId,
    evidence_id: evidenceId,
    runId,
    timestamp,
    rawTimestamp: timestamp,
    prompt: promptInput,
    promptSummary: promptInput,
    verdict: isDeny ? 'RECHAZADO' : 'PERMITIDO',
    decision: isDeny ? 'DENY' : 'ALLOW',
    category: isDeny ? 'PII_OR_POLICY_VIOLATION' : 'AUDITORIA_CONFORME',
    cat: isDeny ? 'PII_OR_POLICY_VIOLATION' : 'AUDITORIA_CONFORME',
    norma: isDeny ? 'EU Regulation 2022/2554 (DORA) / LOPDGDD' : 'EU AI Act - Conforme',
    sub: isDeny ? 'EU Regulation 2022/2554 (DORA) / LOPDGDD' : 'EU AI Act - Conforme',
    user,
    tenant,
    merkleRoot,
    latency: Math.floor(8 + Math.random() * 20),
    proofBundle: {
      verdictId: `VRD-2026-${evidenceId}`,
      payloadHash: merkleRoot,
      ed25519Signature: `ED25519_SIG_${merkleRoot.substring(0, 16).toUpperCase()}`,
      merkleRoot,
      rfc3161Timestamp: timestamp,
      claimLevel: isDeny ? 'VERIFIED' : 'TESTED'
    }
  };

  evidenceDb.unshift(evidenceRecord);
  persistEvidenceRecord(evidenceRecord);
  broadcastSseEvent({ status: 'NEW_EVIDENCE', evidences: evidenceDb });

  return evidenceRecord;
};

app.post(['/api/v1/intercept', '/intercept', '/api/v1/runs', '/runs', '/api/runs'], (req, res) => {
  const body = req.body || {};
  const prompt = (body.prompt || body.promptInput || body.text || '').trim();
  const user = body.user || 'ciso@empresa.com';
  const tenant = body.tenant || 'ENTERPRISE';

  if (!prompt) {
    return res.status(400).json({ error: 'Payload prompt requerido para evaluación.' });
  }

  const record = processInterception(prompt, user, tenant);

  if (record.decision === 'DENY') {
    return res.status(403).json(record);
  }

  res.json(record);
});

// --- GESTIÓN DE REGLAS PERSONALIZADAS ---
app.get(['/custom-rules', '/api/v1/custom-rules'], (req, res) => {
  res.json({ rules: customRules });
});

app.post(['/custom-rules', '/api/v1/custom-rules'], (req, res) => {
  const { rules } = req.body || {};
  if (Array.isArray(rules)) {
    customRules = rules;
  }
  res.json({ success: true, rules: customRules });
});

// --- SINK Y VERIFICACIÓN BÓVEDA ---
app.get(['/vault/sync', '/api/v1/vault/sync'], (req, res) => {
  res.json({ success: true, source: 'LOCAL_D1_EMULATOR', syncedRecords: evidenceDb.length });
});

app.get(['/verify/:hash', '/api/v1/verify/:hash'], (req, res) => {
  const targetHash = req.params.hash;
  const found = evidenceDb.find(e => e.merkleRoot === targetHash || e.id === targetHash || e.evidence_id === targetHash);

  if (found) {
    res.json({
      verified: true,
      status: 'VERIFIED',
      node: 'SAARE-TRUST-ANCHOR-LOCAL',
      standard: 'ISO/IEC 27037:2012 / EU AI Act / DORA',
      timestamp: found.timestamp,
      evidence: found,
      message: 'Sello e inmutabilidad acreditados contra el Trust Anchor.'
    });
  } else {
    res.status(404).json({
      verified: false,
      status: 'FAILED_NOT_FOUND',
      error: 'El hash especificado no está registrado en la Bóveda.'
    });
  }
});

// --- SIMULADOR DE RESILIENCIA Y SIEM ---
app.post(['/resilience/check', '/api/v1/resilience/check'], (req, res) => {
  const { scenario = 'PROMPT_INJECTION' } = req.body || {};
  res.json({
    verdict: 'PASS',
    status: 'RESILIENT',
    scenarioEvaluated: scenario,
    invariantsTested: ['0x01_RAM_INSPECTION', '0x02_CRYPTO_ANCHOR', '0x03_FAIL_CLOSED'],
    timestamp: new Date().toISOString()
  });
});

app.post(['/integrations/siem', '/api/v1/integrations/siem'], (req, res) => {
  const { evidenceId, blockedPayload } = req.body || {};
  console.log(`[SIEM NOTIFY] Evento notificado para ${evidenceId}: ${blockedPayload}`);
  res.json({ success: true, eventId: `SIEM-EV-${Math.floor(1000 + Math.random() * 9000)}` });
});

// --- AUTENTICACIÓN, LICENCIAS Y TRIAL ---
app.post(['/api/v1/auth/verifylicense', '/auth/verifylicense'], (req, res) => {
  res.json({ valid: true, success: true, licenseType: 'ENTERPRISE_UNLIMITED' });
});

app.post(['/api/v1/trial', '/trial'], (req, res) => {
  const { email, company, planType = 'TRIAL_PRO_7D' } = req.body || {};
  res.json({
    success: true,
    trialId: `TR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    organization: company || email,
    plan: planType
  });
});

app.post(['/api/v1/auth/login', '/auth/login'], (req, res) => {
  const { email, requestedPlan = 'ENTERPRISE_1500' } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Correo requerido' });
  const tenant = email.includes('@') ? email.split('@')[1].split('.')[0].toUpperCase() : 'ORGANIZACION';
  const user = {
    email,
    name: tenant,
    tenantName: tenant,
    apiKey: 'sk_saare_live_master_kv_session',
    role: 'CISO_ADMIN',
    plan: requestedPlan
  };
  res.json({ success: true, user, token: user.apiKey });
});

app.get(['/scenarios', '/api/scenarios', '/api/v1/scenarios'], (req, res) => res.json(activeScenarios));

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Excepción no controlada:', err);
});

app.listen(PORT, () => {
  console.log(`=== S.A.A.R.E. CONTROL PLANE LOCAL V1 EN PUERTO ${PORT} ===`);
});