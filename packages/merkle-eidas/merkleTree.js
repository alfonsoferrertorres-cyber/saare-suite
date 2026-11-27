// packages/merkle-eidas/merkleTree.js — Árbol de Merkle SHA-256 y Pruebas de Inclusión (SGP 1.0)

function canonicalizeValue(val) {
  if (val === null || typeof val !== "object") {
    if (typeof val === "number" && Object.is(val, -0)) {
      return "0";
    }
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map((item) => canonicalizeValue(item)).join(",") + "]";
  }
  const keys = Object.keys(val).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalizeValue(val[k])).join(",") + "}";
}

async function sha256Hex(input) {
  const text = typeof input === "string" ? input : canonicalizeValue(input);
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isValidSha256Hex(hash = "") {
  return /^[0-9a-fA-F]{64}$/.test(String(hash || "").trim());
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
      originalIndex: idx,
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

  // Cada nodo de un nivel guarda su hash y el conjunto de índices de hojas bajo ese nodo
  let currentNodes = leafEntries.map((entry, idx) => ({
    hash: entry.leafHash,
    leafIndices: [idx]
  }));

  const levels = [currentNodes.map((n) => n.hash)];

  while (currentNodes.length > 1) {
    const workingNodes =
      currentNodes.length % 2 === 1
        ? [...currentNodes, { hash: currentNodes[currentNodes.length - 1].hash, leafIndices: [] }]
        : [...currentNodes];

    const nextNodes = [];

    for (let i = 0; i < workingNodes.length; i += 2) {
      const left = workingNodes[i];
      const right = workingNodes[i + 1];
      const parentHash = await sha256Hex(`${left.hash}:${right.hash}`);

      // Si `right` es un nodo duplicado de relleno (sin hojas propias), no se añade como hermano
      // porque el hash que se combina en ese nivel ya es `left.hash` (duplicado en el bucle de verificación)
      if (right.leafIndices.length > 0) {
        for (const leafIdx of left.leafIndices) {
          proofsByLeafIndex[leafIdx].push({ hash: right.hash, position: "right" });
        }
      }

      for (const leafIdx of right.leafIndices) {
        proofsByLeafIndex[leafIdx].push({ hash: left.hash, position: "left" });
      }

      nextNodes.push({
        hash: parentHash,
        leafIndices: [...left.leafIndices, ...right.leafIndices]
      });
    }

    currentNodes = nextNodes;
    levels.push(currentNodes.map((n) => n.hash));
  }

  const merkleRoot = currentNodes[0].hash;
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
  const cleanLeaf = String(leafHash || "").trim().toLowerCase();
  const cleanRoot = String(expectedRoot || "").trim().toLowerCase();
  if (!isValidSha256Hex(cleanLeaf) || !isValidSha256Hex(cleanRoot)) return false;

  let computed = cleanLeaf;
  const steps = Array.isArray(proof) ? proof : [];

  for (const step of steps) {
    const sibling = String(step?.hash || "").trim().toLowerCase();
    if (!isValidSha256Hex(sibling)) return false;

    if (step.position === "left") {
      computed = await sha256Hex(`${sibling}:${computed}`);
    } else if (step.position === "right") {
      computed = await sha256Hex(`${computed}:${sibling}`);
    } else {
      return false;
    }
  }

  return computed === cleanRoot;
}

export default {
  computeLeafHash,
  buildMerkleBatch,
  verifyMerkleProof
};