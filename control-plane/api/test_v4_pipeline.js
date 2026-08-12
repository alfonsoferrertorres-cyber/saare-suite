import { MerkleVault } from './merkleVault.js';
import { HSMAdapter } from './hsmAdapter.js';

async function testFullV4Pipeline() {
  console.log('--- TEST INTEGRACION COMPLETA V4.0 (MERKLE + HSM) ---');
  
  const vault = new MerkleVault();
  const hsm = new HSMAdapter({ provider: 'AWS_KMS_FIPS_140_3' });

  // 1. Registrar eventos en el Merkle Tree
  vault.addEvidence({ event: 'L7_PII_BLOCKED', ip: '192.168.1.100' });
  vault.addEvidence({ event: 'OIDC_BEARER_AUTH', user: 'admin@saare.es' });
  
  const root = vault.getRoot();
  console.log('[1] Merkle Root:', root);

  // 2. Firmar la raiz de evidencias con HSM
  const signedReceipt = await hsm.sign(root);
  console.log('[2] Recibo HSM Generado:', {
    keyAlias: signedReceipt.keyAlias,
    algorithm: signedReceipt.algorithm,
    timestamp: signedReceipt.timestamp
  });

  // 3. Validar firma
  const valid = await hsm.verify(root, signedReceipt.signature, signedReceipt.publicKeyPem);
  console.log('[3] Estado Pipeline V4.0:', valid ? 'PASSED (200 OK)' : 'FAILED');
}

testFullV4Pipeline().catch(console.error);
