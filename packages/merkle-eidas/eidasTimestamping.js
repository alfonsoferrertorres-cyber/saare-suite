// packages/merkle-eidas/eidasTimestamping.js — Adaptador RFC 3161 (JSON + ASN.1 DER) y Contingencia Local

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

function hexToBytes32(hex) {
  const clean = String(hex).trim().toLowerCase();
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes) {
  if (!bytes || bytes.length === 0) return "";
  const chunkSize = 0x8000;
  const chunks = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    let binary = "";
    for (let j = 0; j < slice.length; j++) {
      binary += String.fromCharCode(slice[j]);
    }
    chunks.push(btoa(binary));
  }
  return chunks.join("");
}

/**
 * Lee una longitud ASN.1 DER en `offset`.
 * Devuelve `{ length, nextOffset }` o `null` si está truncada o no es válida.
 */
function readDerLength(bytes, offset) {
  if (!bytes || offset >= bytes.length) return null;
  const first = bytes[offset];
  if (first === 0x80) return null; // Indefinite length no válida en DER estricto
  if ((first & 0x80) === 0) {
    return { length: first, nextOffset: offset + 1 };
  }
  const numOctets = first & 0x7f;
  if (numOctets > 4 || offset + 1 + numOctets > bytes.length) return null;
  let length = 0;
  for (let i = 0; i < numOctets; i++) {
    length = (length << 8) | bytes[offset + 1 + i];
    if (length < 0) return null;
  }
  return { length, nextOffset: offset + 1 + numOctets };
}

/**
 * Lee un TLV ASN.1 DER en `offset`.
 */
function readDerTlv(bytes, offset) {
  if (!bytes || offset >= bytes.length) return null;
  const tag = bytes[offset];
  const lenInfo = readDerLength(bytes, offset + 1);
  if (!lenInfo) return null;
  const valueStart = lenInfo.nextOffset;
  const valueEnd = valueStart + lenInfo.length;
  if (valueEnd > bytes.length) return null;
  return {
    tag,
    length: lenInfo.length,
    valueStart,
    valueEnd,
    nextOffset: valueEnd
  };
}

/**
 * Parsea la respuesta DER RFC 3161 (`TimeStampResp ::= SEQUENCE { status PKIStatusInfo, timeStampToken ... }`)
 * y verifica que `PKIStatus` sea 0 (granted) o 1 (grantedWithMods).
 */
function parseRfc3161Response(bytes) {
  if (!bytes || bytes.length < 7) {
    return { granted: false, status: null, hasToken: false, reason: "Respuesta ASN.1 DER vacía o truncada" };
  }

  const outerResp = readDerTlv(bytes, 0);
  if (!outerResp || outerResp.tag !== 0x30) {
    return { granted: false, status: null, hasToken: false, reason: "La respuesta no es una SEQUENCE ASN.1 válida" };
  }

  const statusInfo = readDerTlv(bytes, outerResp.valueStart);
  if (!statusInfo || statusInfo.tag !== 0x30) {
    return { granted: false, status: null, hasToken: false, reason: "PKIStatusInfo ausente o inválido en TimeStampResp" };
  }

  const pkiStatus = readDerTlv(bytes, statusInfo.valueStart);
  if (!pkiStatus || pkiStatus.tag !== 0x02 || pkiStatus.length < 1 || pkiStatus.length > 4) {
    return { granted: false, status: null, hasToken: false, reason: "PKIStatus INTEGER no encontrado en PKIStatusInfo" };
  }

  let statusVal = 0;
  for (let i = pkiStatus.valueStart; i < pkiStatus.valueEnd; i++) {
    statusVal = (statusVal << 8) | bytes[i];
  }

  const hasToken = statusInfo.nextOffset < outerResp.valueEnd;
  const granted = (statusVal === 0 || statusVal === 1) && hasToken;

  if (!granted) {
    const reason =
      statusVal === 0 || statusVal === 1
        ? "PKIStatus concedido pero falta timeStampToken en TimeStampResp"
        : `PKIStatus no concedido (valor=${statusVal})`;
    return { granted: false, status: statusVal, hasToken, reason };
  }

  return { granted: true, status: statusVal, hasToken: true, reason: null };
}

/**
 * Construye una petición ASN.1 DER TimeStampReq (RFC 3161) para un digest SHA-256 de 32 bytes.
 */
function buildRfc3161Sha256Query(cleanRootHex) {
  const digestBytes = hexToBytes32(cleanRootHex);
  const nonceBytes = new Uint8Array(8);
  crypto.getRandomValues(nonceBytes);
  nonceBytes[0] &= 0x7f;

  const prefix = new Uint8Array([
    0x30, 0x41,
    0x02, 0x01, 0x01,
    0x30, 0x31,
    0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00,
    0x04, 0x20
  ]);
  const noncePrefix = new Uint8Array([0x02, 0x08]);
  const certReqTrue = new Uint8Array([0x01, 0x01, 0xff]);

  const query = new Uint8Array(
    prefix.length + digestBytes.length + noncePrefix.length + nonceBytes.length + certReqTrue.length
  );
  let offset = 0;
  query.set(prefix, offset); offset += prefix.length;
  query.set(digestBytes, offset); offset += digestBytes.length;
  query.set(noncePrefix, offset); offset += noncePrefix.length;
  query.set(nonceBytes, offset); offset += nonceBytes.length;
  query.set(certReqTrue, offset);

  return query;
}

