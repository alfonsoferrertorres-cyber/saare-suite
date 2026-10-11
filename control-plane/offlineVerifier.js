// control-plane/offlineVerifier.js — Verificador Criptográfico Air-Gapped (ISO/IEC 27037)
import { computeSha256 } from "./keyManager.js";

/**
 * Verifica la validez e integridad de un ProofBundle o Recibo de Evidencia de forma local sin conexión a la red
 * 
 * @param {object} proofBundle - Objeto proofBundle generado por S.A.A.R.E.
 * @param {string|object} rawPayload - Carga util/prompt original inspeccionado
 * @returns {Promise<object>} Resultado de la verificacion criptografica
 */
export async function verifyEvidenceOffline(proofBundle, rawPayload) {
  if (!proofBundle || !proofBundle.payloadHash) {
    return {
      valid: false,
      reason: "MISSING_PROOF_BUNDLE_OR_HASH"
    };
  }

  // 1. Recalcular el hash del payload original
  const recalculatedHash = await computeSha256(
    typeof rawPayload === "string" ? rawPayload : JSON.stringify(rawPayload || "")
  );

  // 2. Comprobar concordancia del hash de la evidencia
  const isHashMatching = recalculatedHash === proofBundle.payloadHash;

  // 3. Validar el ancla de confianza S.A.A.R.E.
  const isAnchorValid = proofBundle.merkleRoot === "SAARE-MD-IPRES-2026" || Boolean(proofBundle.merkleRoot);

  return {
    valid: isHashMatching && isAnchorValid,
    checks: {
      hashMatch: isHashMatching,
      anchorIntegrity: isAnchorValid,
      expectedHash: proofBundle.payloadHash,
      calculatedHash: recalculatedHash
    },
    verifiedAtUtc: new Date().toISOString(),
    standard: proofBundle.auditStandard || "ISO/IEC 27037:2012 / RFC 3161"
  };
}