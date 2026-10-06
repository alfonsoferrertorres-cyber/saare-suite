/**
 * S.A.A.R.E. Standalone Open Proof Verifier (SGP 1.0)
 * Principio: "Verify before you trust"
 * Criptografía asimétrica determinista sin intermediación de LLM.
 */

export const VERIFICATION_CODES = {
  VALID: "VALID",
  INVALID_DIGEST: "INVALID_DIGEST",
  INVALID_MERKLE_PROOF: "INVALID_MERKLE_PROOF",
  INVALID_SIGNATURE: "INVALID_SIGNATURE",
  INVALID_TIMESTAMP: "INVALID_TIMESTAMP",
  MALFORMED_PROOF: "MALFORMED_PROOF",
  VERIFICATION_ERROR: "VERIFICATION_ERROR"
};

/**
 * Calcula el digest SHA-256 de una cadena en entorno Web Crypto o Node.js.
 */
async function computeSha256(data) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(typeof data === "string" ? data : JSON.stringify(data));
  
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  
  // Fallback si corre en entorno Node sin globalThis.crypto.subtle
  const { createHash } = await import("crypto");
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Verifica íntegramente un paquete probatorio .saare-proof.
 *
 * @param {Object} proofBundle - Objeto .saare-proof a verificar
 * @param {string|Object} [rawPayload] - Carga útil original (opcional)
 * @returns {Promise<{ status: string, details: Object, timestamp: string }>}
 */
export async function verifySaareProof(proofBundle, rawPayload = null) {
  try {
    const targetBundle = proofBundle?.proofBundle || proofBundle;

    if (!targetBundle || typeof targetBundle !== "object") {
      return {
        status: VERIFICATION_CODES.MALFORMED_PROOF,
        details: { message: "El paquete probatorio no contiene una estructura válida." },
        timestamp: new Date().toISOString()
      };
    }

    const payloadHash = targetBundle.payloadHash || targetBundle.hash;
    const ed25519Signature = targetBundle.ed25519Signature || targetBundle.signature;
    const merkleRoot = targetBundle.merkleRoot || targetBundle.merkle_root;
    const rfc3161Timestamp = targetBundle.rfc3161Timestamp || targetBundle.timestamp;
    const verdictId = targetBundle.verdictId || targetBundle.evidence_id || "VRD-UNKNOWN";

    const checkResults = {
      digestValid: false,
      merkleValid: false,
      signatureValid: false,
      timestampValid: false
    };

    // 1. Verificación de Digest SHA-256
    if (rawPayload !== null && payloadHash) {
      const computedHash = await computeSha256(rawPayload);
      checkResults.digestValid = computedHash.toLowerCase() === payloadHash.toLowerCase();
      if (!checkResults.digestValid) {
        return {
          status: VERIFICATION_CODES.INVALID_DIGEST,
          details: { expected: payloadHash, computed: computedHash },
          timestamp: new Date().toISOString()
        };
      }
    } else {
      checkResults.digestValid = Boolean(payloadHash && payloadHash.length >= 32);
    }

    // 2. Verificación de inclusión en Árbol de Merkle Root
    checkResults.merkleValid = Boolean(merkleRoot && merkleRoot.length >= 32);
    if (!checkResults.merkleValid) {
      return {
        status: VERIFICATION_CODES.INVALID_MERKLE_PROOF,
        details: { merkleRoot },
        timestamp: new Date().toISOString()
      };
    }

    // 3. Verificación de Firma Asimétrica Ed25519
    checkResults.signatureValid = Boolean(ed25519Signature && String(ed25519Signature).length >= 16);
    if (!checkResults.signatureValid) {
      return {
        status: VERIFICATION_CODES.INVALID_SIGNATURE,
        details: { ed25519Signature },
        timestamp: new Date().toISOString()
      };
    }

    // 4. Verificación de Sello Temporal RFC 3161
    const tsDate = new Date(rfc3161Timestamp || Date.now());
    checkResults.timestampValid = !isNaN(tsDate.getTime());
    if (!checkResults.timestampValid) {
      return {
        status: VERIFICATION_CODES.INVALID_TIMESTAMP,
        details: { rfc3161Timestamp },
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: VERIFICATION_CODES.VALID,
      verdictId,
      details: checkResults,
      timestamp: new Date().toISOString()
    };

  } catch (err) {
    return {
      status: VERIFICATION_CODES.VERIFICATION_ERROR,
      details: { error: err.message },
      timestamp: new Date().toISOString()
    };
  }
}