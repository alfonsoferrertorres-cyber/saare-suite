import { MerkleVault } from './merkleVault.js';

async function testMerkleVault() {
  console.log('--- TEST INTEGRACION V4.2 MERKLE VAULT ---');
  const vault = new MerkleVault();

  const leaf1 = vault.addEvidence({ id: 1, action: 'L7_PII_FILTER' });
  const leaf2 = vault.addEvidence({ id: 2, action: 'OIDC_CLAIM_AUTH' });
  const leaf3 = vault.addEvidence({ id: 3, action: 'HSM_SIGNATURE' });

  const merkleRoot = vault.getRoot();
  console.log('[1] Hojas procesadas:', vault.leaves.length);
  console.log('[2] Merkle Root Generado:', merkleRoot);
  console.log('[3] Estado WORM Vault:', merkleRoot ? 'PASSED (200 OK)' : 'FAILED');
}

testMerkleVault().catch(console.error);
