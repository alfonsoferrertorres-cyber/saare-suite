import { HSMAdapter } from './hsmAdapter.js';

async function testHSMFlow() {
  console.log('--- TEST INTEGRACION V4.1 HSM/KMS ---');
  const hsm = new HSMAdapter({ provider: 'MOCK_AWS_KMS_FIPS' });
  
  const initResult = await hsm.initialize();
  console.log('[1] Inicializacion:', initResult);

  const payload = 'canonical-evidence-hash-v4-test';
  const receipt = await hsm.sign(payload);
  console.log('[2] Recibo de Firma Generado:', {
    algorithm: receipt.algorithm,
    provider: receipt.provider,
    signatureLength: receipt.signature.length
  });

  const isValid = await hsm.verify(payload, receipt.signature, receipt.publicKeyPem);
  console.log('[3] Verificacion Criptografica:', isValid ? 'PASSED (200 OK)' : 'FAILED');
}

testHSMFlow().catch(console.error);
