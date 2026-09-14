// Eliminamos las importaciones de "fs", "path" y el "crypto" de Node.js
export const CANONICAL_HASH = "SHA-256";
export const CANONICAL_SIG = "Ed25519";

// 1. Hash con Web Crypto API
export async function computeSha256(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class EnterpriseKeyManager {
  // Pasamos 'env' al constructor para acceder a los secretos de Cloudflare
  constructor(env) {
    this.env = env;
  }

  // 2. Obtención de claves desde el entorno en lugar del sistema de archivos
  getActivePrivateKey() {
    const privKey = this.env.ED25519_PRIVATE_KEY;
    if (!privKey) {
      throw new Error("[CRYPTO_ERROR] No hay clave privada activa configurada en el entorno.");
    }
    return privKey;
  }

  // 3. Firma optimizada para Edge usando Web Crypto
  async deriveEd25519Signature(data) {
    const privateKeyRaw = this.getActivePrivateKey();
    const encoder = new TextEncoder();
    
    try {
      // Importación de clave en formato Web Crypto
      const key = await crypto.subtle.importKey(
        "pkcs8",
        this.pemToArrayBuffer(privateKeyRaw),
        { name: "Ed25519" },
        false,
        ["sign"]
      );

      const signatureBuffer = await crypto.subtle.sign(
        "Ed25519",
        key,
        encoder.encode(data)
      );

      return Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      throw new Error(`[CRYPTO_ERROR] Fallo al generar firma: ${error.message}`);
    }
  }

  // Utilidad para convertir PEM (de las variables de entorno) a ArrayBuffer
  pemToArrayBuffer(pem) {
    const b64Lines = pem.replace(/(-----(BEGIN|END).*-----)/g, '').replace(/\s+/g, '');
    const b64Decoded = atob(b64Lines);
    const buffer = new Uint8Array(b64Decoded.length);
    for (let i = 0; i < b64Decoded.length; i++) {
      buffer[i] = b64Decoded.charCodeAt(i);
    }
    return buffer.buffer;
  }
}