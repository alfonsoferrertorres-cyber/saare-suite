import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log("===============================================================");
console.log(" SAARE SGP 1.0 — CONTRACT ASSURANCE & NO-FABRICATION CHECK");
console.log("===============================================================");

let violations = 0;

// Patrones prohibidos en el código fuente de producción
const FORBIDDEN_PATTERNS = [
  { pattern: /"verdict_id"/g, name: 'Legacy key "verdict_id"' },
  { pattern: /'verdict_id'/g, name: "Legacy key 'verdict_id'" },
  { pattern: /data\.signature\s*\|\|/g, name: "Fallback fabricado en signature" },
  { pattern: /data\.reasonCodes\s*\|\|/g, name: "Fallback fabricado en reasonCodes" }
];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    // Excluir dependencias, carpetas de compilación y herramientas de testeo/assurance
    if (
      file === 'node_modules' || 
      file === '.git' || 
      file === 'dist' || 
      file === '.wrangler' ||
      file === 'saare-contract-assurance.mjs' ||
      file === 'resilienceGate.js' ||
      file === 'test-saare-e2e.ps1'
    ) {
      continue;
    }
    
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.mjs')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      FORBIDDEN_PATTERNS.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
          console.error(`[FAIL] ${name} detectada en: ${fullPath}`);
          violations++;
        }
      });
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