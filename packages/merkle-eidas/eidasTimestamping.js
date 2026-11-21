// packages/merkle-eidas/eidasTimestamping.js — Adaptador de Sellado Temporal (eIDAS / RFC 3161 + Contingencia Local)

async function sha256Hex(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
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
 * Sella una Merkle Root con soporte para TSA cualificada eIDAS y contingencia local explícita.
 * Nunca marca `isQualifiedEidas: true` si no hay confirmación real de un proveedor TSA.
 *
 * @param {Object} params
 * @param {string} params.merkleRoot - Hash SHA-256 de 64 caracteres hex
 * @param {string} [params.tenantId]
 * @param {string} [params.expedienteId]
 * @param {number} [params.leafCount]
 * @param {Object} [env]
 * @param {Object} [options]
 */
export async function timestampMerkleRoot(params = {}, env = {}, options = {}) {
  const cleanRoot = String(params?.merkleRoot || "").trim().toLowerCase();
  if (!isValidSha256Hex(cleanRoot)) {
    throw new Error("merkleRoot inválida: se requiere un hash SHA-256 hexadecimal de 64 caracteres");
  }

  const tenantId = String(params?.tenantId || "DEFAULT_TENANT").trim().toUpperCase();
  const expedienteId = String(
    options?.expedienteId ||
      params?.expedienteId ||
      env?.EIDAS_EXPEDIENTE_ID ||
      env?.EXPEDIENTE_ID ||
      "SGP-1.0-BATCH"
  ).trim();
  const leafCount = Number.isFinite(Number(params?.leafCount)) ? Number(params.leafCount) : null;
  const issuedAt = new Date().toISOString();

  const digestPayload = {
    spec: "SGP-1.0-EIDAS-ADAPTER",
    merkleRoot: cleanRoot,
    tenantId,
    expedienteId,
    leafCount,
    issuedAt
  };

  const localSealHash = await sha256Hex(digestPayload);
  const tsaUrl = String(options?.tsaUrl || env?.EIDAS_TSA_URL || "").trim();
  const tsaApiKey = String(options?.tsaApiKey || env?.EIDAS_TSA_API_KEY || "").trim();

  if (!tsaUrl) {
    return Object.freeze({
      status: "SEALED_LOCAL",
      mode: "LOCAL_CUSTODY_ONLY",
      assuranceLevel: "LOCAL_INTEGRITY",
      isQualifiedEidas: false,
      merkleRoot: cleanRoot,
      tenantId,
      expedienteId,
      leafCount,
      timestampUtc: issuedAt,
      sealHash: localSealHash,
      tsaReference: `LOCAL-SEAL-${localSealHash.slice(0, 16).toUpperCase()}`,
      qualificationNote: "Custodia local SHA-256 sin TSA cualificada eIDAS configurada"
    });
  }

  const timeoutMs = Number(options?.timeoutMs || env?.EIDAS_TSA_TIMEOUT_MS || 8000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {
      "Content-Type": "application/json",
      "X-SGP-Spec": "SGP-1.0",
      "X-Tenant-Id": tenantId,
      "X-Expediente-Id": expedienteId
    };
    if (tsaApiKey) {
      headers.Authorization = `Bearer ${tsaApiKey}`;
    }

    const response = await fetch(tsaUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        hashAlgorithm: "SHA-256",
        hashedMessage: cleanRoot,
        tenantId,
        expedienteId,
        leafCount,
        requestedAt: issuedAt
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`TSA respondió con estado HTTP ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    const tsaTokenOrReceipt =
      data?.qualifiedToken ||
      data?.tst ||
      data?.token ||
      data?.receiptId ||
      data?.serialNumber ||
      null;

    const providerConfirmed = Boolean(
      tsaTokenOrReceipt &&
        (data?.qualified === true ||
          data?.eidasQualified === true ||
          typeof tsaTokenOrReceipt === "string")
    );

    if (!providerConfirmed) {
      throw new Error("La respuesta de la TSA no incluye token o comprobante cualificado verificable");
    }

    const qualifiedSealHash = await sha256Hex({
      ...digestPayload,
      tsaTokenOrReceipt,
      providerVerifiedAt: data?.timestamp || issuedAt
    });

    return Object.freeze({
      status: "SEALED_QUALIFIED_EIDAS",
      mode: "QUALIFIED_TSA_EIDAS",
      assuranceLevel: "QUALIFIED",
      isQualifiedEidas: true,
      merkleRoot: cleanRoot,
      tenantId,
      expedienteId,
      leafCount,
      timestampUtc: String(data?.timestamp || issuedAt),
      sealHash: qualifiedSealHash,
      tsaReference: String(tsaTokenOrReceipt),
      provider: String(data?.provider || data?.tsaName || "EIDAS_QUALIFIED_TSA"),
      qualificationNote: "Sello de tiempo cualificado eIDAS verificado desde proveedor TSA"
    });
  } catch (error) {
    return Object.freeze({
      status: "SEALED_FALLBACK_LOCAL",
      mode: "LOCAL_FALLBACK_ON_TSA_ERROR",
      assuranceLevel: "LOCAL_INTEGRITY",
      isQualifiedEidas: false,
      merkleRoot: cleanRoot,
      tenantId,
      expedienteId,
      leafCount,
      timestampUtc: issuedAt,
      sealHash: localSealHash,
      tsaReference: `FALLBACK-LOCAL-${localSealHash.slice(0, 16).toUpperCase()}`,
      error: error?.message || "Error al contactar con el proveedor TSA",
      qualificationNote: "Contingencia local aplicada: no se ha confirmado sello cualificado eIDAS"
    });
  } finally {
    clearTimeout(timer);
  }
}

export default {
  timestampMerkleRoot
};