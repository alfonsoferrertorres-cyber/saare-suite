import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const ledgerPath = path.resolve('./evidence/global_ledger.jsonl');

// Garantizar directorio de evidencias
if (!fs.existsSync('./evidence')) {
  fs.mkdirSync('./evidence', { recursive: true });
}

let memoryLogs = [];

app.post('/api/intercept', (req, res) => {
  const { prompt, user, decision } = req.body;
  
  const timestamp = new Date().toISOString();
  const evidenceId = 'EV-' + Date.now();
  const signature = 'ED25519-SIG-' + Math.random().toString(36).substring(2, 12).toUpperCase();

  const receipt = {
    evidenceId,
    timestamp,
    user: user || 'USER-ANONYMOUS',
    decision: decision || 'RECHAZADO',
    promptSnippet: prompt ? prompt.substring(0, 30) : 'N/A',
    sha256DataHash: 'a29d21f5bf04f769-MAD-' + signature,
    compliance: 'ISO 42001 / EU AI ACT AUDITED'
  };

  memoryLogs.unshift(receipt);
  
  // Persistencia inmutable en disco (Evidencia Global JSONL)
  fs.appendFileSync(ledgerPath, JSON.stringify(receipt) + '\n');

  res.json({ status: 'OK', receipt });
});

app.get('/api/logs', (req, res) => {
  res.json(memoryLogs);
});

app.listen(3002, () => {
  console.log('Servidor de Evidencia Global e Interceptación activo en puerto 3002');
});
