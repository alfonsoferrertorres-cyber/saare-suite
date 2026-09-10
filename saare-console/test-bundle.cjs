const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Configuración de rutas relativas desde saare-console
const bundleFiles = [
  // 1. Runtime
  { path: '../runtime/manifest.json', type: 'json' },
  { path: '../runtime/content-script.js', type: 'js' },
  { path: '../runtime/l7-hook.js', type: 'js' },
  { path: '../runtime/background.js', type: 'js' },
  { path: '../runtime/crypto-worker.js', type: 'js' },
  // 2. Control-Plane
  { path: '../runtime/telemetry-client.js', type: 'js' },
  { path: '../runtime/identity.js', type: 'js' },
  { path: '../runtime/token-vault.json', type: 'json' },
  // 3. SAARE-Console
  { path: './src/GovernanceToolbar.jsx', type: 'jsx' },
  { path: './src/App.jsx', type: 'jsx' }
];

console.log('🔍 INICIANDO AUDITORÍA MULTI-CAPA S.A.A.R.E...\n');

let errorsCount = 0;

bundleFiles.forEach(({ path: filePath, type }) => {
  const fullPath = path.resolve(__dirname, filePath);
  const fileName = path.basename(filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ [NO EXISTE]  -> ${fileName} (${filePath})`);
    errorsCount++;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8').trim();

  if (content.length === 0) {
    console.log(`⚠️  [VACÍO]     -> ${fileName}`);
    errorsCount++;
    return;
  }

  try {
    if (type === 'json') {
      JSON.parse(content);
      console.log(`✅ [OK - JSON]  -> ${fileName}`);
    } else if (type === 'js') {
      new vm.Script(content);
      console.log(`✅ [OK - JS]    -> ${fileName}`);
    } else if (type === 'jsx') {
      const strippedJsx = content.replace(/<[^>]+>/g, 'null');
      new vm.Script(strippedJsx);
      console.log(`✅ [OK - JSX]   -> ${fileName}`);
    }
  } catch (err) {
    console.log(`⚠️  [ERROR SINTAXIS] -> ${fileName}`);
    console.log(`    ↳ Detalle: ${err.message.split('\n')[0]}`);
    errorsCount++;
  }
});

console.log('\n----------------------------------------');
if (errorsCount === 0) {
  console.log('🎉 TODOS LOS ARCHIVOS DEL SISTEMA ESTÁN CORRECTAMENTE REDACTADOS.');
} else {
  console.log(`🚨 SE ENCONTRARON ${errorsCount} PROBLEMA(S) EN EL PAQUETE.`);
}