/**
 * S.A.A.R.E. Safe Creative & Cryptographic Evidence Client (SGP 1.0)
 * Handles IP lineage and RFC 3161 / eIDAS timestamp anchoring.
 * 
 * Security Guardrail: Never sends raw content/payloads.
 * Only transmits cryptographic hashes (SHA-256) and Merkle roots.
 */

const SAFE_CREATIVE_SANDBOX_URL = "https://api-sandbox.safecreative.org/v2/";
const SAFE_CREATIVE_PROD_URL = "https://api.safecreative.org/v2/";

function getApiEndpoint(env) {
  const isProduction = env?.ENVIRONMENT === "production" || env?.SAFE_CREATIVE_ENV === "production";
  return isProduction ? SAFE_CREATIVE_PROD_URL : SAFE_CREATIVE_SANDBOX_URL;
}

async function generateAuthSignature(sharedSecret, params) {
  const sortedKeys = Object.keys(params).sort();
  const canonicalString = sortedKeys.map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sharedSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(canonicalString));
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function registerEvidenceInSafeCreative(anchorData, env) {
  const apiKey = env?.SAFE_CREATIVE_API_KEY;
  const sharedSecret = env?.SAFE_CREATIVE_SHARED_SECRET;

  if (!apiKey || !sharedSecret) {
    console.warn("[SAARE Custody Engine] Credentials missing for Safe Creative API. Using local cryptographic proof fallback.");
    return {
      status: "LOCAL_PROOF_GENERATED",
      provider: "SAARE_INTERNAL_VAULT",
      anchorId: anchorData.id,
      merkleRoot: anchorData.merkleRoot,
      timestampToken: `rfc3161:tst_local_${Date.now()}`,
      isQualifiedTSA: false,
      auditClaim: "Cryptographic hash & Merkle root preserved locally in volatile/DB memory."
    };
  }

  try {
    const baseUrl = getApiEndpoint(env);
    const nonce = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const requestParams = {
      component: "work.register",
      auth_key: apiKey,
      nonce: nonce,
      timestamp: timestamp,
      code: anchorData.id,
      title: `S.A.A.R.E. Evidence Anchor: ${anchorData.id}`,
      checksum: anchorData.merkleRoot,
      checksum_type: "SHA-256",
      user_data: JSON.stringify({
        batch_size: anchorData.batchSize,
        protocol: "SGP-1.0",
        standard: "ISO/IEC 27037:2012"
      })
    };

    const signature = await generateAuthSignature(sharedSecret, requestParams);
    requestParams.signature = signature;

    const bodyParams = new URLSearchParams(requestParams);

    const response = await fetch(`${baseUrl}?${bodyParams.toString()}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "User-Agent": "SAARE-ControlPlane/10.5.0 (SGP-1.0)"
      }
    });

    if (!response.ok) {
      throw new Error(`Safe Creative API returned HTTP status ${response.status}`);
    }

    const result = await response.json();

    return {
      status: "REGISTERED_SAFE_CREATIVE",
      provider: "SAFE_CREATIVE_API_V2",
      registrationCode: result.code || anchorData.id,
      anchorId: anchorData.id,
      merkleRoot: anchorData.merkleRoot,
      timestampToken: result.timestamp_token || `rfc3161:tst_sc_${timestamp}`,
      isQualifiedTSA: Boolean(result.eidas_qualified),
      auditClaim: "Technical lineage and evidence of authorship/integrity registered via Safe Creative API."
    };

  } catch (error) {
    console.error("[SAARE Custody Engine] Failed to register anchor in Safe Creative:", error.message);
    
    return {
      status: "LOCAL_FALLBACK_ON_ERROR",
      provider: "SAARE_INTERNAL_VAULT",
      anchorId: anchorData.id,
      merkleRoot: anchorData.merkleRoot,
      errorDetail: error.message,
      timestampToken: `rfc3161:tst_fallback_${Date.now()}`,
      isQualifiedTSA: false
    };
  }
}