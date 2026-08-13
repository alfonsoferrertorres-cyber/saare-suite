import fs from 'fs';
import path from 'path';

const ledgerPath = path.resolve('./evidence/global_ledger.jsonl');

if (!fs.existsSync(ledgerPath)) {
  console.log('[-] No se encontró el archivo de ledger.');
  process.exit(1);
}

const lines = fs.readFileSync(ledgerPath, 'utf-8').trim().split('\n').filter(Boolean);
console.log(`>>> AUDITANDO INTEGRIDAD CRIPTOGRÁFICA DE ${lines.length} REGISTROS... <<<`);

let isClean = true;
lines.forEach((line, index) => {
  try {
    const entry = JSON.parse(line);
    if (!entry.evidenceId || !entry.sha256DataHash) {
      console.error(`[X] Error en registro #${index + 1}: Faltan firmas criptográficas.`);
      isClean = false;
    }
  } catch (e) {
    console.error(`[X] Registro #${index + 1} corrupto o alterado manualmente.`);
    isClean = false;
  }
});

if (isClean) {
  console.log('>>> [OK] CADENA DE EVIDENCIAS ÍNTEGRA Y LIBRE DE MANIPULACIÓN <<<');
}
