// packages/merkle-eidas/forensicBatchService.js — Orquestador Merkle + eIDAS + Custodia 2-de-3
import { buildMerkleBatch, verifyMerkleProof } from "./merkleTree.js";
import { timestampMerkleRoot } from "./eidasTimestamping.js";
import { encryptWith2of3Key, decryptWith2of3Key } from "../shamir-custody/shamir2of3.js";

function normalizeTenant(tenantId = "") {
  return (
    String(tenantId || "DEFAULT_TENANT")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "_")
      .slice(0, 32) || "DEFAULT_TENANT"
  );
}

export async function sealForensicBatch(
  { tenantId, evidences = [], enable2of3Custody = true, expedienteId = null },
  env = {},
  options = {}
) {
  const cleanTenant = normalizeTenant(tenantId);
  const batchId = `BATCH-${cleanTenant}-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const merkle = await buildMerkleBatch(evidences);

  const timestampSeal = await timestampMerkleRoot(
    {
      merkleRoot: merkle.merkleRoot,
      tenantId: cleanTenant,
      expedienteId: expedienteId || env?.EIDAS_EXPEDIENTE_ID || env?.EXPEDIENTE_ID,
      leafCount: merkle.leafCount
    },
    env,
    options
  );

  const proofsByEvidenceId = {};
  for (const leaf of merkle.leaves) {
    proofsByEvidenceId[leaf.evidenceId] = {
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
      merkleRoot: merkle.merkleRoot,
      leafCount: merkle.leafCount,
      timestampSeal,
      createdAt
    };

    const encrypted = await encryptWith2of3Key(manifestToProtect, {
      tenantId: cleanTenant,
      keyId: `KEY-${batchId}`
    });

    custody2of3 = {
      algorithm: encrypted.algorithm,
      threshold: encrypted.custody.threshold,
      totalShares: encrypted.custody.totalShares,
      ivHex: encrypted.ivHex,
      ciphertextHex: encrypted.ciphertextHex,
      meta: encrypted.custody.meta,
      shares: encrypted.custody.shares
    };
  }

  return {
    batchId,
    tenantId: cleanTenant,
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

export async function verifyEvidenceInclusion({ leafHash, proof = [], merkleRoot }) {
  const valid = await verifyMerkleProof(leafHash, proof, merkleRoot);
  return {
    verified: valid,
    merkleRoot: String(merkleRoot || "").trim().toLowerCase(),
    leafHash: String(leafHash || "").trim().toLowerCase(),
    verifiedAt: new Date().toISOString()
  };
}

export async function unlockBatchManifest2of3(custody2of3, providedShares = []) {
  if (!custody2of3?.ivHex || !custody2of3?.ciphertextHex) {
    throw new Error("El paquete de custodia 2-de-3 está incompleto");
  }
  const plainJson = await decryptWith2of3Key(
    {
      ivHex: custody2of3.ivHex,
      ciphertextHex: custody2of3.ciphertextHex
    },
    providedShares
  );
  return JSON.parse(plainJson);
}

export default {
  sealForensicBatch,
  verifyEvidenceInclusion,
  unlockBatchManifest2of3
};