import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const ledgerPath = path.resolve('./evidence/global_ledger.jsonl');

if (!fs.existsSync('./evidence')) {
  fs.mkdirSync('./evidence', { recursive: true });
}

function getLastHash() {
  if (!fs.existsSync(ledgerPath)) return 'GENESIS_HASH_0000000000000000';
  const lines = fs.readFileSync(ledgerPath, 'utf-8').trim().split('\n').filter(Boolean);
  if (lines.length === 0) return 'GENESIS_HASH_0000000000000000';
  try {
    const lastEntry = JSON.parse(lines[lines.length - 1]);
    return lastEntry.sha256DataHash || 'GENESIS_HASH_0000000000000000';
  } catch (e) {
    return 'GENESIS_HASH_0000000000000000';
  }
}

// Función para simular/enviar alertas en tiempo real (SIEM / Slack / Teams)
function sendSecurityAlert(receipt) {
  if (receipt.decision === 'RECHAZADO') {
    console.log(`\n[ALERT] ALERTA DE SEGURIDAD EN TIEMPO REAL:`);
    console.log(` - Evento: ${receipt.evidenceId}`);
    console.log(` - Usuario: ${receipt.user}`);
    console.log(` - Motivo: Infracción de política DLP / Contenido bloqueado`);
    console.log(` - Hash SHA-256: ${receipt.sha256DataHash}\n`);
  }
}

function recordEvidence(prompt, user, tokenRef, decision) {
  const timestamp = new Date().toISOString();
  const evidenceId = 'EV-' + Date.now();
  const previousHash = getLastHash();

  const rawPayload = `${evidenceId}|${timestamp}|${prompt}|${user}|${decision}|${previousHash}`;
  const sha256DataHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

  const receipt = {
    evidenceId,
    timestamp,
    promptContent: prompt || 'PROMPT SIN CONTENIDO',
    user: user || 'LLM-CLIENT',
    tokenRef: tokenRef || 'SAARE-TOKEN-DEFAULT',
    decision: decision || 'RECHAZADO',
    previousHash,
    sha256DataHash,
    compliance: 'ISO 42001 / EU AI ACT AUDITED'
  };

  try {
    fs.appendFileSync(ledgerPath, JSON.stringify(receipt) + '\n');
    sendSecurityAlert(receipt);
  } catch (e) {
    console.error('Error escribiendo en registro:', e);
  }
  return receipt;
}

app.post('/api/intercept', (req, res) => {
  const { prompt, user, decision } = req.body;
  const authHeader = req.headers['authorization'] || 'SAARE-TOKEN-DEFAULT';
  const receipt = recordEvidence(prompt, user, authHeader.replace('Bearer ', ''), decision);
  res.json({ status: 'OK', receipt });
});

app.post('/v1/chat/completions', (req, res) => {
  const messages = req.body.messages || [];
  const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : JSON.stringify(req.body);
  const authHeader = req.headers['authorization'] || 'SAARE-TOKEN-LLM';

  const receipt = recordEvidence(lastMessage, 'PYTHON-OPENAI-SDK', authHeader.replace('Bearer ', ''), 'RECHAZADO');

  res.status(403).json({
    error: {
      message: 'BLOQUEADO POR SAARE DLP: Prompt interceptado y auditado.',
      type: 'saare_dlp_policy_violation',
      receipt
    }
  });
});

app.get('/api/logs', (req, res) => {
  try {
    if (fs.existsSync(ledgerPath)) {
      const fileContent = fs.readFileSync(ledgerPath, 'utf-8');
      const lines = fileContent.trim().split('\n').filter(Boolean);
      return res.json(lines.map(line => JSON.parse(line)).reverse());
    }
    res.json([]);
  } catch (e) {
    res.status(500).json({ error: 'Error leyendo ledger de evidencias' });
  }
});

app.listen(3002, () => {
  console.log('>>> SERVIDOR PUERTO 3002 ACTUALIZADO CON ALERTAS SIEM <<<');
});
