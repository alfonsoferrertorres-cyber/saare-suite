// control-plane/src/services/proofBundle.js — Módulo Generador de Evidencias Criptográficas SGP 1.0
import { EnterpriseKeyManager, computeSha256 } from "./keyManager.js";
import { TimestampingEngine } from "./timestampingEngine.js";

export async function generateProofBundle(rawEvidence = {}, env = {}) {
  const safeEvidence = rawEvidence && typeof rawEvidence === "object" ? rawEvidence : {};
  const tenantId = String(safeEvidence.tenant_id || safeEvidence.tenant || "DEFAULT_TENANT")
    .trim()
    .toUpperCase();

  const isDeny =
    safeEvidence.decision === "DENY" ||
    safeEvidence.verdict === "RECHAZADO" ||
    safeEvidence.verdictCode === "REJECTED" ||
    safeEvidence.action === "BLOCKED" ||
    (Array.isArray(safeEvidence.rulesTriggered) &&
      safeEvidence.rulesTriggered.includes("ANTI_JAILBREAK_TRIGGERED")) ||
    Boolean(
      safeEvidence.verdict_data &&
        (safeEvidence.verdict_data.verdict === "RECHAZADO" ||
          safeEvidence.verdict_data.action === "DENY")
    );

  const category = String(
    safeEvidence.category || safeEvidence.scenarioId || "AUDITORIA_CONFORME"
  ).toUpperCase();

  let grantCategory = "KIT_DIGITAL_CYBERSECURITY";
  let eligibleItem = "Agente Perimetral L7 Ex-Ante (RAM Zero-Disk)";
  const dnshImpact = "Reducción de consumo GPU por sanitización previa en RAM";

  if (
    category.includes("PII") ||
    category.includes("DNI") ||
    category.includes("IBAN") ||
    category.includes("RGPD")
  ) {
    grantCategory = "KIT_CONSULTING_GAP_ANALYSIS";
    eligibleItem = "Evaluación de Impacto en Derechos Fundamentales (FRIA - EU AI Act)";
  } else if (
    category.includes("FINANCIAL") ||
    category.includes("DORA") ||
    category.includes("BANCA")
  ) {
    grantCategory = "IMPULSO_ECOSISTEMAS_IA";
    eligibleItem = "Módulo de Resiliencia Operativa Digital DORA (Reglamento UE 2022/2554)";
  } else if (category.includes("ISO") || safeEvidence.merkleRoot) {
    grantCategory = "INCIBE_CDTI_CYBERSECURITY";
    eligibleItem = "Evidencia Forense Criptográfica ISO/IEC 27037";
  }

  let payloadString = "";
  if (typeof safeEvidence.prompt === "string") {
    payloadString = safeEvidence.prompt;
  } else if (typeof safeEvidence.sanitizedPayload === "string") {
    payloadString = safeEvidence.sanitizedPayload;
  } else if (typeof safeEvidence.sanitized_payload === "string") {
    payloadString = safeEvidence.sanitized_payload;
  } else {
    try {
      payloadString = JSON.stringify(safeEvidence.prompt || safeEvidence.payload || "");
    } catch {
      payloadString = "";
    }
  }

  const payloadHash = await computeSha256(payloadString);
  const claimLevel = isDeny ? "VERIFIED" : "TESTED";

  const parsedDate = new Date(
    safeEvidence.timestamp || safeEvidence.created_at || Date.now()
  );
  const validDate = !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date();
  const timestamp = validDate.toISOString();
  const year = validDate.getUTCFullYear();

  const runId =
    safeEvidence.id ||
    safeEvidence.evidence_id ||
    `EV-L7-${payloadHash.substring(0, 10).toUpperCase()}`;
  const verdictId =
    safeEvidence.verdictId || `VRD-${year}-${String(runId).replace(/^EV-L7-/i, "")}`;
  const traceId =
    safeEvidence.trace_id || `tr_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;

  const keyManager = new EnterpriseKeyManager(env);
  const canonicalSignPayload = `${tenantId}|${verdictId}|${traceId}|${payloadHash}|${timestamp}`;
  const ed25519Signature =
    safeEvidence.cryptoSeal ||
    (await keyManager.deriveEd25519Signature(canonicalSignPayload));

  const TsaClass = TimestampingEngine?.default || TimestampingEngine;
  const tsaEngine = new TsaClass(
    env?.EXPEDIENTE_ID || env?.SAFE_CREATIVE_EXPEDIENTE_ID || "DEFAULT-EXPEDIENTE"
  );
  const externalTsaHash =
    safeEvidence.tsaHash || env?.SAFE_CREATIVE_TSA_HASH || null;
  const tsaSeal = await tsaEngine.sealTransaction(
    { tenantId, verdictId, payloadHash, ed25519Signature },
    externalTsaHash
  );

  const isQualifiedTSA = Boolean(
    safeEvidence.qualifiedTsaConfirmed ||
      (typeof tsaSeal.tsaHash === "string" &&
        !tsaSeal.tsaHash.startsWith("TSA-RFC3161-"))
  );

  const deterministicSuffix = (
    await computeSha256(`${tenantId}:${verdictId}:${payloadHash}`)
  )
    .substring(0, 10)
    .toUpperCase();

  return {
    ...safeEvidence,
    tenant: tenantId,
    tenant_id: tenantId,
    id: runId,
    evidence_id: runId,
    trace_id: traceId,
    verdictId,
    decision: isDeny ? "DENY" : "ALLOW",
    verdict: isDeny ? "RECHAZADO" : "PERMITIDO",
    cryptoSeal: ed25519Signature,
    proofBundle: {
      tenantId,
      verdictId,
      payloadHash,
      ed25519Signature,
      merkleRoot: safeEvidence.merkleRoot || tsaSeal.rootHash,
      tsaHash: tsaSeal.tsaHash,
      rfc3161Timestamp: tsaSeal.timestampUtc,
      isQualifiedTSA,
      policyVersion: safeEvidence.policyVersion || "v1.0.0",
      controlVersion: safeEvidence.controlVersion || "v1.0.0",
      runtimeVersion: "SGP-1.0-v8.5",
      systemId: safeEvidence.systemId || "SYS-L7-CORE",
      claimLevel,
      auditStandard:
        "ISO/IEC 27037:2012 / EU AI Act Art. 12 & 14 / DORA UE 2022/2554"
    },
    grantMetadata: {
      grantCategory,
      eligibleItem,
      dnshImpact,
      auditStandard:
        safeEvidence.norma || safeEvidence.sub || "EU AI Act / DORA / ISO 27037",
      complianceCode:
        safeEvidence.complianceCode || `MS3V-GRANT-${deterministicSuffix}`
    }
  };
}

export default generateProofBundle;