// packages/merkle-eidas/merkleTree.js — Árbol de Merkle SHA-256 y Pruebas de Inclusión (SGP 1.0)

async function sha256Hex(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Calcula el hash canónico de una hoja de evidencia.
 * @param {Object} evidence
 * @returns {Promise<string>}
 */
export async function computeLeafHash(evidence = {}) {
  const canonicalLeaf = {
    evidenceId: String(evidence.evidence_id || evidence.id || "").trim(),
    traceId: String(evidence.trace_id || "").trim(),
    tenantId: String(evidence.tenant_id || evidence.tenant || "DEFAULT_TENANT")
      .trim()
      .toUpperCase(),
    payloadHash: String(evidence.payloadHash || evidence.payload_hash || "").trim(),
    decision: String(evidence.decision || "").trim().toUpperCase(),
    timestamp: String(evidence.timestamp || evidence.created_at || "").trim()
  };

  return await sha256Hex(canonicalLeaf);
}

/**
 * Construye un árbol de Merkle a partir de un array de evidencias y genera
 * la prueba de inclusión para cada hoja.
 * @param {Array<Object>} evidences
 * @returns {Promise<{
 *   merkleRoot: string,
 *   leafCount: number,
 *   leaves: Array<{ index: number, evidenceId: string, leafHash: string, proof: Array<{ hash: string, position: "left" | "right" }> }>,
 *   levels: Array<Array<string>>
 * }>}
 */
export async function buildMerkleBatch(evidences = []) {
  const list = Array.isArray(evidences) ? evidences : [];

  if (list.length === 0) {
    const emptyRoot = await sha256Hex("EMPTY_MERKLE_BATCH_SGP_1_0");
    return {
      merkleRoot: emptyRoot,
      leafCount: 0,
      leaves: [],
      levels: [[emptyRoot]]
    };
  }

  const leafEntries = await Promise.all(
    list.map(async (ev, idx) => ({
      index: idx,
      evidenceId: String(ev?.evidence_id || ev?.id || ev?.trace_id || `LEAF-${idx}`),
      leafHash: await computeLeafHash(ev)
    }))
  );

  // Orden determinista por leafHash y luego por evidenceId para reproducibilidad total
  leafEntries.sort((a, b) => {
    if (a.leafHash !== b.leafHash) return a.leafHash.localeCompare(b.leafHash);
    return a.evidenceId.localeCompare(b.evidenceId);
  });

  const proofsByLeafIndex = leafEntries.map(() => []);
  let currentLevel = leafEntries.map((entry) => entry.leafHash);
  const levels = [currentLevel];

  while (currentLevel.length > 1) {
    const workingLevel =
      currentLevel.length % 2 === 1
        ? [...currentLevel, currentLevel[currentLevel.length - 1]]
        : [...currentLevel];

    const nextLevel = [];

    for (let i = 0; i < workingLevel.length; i += 2) {
      const left = workingLevel[i];
      const right = workingLevel[i + 1];
      const parentHash = await sha256Hex(`${left}:${right}`);
      nextLevel.push(parentHash);

      // Registrar hermano para todas las hojas bajo el subárbol izquierdo
      for (let leafIdx = 0; leafIdx < leafEntries.length; leafIdx++) {
        const subtreeSize = Math.pow(2, levels.length - 1);
        const startLeaf = i * subtreeSize;
        const midLeaf = startLeaf + subtreeSize;
        const endLeaf = (i + 2) * subtreeSize;

        if (leafIdx >= startLeaf && leafIdx < midLeaf) {
          proofsByLeafIndex[leafIdx].push({ hash: right, position: "right" });
        } else if (leafIdx >= midLeaf && leafIdx < endLeaf) {
          proofsByLeafIndex[leafIdx].push({ hash: left, position: "left" });
        }
      }
    }

    currentLevel = nextLevel;
    levels.push(currentLevel);
  }

  const merkleRoot = currentLevel[0];
  const leaves = leafEntries.map((entry, idx) => ({
    index: idx,
    evidenceId: entry.evidenceId,
    leafHash: entry.leafHash,
    proof: proofsByLeafIndex[idx]
  }));

  return {
    merkleRoot,
    leafCount: leaves.length,
    leaves,
    levels
  };
}

/**
 * Verifica si una hoja pertenece a un lote dada su prueba de inclusión y la Merkle Root.
 * @param {string} leafHash
 * @param {Array<{ hash: string, position: "left" | "right" }>} proof
 * @param {string} expectedRoot
 * @returns {Promise<boolean>}
 */
export async function verifyMerkleProof(leafHash, proof = [], expectedRoot = "") {
  if (!leafHash || !expectedRoot) return false;

  let computed = String(leafHash).trim().toLowerCase();
  const steps = Array.isArray(proof) ? proof : [];

  for (const step of steps) {
    const sibling = String(step?.hash || "").trim().toLowerCase();
    if (!sibling) return false;

    if (step.position === "left") {
      computed = await sha256Hex(`${sibling}:${computed}`);
    } else if (step.position === "right") {
      computed = await sha256Hex(`${computed}:${sibling}`);
    } else {
      return false;
    }
  }

  return computed === String(expectedRoot).trim().toLowerCase();
}

export default {
  computeLeafHash,
  buildMerkleBatch,
  verifyMerkleProof
};