// control-plane/src/services/keyManager.js — Firma y Verificación Criptográfica Web Crypto Ed25519 (Multitenant)
export const CANONICAL_HASH = "SHA-256";
export const CANONICAL_SIG = "Ed25519";

export async function computeSha256(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(
    typeof data === "string" ? data : JSON.stringify(data)
  );
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const signKeyCache = new Map();
const verifyKeyCache = new Map();

function normalizeTenantSuffix(tenantId = "") {
  return String(tenantId || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_");
}

export class EnterpriseKeyManager {
  constructor(env) {
    this.env = env;
  }

  getActivePrivateKey(tenantId = "") {
    const suffix = normalizeTenantSuffix(tenantId);
    const tenantKey = suffix ? this.env?.[`ED25519_PRIVATE_KEY_${suffix}`] : null;
    const raw = tenantKey || this.env?.ED25519_PRIVATE_KEY;
    return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
  }

  getActivePublicKey(tenantId = "") {
    const suffix = normalizeTenantSuffix(tenantId);
    const tenantPubKey = suffix ? this.env?.[`ED25519_PUBLIC_KEY_${suffix}`] : null;
    const raw = tenantPubKey || this.env?.ED25519_PUBLIC_KEY;
    return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
  }

  hasPrivateKeyConfigured(tenantId = "") {
    return Boolean(this.getActivePrivateKey(tenantId));
  }

  hasPublicKeyConfigured(tenantId = "") {
    return Boolean(this.getActivePublicKey(tenantId));
  }

  async deriveEd25519Signature(data, tenantId = "") {
    const privateKeyRaw = this.getActivePrivateKey(tenantId);
    const encoder = new TextEncoder();
    const dataToSign = typeof data === "string" ? data : JSON.stringify(data);

    if (!privateKeyRaw) {
      const fallbackHash = await computeSha256(dataToSign);
      return `ED25519_MOCK_SEAL_${fallbackHash.substring(0, 32).toUpperCase()}`;
    }

    try {
      let signKey = signKeyCache.get(privateKeyRaw);
      if (!signKey) {
        signKey = await crypto.subtle.importKey(
          "pkcs8",
          this.pemToArrayBuffer(privateKeyRaw),
          { name: "Ed25519" },
          false,
          ["sign"]
        );
        signKeyCache.set(privateKeyRaw, signKey);
      }

      const signatureBuffer = await crypto.subtle.sign(
        "Ed25519",
        signKey,
        encoder.encode(dataToSign)
      );

      return Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch (error) {
      console.warn(
        "[EnterpriseKeyManager] Excepción al firmar con Ed25519, aplicando sello de contingencia:",
        error.message
      );
      const fallbackHash = await computeSha256(dataToSign);
      return `ED25519_EMERGENCY_SIG_${fallbackHash.substring(0, 32).toUpperCase()}`;
    }
  }

  async verifyEd25519Signature(data, signatureHex, tenantId = "", overridePublicPem = null) {
    const publicKeyRaw = overridePublicPem || this.getActivePublicKey(tenantId);
    const cleanSig = String(signatureHex || "").trim();

    if (!publicKeyRaw) {
      return {
        valid: false,
        reason: "MISSING_ED25519_PUBLIC_KEY",
        tenantId: normalizeTenantSuffix(tenantId) || "GLOBAL"
      };
    }

    if (!/^[0-9a-fA-F]{128}$/.test(cleanSig)) {
      return {
        valid: false,
        reason: "INVALID_ED25519_SIGNATURE_HEX_FORMAT",
        tenantId: normalizeTenantSuffix(tenantId) || "GLOBAL"
      };
    }

    try {
      let verifyKey = verifyKeyCache.get(publicKeyRaw);
      if (!verifyKey) {
        verifyKey = await crypto.subtle.importKey(
          "spki",
          this.pemToArrayBuffer(publicKeyRaw),
          { name: "Ed25519" },
          false,
          ["verify"]
        );
        verifyKeyCache.set(publicKeyRaw, verifyKey);
      }

      const sigBytes = new Uint8Array(
        cleanSig.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );
      const encoder = new TextEncoder();
      const dataToVerify = typeof data === "string" ? data : JSON.stringify(data);

      const isValid = await crypto.subtle.verify(
        "Ed25519",
        verifyKey,
        sigBytes,
        encoder.encode(dataToVerify)
      );

      return {
        valid: Boolean(isValid),
        reason: isValid ? "VERIFIED_ED25519_SPKI" : "SIGNATURE_MISMATCH",
        tenantId: normalizeTenantSuffix(tenantId) || "GLOBAL"
      };
    } catch (error) {
      return {
        valid: false,
        reason: `VERIFY_ERROR: ${error.message}`,
        tenantId: normalizeTenantSuffix(tenantId) || "GLOBAL"
      };
    }
  }

  pemToArrayBuffer(pem) {
    let cleaned = String(pem || "").trim();
    const compactB64 = cleaned.replace(/[\r\n\s]+/g, "");

    if (!cleaned.includes("-----BEGIN") && /^[A-Za-z0-9+/=]+$/.test(compactB64)) {
      try {
        const onceDecoded = atob(compactB64);
        if (onceDecoded.includes("-----BEGIN")) {
          cleaned = onceDecoded;
        } else {
          const bytes = new Uint8Array(onceDecoded.length);
          for (let i = 0; i < onceDecoded.length; i++) {
            bytes[i] = onceDecoded.charCodeAt(i);
          }
          return bytes.buffer;
        }
      } catch {
        // Continuar con tratamiento PEM estándar
      }
    }

    const b64Lines = cleaned
      .replace(/-----(BEGIN|END)[^-----]+-----/g, "")
      .replace(/[\r\n\s]+/g, "");
    const b64Decoded = atob(b64Lines);
    const buffer = new Uint8Array(b64Decoded.length);
    for (let i = 0; i < b64Decoded.length; i++) {
      buffer[i] = b64Decoded.charCodeAt(i);
    }
    return buffer.buffer;
  }
}

export default EnterpriseKeyManager;