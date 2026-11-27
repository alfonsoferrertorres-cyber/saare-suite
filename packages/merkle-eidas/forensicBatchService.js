// packages/merkle-eidas/forensicBatchService.js — Orquestador Merkle + eIDAS + Custodia 2-de-3 + RFC 8785 JCS (Multitenant)
import { buildMerkleBatch, verifyMerkleProof } from "./merkleTree.js";
import { timestampMerkleRoot } from "./eidasTimestamping.js";
import { encryptWith2of3Key, decryptWith2of3Key } from "../shamir-custody/shamir2of3.js";

const EMPIRICAL_EXPEDIENTE_REF = "MS3V-RECON-VALID-2026-ALF-0521";

export function canonicalizeRfc8785(val) {
  if (val === null || typeof val !== "object") {
    if (typeof val === "number" && Object.is(val, -0)) {
      return "0";
    }
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map((item) => canonicalizeRfc8785(item)).join(",") + "]";
  }
  const keys = Object.keys(val).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalizeRfc8785(val[k])).join(",") + "}";
}

export function normalizeTenant(tenantId = "") {
  return (
    String(tenantId || "DEFAULT_TENANT")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "_")
      .slice(0, 32) || "DEFAULT_TENANT"
  );
}

function assertTenantMatch(expectedTenant, providedTenant, contextLabel = "operación") {
  if (!providedTenant) return;
  const normalizedExpected = normalizeTenant(expectedTenant);
  const normalizedProvided = normalizeTenant(providedTenant);
  if (normalizedExpected !== normalizedProvided) {
    throw new Error(
      `Violación de aislamiento multitenant en ${contextLabel}: tenant esperado '${normalizedExpected}', recibido '${normalizedProvided}'`
    );
  }
}

function scopeEvidencesToTenant(evidences = [], cleanTenant) {
  const list = Array.isArray(evidences) ? evidences : [];
  const scoped = [];

  for (const ev of list) {
    if (!ev || typeof ev !== "object") continue;
    const rawEvTenant = ev.tenant_id ?? ev.tenant ?? null;
    if (rawEvTenant !== null && String(rawEvTenant).trim() !== "") {
      const normalizedEvTenant = normalizeTenant(rawEvTenant);
      if (normalizedEvTenant !== cleanTenant) {
        continue;
      }
    }
    scoped.push({
      ...ev,
      tenant_id: cleanTenant,
      tenant: cleanTenant
    });
  }

  return scoped;
}

/**
 * Sella un lote forense aislado por `tenantId` con Árbol de Merkle SHA-256,
 * sellado temporal eIDAS/RFC 3161 y custodia compartida 2-de-3.
 */
