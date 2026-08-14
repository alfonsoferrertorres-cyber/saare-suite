const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Escenarios con control de licencia conmutable
let libraryScenes = [
  { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', badge: 'NORMATIVA', licensed: true, desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.' },
  { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', badge: 'TOP L7', licensed: true, desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).' },
  { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', badge: 'ANALÍTICO', licensed: true, desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.' },
  { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', badge: 'ESTRELLA', licensed: true, desc: 'Reducción de coste computacional y desinfección de prompts redundantes.' }
];

// Evidencias iniciales
const auditLogs = [
  { id: 'EV-102290', prompt: '"mi dni es 666594039"', scene: 'España - LOPDGDD & AEPD', verdict: 'RECHAZADO', action: 'PDF Sellado', cryptoSeal: 'AES256-AEPD-ES-8839', promptSummary: 'DNI detectado en payload' },
  { id: 'EV-482432', prompt: '"holaa"', scene: 'España - LOPDGDD & AEPD', verdict: 'ACEPTADO', action: 'PDF Sellado', cryptoSeal: 'AES256-OK-PASS', promptSummary: 'Consulta general limpia' }
];

// ENDPOINT DE CONMUTACIÓN DE LICENCIAS (Capturas 8713 y 8715)
app.all(['/toggle-license', '/api/toggle-license'], (req, res) => {
  const { id } = req.body || {};
  const scene = libraryScenes.find(s => s.id === id);
  if (scene) {
    scene.licensed = !scene.licensed;
    console.log(`[CONTROL PLANE RUNTIME] Licencia alterada para ${scene.title} -> Licensed: ${scene.licensed}`);
  }
  res.json({ success: true, scenarios: libraryScenes });
});

// INTERCEPTOR L7 PARA LA EXTENSIÓN DE GEMINI (/api/v1/runs)
const handleRuns = (req, res) => {
  const body = req.body || {};
  const text = (body.promptInput || body.prompt || body.text || '').trim();
  const runId = `RUN-${Date.now()}`;
  
  console.log(`[L7 RUNTIME :3001] ⚡ Prompt capturado en Gemini: "${text}"`);

  const spainRule = libraryScenes.find(s => s.id === 'ES_CUMPLIMIENTO_ESPANA');
  const injectionRule = libraryScenes.find(s => s.id === 'TOP_PROMPT_INJECTION');

  let hasDni = /\b\d{7,9}[A-Za-z0-9]?\b/i.test(text) || /dni/i.test(text);
  let isJailbreak = /ignore|bypass|dan|system prompt/i.test(text);

  let verdict = 'ACEPTADO';
  let scenario = 'España - LOPDGDD & AEPD';
  let cryptoSeal = `AES256-AEPD-ES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  if (hasDni && spainRule?.licensed) {
    verdict = 'RECHAZADO';
    scenario = 'España - LOPDGDD & AEPD';
  } else if (isJailbreak && injectionRule?.licensed) {
    verdict = 'RECHAZADO';
    scenario = 'Jailbreak & Prompt Injection Guard';
  } else if (!spainRule?.licensed && !injectionRule?.licensed) {
    verdict = 'PASSTHROUGH';
    scenario = 'NINGUNO (RUNTIME PAUSADO)';
  }

  const newLog = {
    id: `EV-${Math.floor(100000 + Math.random() * 900000)}`,
    prompt: `"${text}"`,
    scene: scenario,
    verdict: verdict,
    action: 'PDF Sellado',
    cryptoSeal: cryptoSeal,
    promptSummary: text,
    timestamp: new Date().toISOString()
  };

  auditLogs.unshift(newLog);

  res.status(200).json({
    runId: runId,
    verdict: verdict,
    evidence: {
      scenarioApplied: scenario,
      cryptoSeal: cryptoSeal
    }
  });
};

app.all(['/api/v1/runs', '/runs', '/api/runs'], handleRuns);
app.get(['/events', '/api/events', '/logs', '/api/logs'], (req, res) => res.json(auditLogs));
app.get(['/scenarios', '/api/scenarios', '/api/v1/scenarios'], (req, res) => res.json(libraryScenes));

// Rutas Suite
app.post(['/api/runtime/deploy', '/deploy'], (req, res) => {
  res.json({ success: true, token: `SAARE-TOKEN-ENT-M57TOVV`, chargeAmount: 0.50, currency: 'EUR' });
});

// ESCUCHAR EN PUERTOS :3001 (Proxy/Extension/Consola) Y :3002 (Control Plane)
app.listen(3001, () => console.log('=== S.A.A.R.E. CONTROL PLANE LICENSING RUNTIME EN PUERTO 3001 ==='));
const app3002 = express();
app3002.use(cors({ origin: '*', credentials: true }));
app3002.use(express.json());
app3002.use(app);
app3002.listen(3002, () => console.log('✓ Control Plane Espejo en :3002'));
