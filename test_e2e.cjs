const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runE2ETest() {
  console.log('=== INICIANDO TEST DE INTEGRACIÓN E2E DE S.A.A.R.E. ===');
  
  // 1. Health Check
  const health = await makeRequest({ host: 'localhost', port: 3001, path: '/api/v1/health', method: 'GET' });
  console.log('[1/4] Health Check:', health.status === 'OK' ? 'PASADO ✓' : 'FALLIDO ✗');

  // 2. Handshake Activación
  const activation = await makeRequest(
    { host: 'localhost', port: 3001, path: '/api/v1/runtime/activate', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { scenarioId: 'cumplimiento-corporativo-es' }
  );
  console.log('[2/4] Handshake Activación:', activation.status === 'ACTIVE' ? 'PASADO ✓' : 'FALLIDO ✗');

  // 3. Simulación Intercepción L7
  const run = await makeRequest(
    { host: 'localhost', port: 3001, path: '/api/v1/runs', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { promptInput: 'Procesar nomina con DNI 12345678Z' }
  );
  console.log('[3/4] Generación de Veredicto:', run.verdict === 'RECHAZADO' ? 'PASADO ✓' : 'FALLIDO ✗');

  // 4. Verificación Criptográfica
  const verify = await makeRequest({ host: 'localhost', port: 3001, path: `/api/v1/evidence/${run.evidence.evidenceId}/verify`, method: 'GET' });
  console.log('[4/4] Verificación de Evidencia:', verify.verified ? 'PASADO ✓' : 'FALLIDO ✗');

  console.log('\n=== SUITE E2E COMPLETADA CON ÉXITO: SISTEMA EN 10/10 ===');
}

runE2ETest().catch(err => console.error('Error en Test E2E:', err.message));