function shouldUseBinaryRfc3161(tsaUrl, options, env) {
  if (options?.protocol === "json" || env?.EIDAS_TSA_PROTOCOL === "json") return false;
  if (options?.protocol === "rfc3161" || env?.EIDAS_TSA_PROTOCOL === "rfc3161") return true;
  const lower = String(tsaUrl || "").toLowerCase();
  return lower.includes("/tsr") || lower.includes("freetsa") || lower.includes("digicert") || lower.includes("sectigo");
}

function isTsaFallbackAllowed(options, env) {
  if (typeof options?.allowFallback === "boolean") return options.allowFallback;
  const raw = env?.EIDAS_ALLOW_FALLBACK ?? env?.ALLOW_TSA_FALLBACK;
  if (raw === undefined || raw === null || raw === "") return true;
  return String(raw).trim().toLowerCase() !== "false" && String(raw).trim() !== "0";
}

/**
 * Sella una Merkle Root con soporte para TSA RFC 3161 (ASN.1 DER o JSON) y contingencia local explícita.
 * Nunca marca `isQualifiedEidas: true` si no hay confirmación real y explícita de cualificación.
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
      qualificationNote: "Custodia local SHA-256 sin TSA configurada"
    });
  }

  const timeoutMs = Number(options?.timeoutMs || env?.EIDAS_TSA_TIMEOUT_MS || 8000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const useBinaryRfc3161 = shouldUseBinaryRfc3161(tsaUrl, options, env);

  try {
    if (useBinaryRfc3161) {
      const tsqBytes = buildRfc3161Sha256Query(cleanRoot);
      const headers = {
        "Content-Type": "application/timestamp-query",
        "Accept": "application/timestamp-reply"
      };
      if (tsaApiKey) {
        headers.Authorization = `Bearer ${tsaApiKey}`;
      }

      const response = await fetch(tsaUrl, {
        method: "POST",
        headers,
        body: tsqBytes,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`TSA RFC 3161 respondió con estado HTTP ${response.status}`);
      }

      const tsrBytes = new Uint8Array(await response.arrayBuffer());
      const parsedReply = parseRfc3161Response(tsrBytes);
      if (!parsedReply.granted) {
        throw new Error(`La respuesta ASN.1 RFC 3161 no indica PKIStatus concedido (${parsedReply.reason})`);
      }

      const tsrBase64 = bytesToBase64(tsrBytes);
      const tsqBase64 = bytesToBase64(tsqBytes);
      const rfc3161SealHash = await sha256Hex({
        ...digestPayload,
        tsaUrl,
        tsrSha256: await sha256Hex(tsrBase64)
      });

      const hostTag = (() => {
        try {
          return new URL(tsaUrl).hostname.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
        } catch {
          return "RFC3161_TSA";
        }
      })();

      return Object.freeze({
        status: "SEALED_RFC3161_STANDARD",
        mode: "RFC3161_BINARY_TSA",
        assuranceLevel: "RFC3161_STANDARD",
        isQualifiedEidas: false,
        merkleRoot: cleanRoot,
        tenantId,
        expedienteId,
        leafCount,
        timestampUtc: issuedAt,
        sealHash: rfc3161SealHash,
        tsaReference: `RFC3161-${hostTag}-${rfc3161SealHash.slice(0, 12).toUpperCase()}`,
        provider: tsaUrl,
        pkiStatus: parsedReply.status,
        tsqBase64,
        tsrBase64,
        qualificationNote: "Sello de tiempo electrónico RFC 3161 obtenido de TSA externa (eIDAS Art. 41.1)"
      });
    }

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
      throw new Error("La respuesta de la TSA no incluye token o comprobante verificable");
    }

    const isQualified = Boolean(data?.qualified === true || data?.eidasQualified === true);
    const qualifiedSealHash = await sha256Hex({
      ...digestPayload,
      tsaTokenOrReceipt,
      providerVerifiedAt: data?.timestamp || issuedAt
    });

    return Object.freeze({
      status: isQualified ? "SEALED_QUALIFIED_EIDAS" : "SEALED_TSA_TOKEN",
      mode: isQualified ? "QUALIFIED_TSA_EIDAS" : "TSA_JSON_TOKEN",
      assuranceLevel: isQualified ? "QUALIFIED" : "TSA_VERIFIED",
      isQualifiedEidas: isQualified,
      merkleRoot: cleanRoot,
      tenantId,
      expedienteId,
      leafCount,
      timestampUtc: String(data?.timestamp || issuedAt),
      sealHash: qualifiedSealHash,
      tsaReference: String(tsaTokenOrReceipt),
      provider: String(data?.provider || data?.tsaName || tsaUrl),
      qualificationNote: isQualified
        ? "Sello de tiempo cualificado eIDAS verificado desde proveedor TSA"
        : "Comprobante de sellado temporal obtenido desde endpoint TSA"
    });
  } catch (error) {
    if (!isTsaFallbackAllowed(options, env)) {
      throw new Error(`Fallo en sellado TSA (${tsaUrl}): ${error?.message || "Error desconocido"}`);
    }

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
      qualificationNote: "Contingencia local aplicada: no se ha confirmado sello de TSA externa"
    });
  } finally {
    clearTimeout(timer);
  }
}

export default {
  timestampMerkleRoot
};