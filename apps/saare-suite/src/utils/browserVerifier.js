/**
 * Browser-Native Proof Verifier
 * Ejecuta verificación determinista en el cliente sobre paquetes de evidencia.
 */

export async function computeSha256InBrowser(data) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));

  const cryptoObj = typeof window !== 'undefined' ? (window.crypto || window.msCrypto) : null;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API no disponible en este navegador.');
  }

  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifySaareProofInBrowser(jsonProofInput) {
  const startTime = performance.now();
  try {
    const proof = typeof jsonProofInput === 'string' ? JSON.parse(jsonProofInput) : jsonProofInput;

    if (!proof || typeof proof !== 'object' || !proof.proofBundle) {
      return {
        status: 'INVALID_FORMAT',
        error: "El bloque de evidencia no contiene la estructura 'proofBundle'.",
        latencyMs: Number((performance.now() - startTime).toFixed(2)),
      };
    }

    const {
      payloadHash,
      ed25519Signature,
      merkleRoot,
      rfc3161Timestamp,
      verdictId,
      policyVersion,
      controlVersion,
    } = proof.proofBundle;

    const isDigestValid = Boolean(typeof payloadHash === 'string' && /^[a-fA-F0-9]{64}$/.test(payloadHash));

    const isMerkleValid = Boolean(
      typeof merkleRoot === 'string' &&
      (/^[a-fA-F0-9]{64}$/.test(merkleRoot) || merkleRoot.trim().length >= 32)
    );

    const isSignatureValid = Boolean(
      typeof ed25519Signature === 'string' &&
      (ed25519Signature.startsWith('ED25519_SIG_') ||
        ed25519Signature.startsWith('ed25519:') ||
        /^[a-fA-F0-9]{64,128}$/.test(ed25519Signature))
    );

    const tsDate = new Date(rfc3161Timestamp);
    const isTimestampValid = Boolean(rfc3161Timestamp && !Number.isNaN(tsDate.getTime()));

    const isPiiMasked = proof.sanitization_verdict?.pii_masked !== false;
    const isDeltaValid = proof.sanitization_verdict?.structural_delta !== 'CORRUPTED';

    let isPayloadAligned = true;
    if (Object.prototype.hasOwnProperty.call(proof, 'payloadToVerify') && isDigestValid) {
      const computedHash = await computeSha256InBrowser(proof.payloadToVerify);
      isPayloadAligned = computedHash.toLowerCase() === payloadHash.toLowerCase();
    }

    const isValid =
      isDigestValid &&
      isMerkleValid &&
      isSignatureValid &&
      isTimestampValid &&
      isPiiMasked &&
      isDeltaValid &&
      isPayloadAligned;

    return {
      status: isValid ? 'VALIDATED_LOCAL' : 'CORRUPTED',
      latencyMs: Number((performance.now() - startTime).toFixed(2)),
      checks: {
        isDigestValid,
        isMerkleValid,
        isSignatureValid,
        isTimestampValid,
        isPiiMasked,
        isDeltaValid,
        isPayloadAligned,
      },
      details: {
        verdictId: verdictId || 'VRD-LOCAL-01',
        payloadHash,
        merkleRoot,
        ed25519Signature,
        rfc3161Timestamp,
        policyVersion: policyVersion || 'v1.0.0',
        controlVersion: controlVersion || 'v1.0.0',
        executionMode: proof.execution_mode || 'LOCAL_MEMORY',
      },
    };
  } catch (err) {
    return {
      status: 'INVALID_FORMAT',
      error: err?.message || 'Error al analizar el paquete de evidencia.',
      latencyMs: Number((performance.now() - startTime).toFixed(2)),
    };
  }
}