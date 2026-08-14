import * as ed from '@noble/ed25519';

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export async function createEvidenceReceipt(scenario, inputData, decision, privateKeyHex) {
  const encoder = new TextEncoder();
  
  const inputBuffer = encoder.encode(typeof inputData === 'string' ? inputData : JSON.stringify(inputData));
  const hashBuffer = await crypto.subtle.digest('SHA-256', inputBuffer);
  const inputHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const receipt = {
    scenario,
    execution_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    input_hash: inputHash,
    policy_version: 'v7.2',
    decision,
    runtime_version: '0.1.1'
  };

  const receiptBuffer = encoder.encode(JSON.stringify(receipt));
  const receiptHashBuffer = await crypto.subtle.digest('SHA-256', receiptBuffer);
  const receiptHash = Array.from(new Uint8Array(receiptHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  let signature = 'SIMULATED_SIGNATURE';
  if (privateKeyHex) {
    const privKeyBytes = hexToBytes(privateKeyHex);
    const msgBytes = encoder.encode(receiptHash);
    const signatureBytes = await ed.signAsync(msgBytes, privKeyBytes);
    signature = Array.from(signatureBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  return {
    ...receipt,
    evidence_hash: receiptHash,
    signature
  };
}

export async function verifyEvidenceReceipt(receipt, publicKeyHex) {
  try {
    const { signature, evidence_hash, ...receiptBody } = receipt;
    const encoder = new TextEncoder();
    
    const receiptBuffer = encoder.encode(JSON.stringify(receiptBody));
    const calculatedHashBuffer = await crypto.subtle.digest('SHA-256', receiptBuffer);
    const calculatedHash = Array.from(new Uint8Array(calculatedHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (calculatedHash !== evidence_hash) {
      return { valid: false, reason: 'El hash del recibo no coincide (manipulación detectada).' };
    }

    const pubKeyBytes = hexToBytes(publicKeyHex);
    const sigBytes = hexToBytes(signature);
    const msgBytes = encoder.encode(evidence_hash);

    const isValid = await ed.verifyAsync(sigBytes, msgBytes, pubKeyBytes);
    return { valid: isValid, reason: isValid ? 'Firma Ed25519 válida.' : 'Firma no válida para esta clave pública.' };
  } catch (error) {
    return { valid: false, reason: 'Error en la verificación: ' + error.message };
  }
}
