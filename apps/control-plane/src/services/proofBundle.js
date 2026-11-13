// control-plane/proofBundle.js — Módulo Generador de Evidencias Criptográficas SGP 1.0
import { EnterpriseKeyManager, computeSha256 } from './keyManager.js';
import { TimestampingEngine } from './timestampingEngine.js';

export async function generateProofBundle(rawEvidence = {}, env = {}) {
  const isDeny =
    rawEvidence.decision === 'DENY' ||
    rawEvidence.verdict === 'RECHAZADO' ||
    rawEvidence.verdictCode === 'REJECTED' ||
    rawEvidence.action === 'BLOCKED' ||
    (Array.isArray(rawEvidence.rulesTriggered) && rawEvidence.rulesTriggered.includes('ANTI_JAILBREAK_TRIGGERED')) ||
    (rawEvidence.verdict_data && (rawEvidence.verdict_data.verdict === 'RECHAZADO' || rawEvidence.verdict_data.action === 'DENY'));

  const category = String(rawEvidence.category || rawEvidence.scenarioId || 'AUDITORIA_CONFORME').toUpperCase();

  let grantCategory = "KIT_DIGITAL_CYBERSECURITY";
  let eligibleItem = "Agente Perimetral L7 Ex-Ante (RAM Zero-Disk)";
  let dnshImpact = "Reducción de consumo GPU por sanitización previa en RAM";

  if (category.includes("PII") || category.includes("DNI") || category.includes("IBAN") || category.includes("RGPD")) {
    grantCategory = "KIT_CONSULTING_GAP_ANALYSIS";
    eligibleItem = "Evaluación de Impacto en Derechos Fundamentales (FRIA - EU AI Act)";
  } else if (category.includes("FINANCIAL") || category.includes("DORA") || category.includes("BANCA")) {
    grantCategory = "IMPULSO_ECOSISTEMAS_IA";
    eligibleItem = "Módulo de Resiliencia Operativa Digital DORA (Reglamento UE 2022/2554)";
  } else if (category.includes("ISO") || rawEvidence.merkleRoot) {
    grantCategory = "INCIBE_CDTI_CYBERSECURITY";
    eligibleItem = "Evidencia Forense Criptográfica ISO/IEC 27037";
  }

  let payloadString = "";
  if (typeof rawEvidence.prompt === "string") {
    payloadString = rawEvidence.prompt;
  } else if (typeof rawEvidence.sanitizedPayload === "string") {
    payloadString = rawEvidence.sanitizedPayload;
  } else if (typeof rawEvidence.sanitized_payload === "string") {
    payloadString = rawEvidence.sanitized_payload;
  } else {
    try {
      payloadString = JSON.stringify(rawEvidence.prompt || rawEvidence.payload || "");
    } catch (e) {
      payloadString = "";
    }
  }

  const payloadHash = await computeSha256(payloadString);
  const claimLevel = isDeny ? 'VERIFIED' : 'TESTED';
  const timestamp = rawEvidence.timestamp || rawEvidence.created_at || new Date().toISOString();
  const runId = rawEvidence.id || rawEvidence.evidence_id || `EV-L7-${payloadHash.substring(0, 10).toUpperCase()}`;
  const verdictId = rawEvidence.verdictId || `VRD-2026-${runId.replace('EV-L7-', '')}`;
  const traceId = rawEvidence.trace_id || `tr_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;

  // Firma real Ed25519 (con fallback determinista si no hay clave PEM en entorno)
  const keyManager = new EnterpriseKeyManager(env);
  const canonicalSignPayload = `${verdictId}|${traceId}|${payloadHash}|${timestamp}`;
  const ed25519Signature = rawEvidence.cryptoSeal || await keyManager.deriveEd25519Signature(canonicalSignPayload);

  // Sello temporal RFC-3161
  const tsaEngine = new TimestampingEngine(env?.SAFE_CREATIVE_EXPEDIENTE_ID || "MS3V-RECON-VALID-2026");
  const tsaSeal = await tsaEngine.sealTransaction({ verdictId, payloadHash, ed25519Signature });

  return {
    ...rawEvidence,
    id: runId,
    evidence_id: runId,
    trace_id: traceId,
    verdictId,
    decision: isDeny ? 'DENY' : 'ALLOW',
    verdict: isDeny ? 'RECHAZADO' : 'PERMITIDO',
    cryptoSeal: ed25519Signature,
    proofBundle: {
      verdictId,
      payloadHash,
      ed25519Signature,
      merkleRoot: rawEvidence.merkleRoot || tsaSeal.rootHash,
      tsaHash: tsaSeal.tsaHash,
      rfc3161Timestamp: tsaSeal.timestampUtc,
      isQualifiedTSA: Boolean(env?.SAFE_CREATIVE_API_KEY),
      policyVersion: rawEvidence.policyVersion || "v1.0.0",
      controlVersion: rawEvidence.controlVersion || "v1.0.0",
      runtimeVersion: "SGP-1.0-v8.5",
      systemId: rawEvidence.systemId || "SYS-L7-CORE",
      claimLevel,
      auditStandard: "ISO/IEC 27037:2012 / EU AI Act Art. 12 & 14 / DORA UE 2022/2554"
    },
    grantMetadata: {
      grantCategory,
      eligibleItem,
      dnshImpact,
      auditStandard: rawEvidence.norma || rawEvidence.sub || "EU AI Act / DORA / ISO 27037",
      complianceCode: rawEvidence.complianceCode || `MS3V-GRANT-EVIDENCE-${Date.now()}`
    }
  };
}

export default generateProofBundle;