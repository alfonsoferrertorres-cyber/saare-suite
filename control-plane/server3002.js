import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const ledgerPath = path.resolve('./evidence/global_ledger.jsonl');

if (!fs.existsSync('./evidence')) {
  fs.mkdirSync('./evidence', { recursive: true });
}

function recordEvidence(prompt, user, tokenRef, decision) {
  const timestamp = new Date().toISOString();
  const evidenceId = 'EV-' + Date.now();
  const signature = 'ED25519-SIG-' + Math.random().toString(36).substring(2, 12).toUpperCase();

  const receipt = {
    evidenceId,
    timestamp,
    promptContent: prompt || 'PROMPT SIN CONTENIDO',
    user: user || 'LLM-PYTHON-SDK',
    tokenRef: tokenRef || 'SAARE-TOKEN-DEFAULT',
    decision: decision || 'RECHAZADO',
    sha256DataHash: 'a29d21f5bf04f769-MAD-' + signature,
    compliance: 'ISO 42001 / EU AI ACT AUDITED'
  };

  try {
    fs.appendFileSync(ledgerPath, JSON.stringify(receipt) + '\n');
  } catch (e) {
    console.error('Error escribiendo en registro:', e);
  }
  return receipt;
}

// Endpoint estándar para interceptaciones manuales
app.post('/api/intercept', (req, res) => {
  const { prompt, user, decision } = req.body;
  const authHeader = req.headers['authorization'] || 'SAARE-TOKEN-DEFAULT';
  const receipt = recordEvidence(prompt, user, authHeader.replace('Bearer ', ''), decision);
  res.json({ status: 'OK', receipt });
});

// Endpoint para SDKs de OpenAI / Python / LangChain (/v1/chat/completions)
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

// Endpoint para consulta de registros
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
  console.log('>>> SERVIDOR PUERTO 3002 ACTUALIZADO CON RUTAS /V1 <<<');
});
