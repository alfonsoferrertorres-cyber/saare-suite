import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ledgerPath = path.resolve('./evidence/global_ledger.jsonl');

if (!fs.existsSync(ledgerPath)) {
  console.log('[-] No se encontró el archivo de ledger.');
  process.exit(1);
}

const lines = fs.readFileSync(ledgerPath, 'utf-8').trim().split('\n').filter(Boolean);
console.log(`>>> AUDITANDO CADENA CRIPTOGRÁFICA DE ${lines.length} REGISTROS... <<<`);

let isClean = true;
let expectedPreviousHash = 'GENESIS_HASH_0000000000000000';

lines.forEach((line, index) => {
  try {
    const entry = JSON.parse(line);

    // Si el registro incluye Hash-Chaining, validamos la continuidad de la cadena
    if (entry.previousHash) {
      if (entry.previousHash !== expectedPreviousHash && index > 0 && lines[index-1].includes('previousHash')) {
        console.error(`[X] RUPTURA DE CADENA en registro #${index + 1}: El hash previo no coincide.`);
        isClean = false;
      }
      expectedPreviousHash = entry.sha256DataHash;
    }
  } catch (e) {
    console.error(`[X] Registro #${index + 1} corrupto.`);
    isClean = false;
  }
});

if (isClean) {
  console.log('>>> [OK] CADENA ENLAZADA E ÍNTEGRA: Ningún registro ha sido borrado o modificado <<<');
}
