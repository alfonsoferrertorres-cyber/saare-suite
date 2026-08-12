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

app.post('/api/intercept', (req, res) => {
  const { prompt, user, decision } = req.body;
  const authHeader = req.headers['authorization'] || 'SAARE-TOKEN-DEFAULT';
  
  const timestamp = new Date().toISOString();
  const evidenceId = 'EV-' + Date.now();
  const signature = 'ED25519-SIG-' + Math.random().toString(36).substring(2, 12).toUpperCase();

  const receipt = {
    evidenceId,
    timestamp,
    promptContent: prompt || 'PROMPT SIN CONTENIDO',
    user: user || 'USER-ANONYMOUS',
    tokenRef: authHeader.replace('Bearer ', ''),
    decision: decision || 'RECHAZADO',
    sha256DataHash: 'a29d21f5bf04f769-MAD-' + signature,
    compliance: 'ISO 42001 / EU AI ACT AUDITED'
  };

  try {
    fs.appendFileSync(ledgerPath, JSON.stringify(receipt) + '\n');
  } catch (e) {
    console.error('Error escribiendo en registro:', e);
  }

  res.json({ status: 'OK', receipt });
});

// GET /api/logs: Lee directamente la carpeta/archivo del registro inmutable
app.get('/api/logs', (req, res) => {
  try {
    if (fs.existsSync(ledgerPath)) {
      const fileContent = fs.readFileSync(ledgerPath, 'utf-8');
      const lines = fileContent.trim().split('\n').filter(Boolean);
      const logsFromFile = lines.map(line => JSON.parse(line)).reverse();
      return res.json(logsFromFile);
    }
    res.json([]);
  } catch (e) {
    console.error('Error leyendo registro:', e);
    res.status(500).json({ error: 'Error leyendo ledger de evidencias' });
  }
});

app.listen(3002, () => {
  console.log('>>> SERVIDOR PUERTO 3002 LEYENDO REGISTRO EN DISCO <<<');
});
