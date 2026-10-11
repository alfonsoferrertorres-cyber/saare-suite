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

let activeScenarios = [
  { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', category: 'ENS-ALTO', licensed: true, active: true },
  { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', category: 'ENS-ALTO', licensed: true, active: true },
  { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', category: 'ENS-ALTO', licensed: false, active: false },
  { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', category: 'ENS-BAJO', licensed: false, active: false }
];

// --- RUTAS DE SALUD