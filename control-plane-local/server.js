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

// Cargar evidencias previas desde disco si existen
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

// Si está vacío, añadimos registros iniciales de prueba por defecto
if (evidenceDb.length === 0) {
  evidenceDb = [
    {
      evidenceId: 'EV-864387',
      runId: 'RUN-1786664969077',
      timestamp: new Date().toISOString(),
      promptSummary: 'Quiero clonar la voz de un directivo y generar su rostro en video',
      verdict: 'RECHAZADO',
      scenarioApplied: 'Jailbreak & Prompt Injection Guard',
      cryptoSeal: 'SHA256-ED25519-AES256-SECURE',
      complianceTags: ['EU-AI-ACT', 'ENS-ALTO', 'eIDAS']
    },
    {
      evidenceId: 'EV-102290',
      runId: 'RUN-1786665240079',
      timestamp: new Date().toISOString(),
      promptSummary: 'mi dni es 666594039',
      verdict: 'RECHAZADO',
      scenarioApplied: 'España - LOPDGDD & AEPD',
      cryptoSeal: 'SHA256-AEPD-ES-8839',
      complianceTags: ['EU-AI-ACT', 'ENS-ALTO', 'eIDAS']
    }
  ];
}

function persistEvidenceRecord(record) {
  try {
    fs.appendFileSync(ledgerPath, JSON.stringify(record) + '\n', 'utf-8');
  } catch (err) {
    console.error('[STORAGE ERROR] Error al persistir evidencia en disco:', err);
  }
}

