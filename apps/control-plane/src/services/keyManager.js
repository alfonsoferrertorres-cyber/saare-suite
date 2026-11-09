// control-plane/keyManager.js — Firma Criptográfica Web Crypto & Resiliencia Ed25519
export const CANONICAL_HASH = "SHA-256";
export const CANONICAL_SIG = "Ed25519";

export async function computeSha256(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(typeof data === "string" ? data : JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

let cachedCryptoKey = null;
let cachedRawPem = null;

export class EnterpriseKeyManager {
  constructor(env) {
    this.env = env;
  }

  getActivePrivateKey() {
    return this.env?.ED25519_PRIVATE_KEY || null;
  }

  async deriveEd25519Signature(data) {
    const privateKeyRaw = this.getActivePrivateKey();
    const encoder = new TextEncoder();
    const dataToSign = typeof data === "string" ? data : JSON.stringify(data);

    if (!privateKeyRaw) {
      const fallbackHash = await computeSha256(dataToSign);
      return `ED25519_MOCK_SEAL_${fallbackHash.substring(0, 32).toUpperCase()}`;
    }

    try {
      if (!cachedCryptoKey || cachedRawPem !== privateKeyRaw) {
        cachedCryptoKey = await crypto.subtle.importKey(
          "pkcs8",
          this.pemToArrayBuffer(privateKeyRaw),
          { name: "Ed25519" },
          false,
          ["sign"]
        );
        cachedRawPem = privateKeyRaw;
      }

      const signatureBuffer = await crypto.subtle.sign(
        "Ed25519",
        cachedCryptoKey,
        encoder.encode(dataToSign)
      );

      return Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.warn("[EnterpriseKeyManager] Excepción al firmar con Ed25519, aplicando sello de contingencia:", error.message);
      const fallbackHash = await computeSha256(dataToSign);
      return `ED25519_EMERGENCY_SIG_${fallbackHash.substring(0, 32).toUpperCase()}`;
    }
  }

  pemToArrayBuffer(pem) {
    const b64Lines = pem.replace(/-----(BEGIN|END)[^-----]+-----/g, '').replace(/[\r\n\s]+/g, '');
    const b64Decoded = atob(b64Lines);
    const buffer = new Uint8Array(b64Decoded.length);
    for (let i = 0; i < b64Decoded.length; i++) {
      buffer[i] = b64Decoded.charCodeAt(i);
    }
    return buffer.buffer;
  }
}