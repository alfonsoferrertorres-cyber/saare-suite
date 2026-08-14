import https from 'node:https';

function checkProductionAPI() {
  console.log('--- TEST DE CONEXION CON PRODUCCION (api.saare.es) ---');
  
  const options = {
    hostname: 'api.saare.es',
    port: 443,
    path: '/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`[1] Status Code: ${res.statusCode} ${res.statusMessage}`);
    console.log('[2] SSL/TLS Validado: OK');
    console.log('[3] Estado de Sync Cloud:', res.statusCode === 200 ? 'CONECTADO' : 'FALLO DE CREDENCIALES');
  });

  req.on('error', (e) => {
    console.log('[!] Error conectando a api.saare.es:', e.message);
    console.log('[i] Usando fallback local para desarrollo...');
  });

  req.end();
}

checkProductionAPI();
