const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Lista de archivos a auditar por capas
const bundleFiles = [
  // 1. Runtime
  { path: 'manifest.json', type: 'json' },
  { path: 'content-script.js', type: 'js' },
  { path: 'l7-hook.js', type: 'js' },
  { path: 'background.js', type: 'js' },
  { path: 'crypto-worker.js', type: 'js' },
  // 2. Control-Plane
  { path: 'telemetry-client.js', type: 'js' },
  { path: 'identity.js', type: 'js' },
  { path: 'token-vault.json', type: 'json' },
  // 3. SAARE-Console
  { path: 'GovernanceToolbar.jsx', type: 'jsx' },
  { path: 'App.jsx', type: 'jsx' }
];

console.log('🔍 INICIANDO AUDITORÍA DE ARCHIVOS DEL PAQUETE S.A.A.R.E...\n');

let errorsCount = 0;

bundleFiles.forEach(({ path: filePath, type }) => {
  const fullPath = path.resolve(filePath);

  // 1. Verificar existencia
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ [NO EXISTE]  -> ${filePath}`);
    errorsCount++;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8').trim();

  if (content.length === 0) {
    console.log(`⚠️  [VACÍO]     -> ${filePath}`);
    errorsCount++;
    return;
  }

  // 2. Verificar sintaxis según tipo
  try {
    if (type === 'json') {
      JSON.parse(content);
      console.log(`✅ [OK - JSON]  -> ${filePath}`);
    } else if (type === 'js') {
      // Intenta compilar el script JS en un contexto VM
      new vm.Script(content);
      console.log(`✅ [OK - JS]    -> ${filePath}`);
    } else if (type === 'jsx') {
      // Reemplazo básico de JSX para validar la estructura base de JS
      const strippedJsx = content.replace(/<[^>]+>/g, 'null');
      new vm.Script(strippedJsx);
      console.log(`✅ [OK - JSX]   -> ${filePath}`);
    }
  } catch (err) {
    console.log(`⚠️  [ERROR SINTAXIS] -> ${filePath}`);
    console.log(`    ↳ Detalle: ${err.message.split('\n')[0]}`);
    errorsCount++;
  }
});

console.log('\n----------------------------------------');
if (errorsCount === 0) {
  console.log('🎉 TODOS LOS ARCHIVOS ESTÁN CORRECTAMENTE REDACTADOS.');
} else {
  console.log(`🚨 SE ENCONTRARON ${errorsCount} PROBLEMA(S) EN EL PAQUETE.`);
}