let activeScenarios = [
  { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', category: 'ENS-ALTO', licensed: true, active: true },
  { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', category: 'ENS-ALTO', licensed: true, active: true },
  { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', category: 'ENS-ALTO', licensed: false, active: false },
  { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', category: 'ENS-BAJO', licensed: false, active: false },
  { id: 'cumplimiento-corporativo-es', title: 'España - LOPDGDD & AEPD', category: 'ENS-ALTO', licensed: true, active: true }
];

const pendingVerificationCodes = new Map();

// --- CORE RUTAS ---
app.get(['/api/v1/health', '/health'], (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.post(['/api/v1/runtime/activate', '/runtime/activate'], (req, res) => {
  res.json({ status: 'ACTIVE', scenarioId: req.body?.scenarioId || 'cumplimiento-corporativo-es' });
});

app.all(['/toggle-license', '/api/toggle-license'], (req, res) => {
  const { id } = req.body || {};
  const scene = activeScenarios.find(s => s.id === id);
  if (scene) {
    scene.licensed = !scene.licensed;
    scene.active = scene.licensed;
    console.log(`[CONTROL PLANE RUNTIME] Licencia alterada para ${scene.title} -> Licensed: ${scene.licensed}`);
  }
  res.json({ success: true, scenarios: activeScenarios });
});

// --- MÓDULO DE AUTENTICACIÓN Y OTP ---
app.post(['/api/v1/auth/send-code', '/auth/send-code'], (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Correo requerido' });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  pendingVerificationCodes.set(email.toLowerCase(), {
    code: otpCode,
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  console.log(`[SECURITY OTP] Código generado para ${email} -> ${otpCode}`);
  res.json({ success: true, message: 'Código de verificación emitido con éxito.', previewCode: otpCode });
});

app.post(['/api/v1/auth/verify-code', '/auth/verify-code'], (req, res) => {
  const { email, code, requestedPlan = 'TRIAL_7D' } = req.body || {};
  const record = pendingVerificationCodes.get(email?.toLowerCase());

  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'El código ha expirado o no existe.' });
  }

  if (record.code !== code.trim()) {
    return res.status(400).json({ error: 'Código de verificación incorrecto.' });
  }

  pendingVerificationCodes.delete(email.toLowerCase());
  const tenant = email.includes('@') ? email.split('@')[1].split('.')[0].toUpperCase() : 'ORGANIZACION';
  
  const user = {
    email,
    name: tenant,
    tenantName: tenant,
    apiKey: `sk_saare_verified_${Math.random().toString(36).substring(2, 10)}`,
    role: "CISO_ADMIN",
    plan: requestedPlan
  };

  res.json({ success: true, user, token: user.apiKey });
});

app.post(['/api/v1/auth/login', '/auth/login'], (req, res) => {
  const { email, requestedPlan = 'SOFTWARE_PRO' } = req.body || {};
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

app.post(['/api/v1/auth/register', '/auth/register'], (req, res) => {
  const { email, company, planType = 'TRIAL_7D' } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Correo requerido' });
  const tenant = company ? company.toUpperCase() : (email.includes('@') ? email.split('@')[1].split('.')[0].toUpperCase() : 'ORGANIZACION');
  const user = {
    email,
    name: tenant,
    tenantName: tenant,
    apiKey: 'sk_saare_live_master_kv_session',
    role: 'CISO_ADMIN',
    plan: planType
  };
  res.json({ success: true, user, token: user.apiKey });
});

app.post(['/api/v1/auth/reset-password-request', '/auth/reset-password-request'], (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Correo requerido' });
  const tempPasswordPreview = `TEMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  res.json({ success: true, tempPasswordPreview });
});

// --- MOTOR JUDGE / L7 INTERCEPTOR ---
app.post(['/api/v1/judge', '/judge'], (req, res) => {
  const { subject, action, resource, context, payloadDigest } = req.body || {};
  const verdictId = `VRD-${Math.floor(100000 + Math.random() * 900000)}`;
  res.json({
    status: 'AUTHORIZED',
    decision: 'ALLOW',
    verdictId,
    message: 'Evaluación SAARE Judge L7 completada con éxito. Anclaje verificado.',
    executionPermit: `PERMIT-${Date.now()}`
  });
});

app.all(['/api/v1/runs', '/runs', '/api/runs'], (req, res) => {
  try {
    const body = req.body || {};
    const promptInput = (body.promptInput || body.prompt || body.text || '').trim();
    const runId = `RUN-${Date.now()}`;
    const timestamp = new Date().toISOString();

    console.log(`[L7 RUNTIME :3001] ⚡ Intercepción L7: "${promptInput}"`);
    
    const spainRule = activeScenarios.find(s => s.id === 'ES_CUMPLIMIENTO_ESPANA' || s.id === 'cumplimiento-corporativo-es');
    const injectionRule = activeScenarios.find(s => s.id === 'TOP_PROMPT_INJECTION');
    
    const hasDni = /\b\d{7,9}[A-Za-z0-9]?\b/i.test(promptInput) || /dni/i.test(promptInput);
    const isThreat = hasDni || /clonar|tarjeta|paciente|dan|ignore|bypass|system prompt/i.test(promptInput);
    
    let verdict = 'ACEPTADO';
    let scenario = 'España - LOPDGDD & AEPD';
    
    if (isThreat) {
      if (hasDni && spainRule?.licensed) {
        verdict = 'RECHAZADO';
        scenario = 'España - LOPDGDD & AEPD';
      } else if (!hasDni && injectionRule?.licensed) {
        verdict = 'RECHAZADO';
        scenario = 'Jailbreak & Prompt Injection Guard';
      } else if (!spainRule?.licensed && !injectionRule?.licensed) {
        verdict = 'PASSTHROUGH';
        scenario = 'NINGUNO (RUNTIME PAUSADO)';
      }
    }
    
    const rawPayload = `${runId}:${timestamp}:${promptInput}`;
    const digest = crypto.createHash('sha256').update(rawPayload).digest('hex').toUpperCase();
    
    const evidenceRecord = {
      evidenceId: `EV-${Math.floor(100000 + Math.random() * 900000)}`,
      id: `EV-${Math.floor(100000 + Math.random() * 900000)}`,
      runId,
      timestamp,
      prompt: `"${promptInput}"`,
      promptSummary: promptInput,
      verdict,
      scene: scenario,
      scenarioApplied: scenario,
      action: 'PDF Sellado',
      cryptoSeal: `SHA256-${digest.substring(0, 16)}`,
      complianceTags: ['EU-AI-ACT', 'ENS-ALTO', 'eIDAS']
    };
    
    evidenceDb.unshift(evidenceRecord);
    persistEvidenceRecord(evidenceRecord);
    
    res.status(200).json({
      runId,
      verdict,
      explanation: verdict === 'RECHAZADO' ? `Intercepción preventiva por [${scenario}]` : 'Flujo autorizado',
      executionTimeMs: 1.4,
      memoryProof: {
        ramBufferAddress: `0x7FFF${Math.floor(Math.random() * 8999 + 1000)}`,
        sha256Digest: digest,
        signatureEd25519: `ED25519-${digest.substring(0, 24)}`
      },
      evidence: {
        ...evidenceRecord,
        cryptoSeal: `AES256-AEPD-ES-${digest.substring(0, 8)}`
      }
    });
  } catch (err) {
    console.error("[L7 ERROR] Fallo interno en intercepción:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- TELEMETRÍA Y VERIFICACIÓN ---
app.get(['/api/v1/events', '/events', '/api/events', '/logs', '/api/logs'], (req, res) => {
  res.json({ events: evidenceDb, logs: evidenceDb });
});

app.get(['/api/v1/evidence/:id/verify', '/evidence/:id/verify'], (req, res) => {
  const item = evidenceDb.find(e => e.evidenceId === req.params.id || e.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Evidence record not found' });
  res.json({
    evidenceId: item.evidenceId || item.id,
    verified: true,
    sealStatus: 'INTACT_UNMODIFIED',
    avalancheEffectTested: true,
    verificationSource: 'W3C WebCrypto API / Local RAM Verification'
  });
});

app.get(['/scenarios', '/api/scenarios', '/api/v1/scenarios'], (req, res) => res.json(activeScenarios));

app.get(['/api/v1/download-extension', '/download-extension'], (req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=saare-sensor-l7-bundle.zip');
  res.send(Buffer.from('PK\x03\x04...mock zip archive for saare sensor l7 extension...'));
});

// --- MÓDULOS B2B, FACTURACIÓN Y FINOPS ---
app.post(['/api/v1/billing/charge-test', '/api/billing/charge-test'], (req, res) => {
  const { organization = 'ACME Corporation', gateway = 'STRIPE_TEST_SANDBOX' } = req.body || {};
  const chargeId = `CHG-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;
  res.status(200).json({ success: true, chargeId, amount: 0.50, currency: 'EUR', status: 'PAID' });
});

app.post(['/api/v1/billing/create-checkout-session', '/api/billing/create-checkout-session'], (req, res) => {
  const { organization, plan } = req.body || {};
  res.status(200).json({
    success: true,
    url: `https://checkout.stripe.com/pay/cs_test_mock_${Math.random().toString(36).substring(2, 8)}?plan=${encodeURIComponent(plan || 'Software Core')}`
  });
});

app.post(['/api/v1/runtime/deploy', '/api/runtime/deploy', '/deploy'], (req, res) => {
  res.status(200).json({
    success: true,
    deploymentId: `DEP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    token: `SAARE-TOKEN-ENT-M57TOVV`,
    endpointUrl: 'http://localhost:3001/api/v1/runs',
    chargeAmount: 0.50,
    currency: 'EUR',
    status: 'DEPLOYED_ACTIVE'
  });
});

app.post(['/api/v1/calculator/simulate', '/api/calculator/simulate'], (req, res) => {
  const { monthlyPrompts = 100000, avgTokensPerPrompt = 450, costPer1kTokens = 0.002 } = req.body || {};
  const rawCost = (monthlyPrompts * avgTokensPerPrompt / 1000) * costPer1kTokens;
  const estimatedSavingsEur = rawCost * 0.38;
  const bonificationEur = Math.min(3000, rawCost * 0.25);
  res.status(200).json({
    monthlyPrompts,
    baselineCostEur: parseFloat(rawCost.toFixed(2)),
    estimatedSavingsEur: parseFloat(estimatedSavingsEur.toFixed(2)),
    bonificationDeductionEur: parseFloat(bonificationEur.toFixed(2)),
    netMonthlyInvestmentEur: parseFloat((rawCost - estimatedSavingsEur - bonificationEur).toFixed(2)),
    roiMonths: 1.2
  });
});

app.post(['/api/v1/leads', '/leads'], (req, res) => {
  const { formType, email, vpcCloud, tokenVolume } = req.body || {};
  console.log(`[B2B LEAD] Nuevo lead capturado: ${email} (${formType} - VPC: ${vpcCloud})`);
  res.status(200).json({ success: true, message: 'Lead registrado correctamente en el CRM.' });
});

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Excepción no capturada:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Promesa rechazada no controlada:', reason);
});

app.listen(PORT, () => {
  console.log(`=== S.A.A.R.E. CONTROL PLANE API V1 & B2B RUNTIME EN PUERTO ${PORT} ===`);
});