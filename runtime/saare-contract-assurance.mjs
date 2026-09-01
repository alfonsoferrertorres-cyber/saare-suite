import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log("===============================================================");
console.log(" SAARE SGP 1.0 — CONTRACT ASSURANCE & NO-FABRICATION CHECK");
console.log("===============================================================");

let violations = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.wrangler') continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.mjs')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Chequeo 1: Prohibido verdict_id como clave pública o asignación en código nuevo
      if (content.includes('"verdict_id"') || content.includes("'verdict_id'")) {
        console.error(`[FAIL] Legacy key 'verdict_id' detectada en: ${fullPath}`);
        violations++;
      }

      // Chequeo 2: Prohibido fabricar fallbacks para evidencia o firmas
      if (content.includes('data.signature ||') || content.includes('data.reasonCodes ||')) {
        console.error(`[FAIL] Fallback fabricado detectado en: ${fullPath}`);
        violations++;
      }
    }
  }
}

scanDir(rootDir);

if (violations > 0) {
  console.error(`\n❌ SE ENCONTRARON ${violations} VIOLACIONES DEL CONTRATO SGP 1.0.`);
  process.exit(1);
} else {
  console.log("\n✔ 0 VIOLACIONES DETECTADAS. CONTRATO CANÓNICO Y NO-FABRICACIÓN CONFIRMADOS.\n");
  process.exit(0);
}