export async function sealForensicBatch(
  { tenantId, evidences = [], enable2of3Custody = true, expedienteId = null },
  env = {},
  options = {}
) {
  const cleanTenant = normalizeTenant(tenantId);
  const resolvedExpediente = String(
    expedienteId ||
      options?.expedienteId ||
      env?.EIDAS_EXPEDIENTE_ID ||
      env?.EXPEDIENTE_ID ||
      EMPIRICAL_EXPEDIENTE_REF
  ).trim();

  const scopedEvidences = scopeEvidencesToTenant(evidences, cleanTenant);
  const batchId = `BATCH-${cleanTenant}-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const merkle = await buildMerkleBatch(scopedEvidences);

  const timestampSeal = await timestampMerkleRoot(
    {
      merkleRoot: merkle.merkleRoot,
      tenantId: cleanTenant,
      expedienteId: resolvedExpediente,
      leafCount: merkle.leafCount
    },
    env,
    {
      ...options,
      expedienteId: resolvedExpediente
    }
  );

  const proofsByEvidenceId = {};
  for (const leaf of merkle.leaves) {
    proofsByEvidenceId[leaf.evidenceId] = {
      tenantId: cleanTenant,
      leafHash: leaf.leafHash,
      proof: leaf.proof,
      merkleRoot: merkle.merkleRoot
    };
  }

  let custody2of3 = null;
  if (enable2of3Custody) {
    const manifestToProtect = {
      batchId,
      tenantId: cleanTenant,
      expedienteId: resolvedExpediente,
      canonicalization: "RFC 8785 (JCS)",
      merkleRoot: merkle.merkleRoot,
      leafCount: merkle.leafCount,
      timestampSeal,
      createdAt
    };

    const encrypted = await encryptWith2of3Key(manifestToProtect, {
      tenantId: cleanTenant,
      keyId: `KEY-${cleanTenant}-${batchId}`
    });

    custody2of3 = {
      tenantId: cleanTenant,
      algorithm: encrypted.algorithm,
      threshold: encrypted.custody.threshold,
      totalShares: encrypted.custody.totalShares,
      ivHex: encrypted.ivHex,
      ciphertextHex: encrypted.ciphertextHex,
      meta: {
        ...(encrypted.custody.meta || {}),
        tenantId: cleanTenant
      },
      shares: encrypted.custody.shares
    };
  }

  return {
    batchId,
    tenantId: cleanTenant,
    expedienteId: resolvedExpediente,
    canonicalization: "RFC 8785 (JCS)",
    createdAt,
    leafCount: merkle.leafCount,
    merkleRoot: merkle.merkleRoot,
    timestampSeal,
    isQualifiedEidas: Boolean(timestampSeal?.isQualifiedEidas),
    assuranceLevel: timestampSeal?.assuranceLevel || "LOCAL_INTEGRITY",
    proofsByEvidenceId,
    custody2of3
  };
}

/**
 * Verifica la inclusión de una hoja en la Merkle Root, validando además
 * la pertenencia al `tenantId` cuando se proporciona.
 */
export async function verifyEvidenceInclusion({
  leafHash,
  proof = [],
  merkleRoot,
  tenantId = null,
  expectedTenantId = null,
  expedienteId = EMPIRICAL_EXPEDIENTE_REF
}) {
  const cleanLeaf = String(leafHash || "").trim().toLowerCase();
  const cleanRoot = String(merkleRoot || "").trim().toLowerCase();
  const normalizedTenant = tenantId ? normalizeTenant(tenantId) : null;

  if (expectedTenantId && normalizedTenant) {
    assertTenantMatch(expectedTenantId, normalizedTenant, "verifyEvidenceInclusion");
  }

  const valid = await verifyMerkleProof(cleanLeaf, proof, cleanRoot);

  return {
    verified: valid,
    ...(normalizedTenant ? { tenantId: normalizedTenant } : {}),
    expedienteId: String(expedienteId || EMPIRICAL_EXPEDIENTE_REF).trim(),
    merkleRoot: cleanRoot,
    leafHash: cleanLeaf,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Descifra un manifiesto protegido mediante custodia 2-de-3 y verifica
 * que el `tenantId` del manifiesto coincida con el solicitado.
 */
export async function unlockBatchManifest2of3(custody2of3, providedShares = [], expectedTenantId = null) {
  if (!custody2of3?.ivHex || !custody2of3?.ciphertextHex) {
    throw new Error("El paquete de custodia 2-de-3 está incompleto");
  }

  const packageTenant = custody2of3.tenantId || custody2of3.meta?.tenantId || null;
  if (expectedTenantId && packageTenant) {
    assertTenantMatch(expectedTenantId, packageTenant, "unlockBatchManifest2of3");
  }

  const plainJson = await decryptWith2of3Key(
    {
      ivHex: custody2of3.ivHex,
      ciphertextHex: custody2of3.ciphertextHex
    },
    providedShares
  );

  const manifest = JSON.parse(plainJson);

  if (expectedTenantId && manifest?.tenantId) {
    assertTenantMatch(expectedTenantId, manifest.tenantId, "unlockBatchManifest2of3.manifest");
  }
  if (packageTenant && manifest?.tenantId) {
    assertTenantMatch(packageTenant, manifest.tenantId, "unlockBatchManifest2of3.integrity");
  }

  return manifest;
}

export default {
  sealForensicBatch,
  verifyEvidenceInclusion,
  unlockBatchManifest2of3,
  canonicalizeRfc8785,
  normalizeTenant
};