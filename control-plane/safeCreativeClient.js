// control-plane/safeCreativeClient.js
import { computeSha256 } from "./keyManager.js";

/**
 * Registra una Raíz de Merkle en la API externa para sellar la Doble Cadena de Custodia.
 * Únicamente transmite Hashes y firmas, protegiendo el secreto empresarial.
 */
export async function registerEvidenceInSafeCreative(anchorData, env) {
  const apiKey = env?.SAFE_CREATIVE_API_KEY;
  const sharedSecret = env?.SAFE_CREATIVE_SHARED_SECRET;

  if (!apiKey || !sharedSecret) {
    console.log("[SafeCreative API] Claves no detectadas en entorno. Operando con Bóveda Criptográfica D1 Interna.");
    return { success: false, reason: "NO_API_KEYS" };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID();
    const title = `SAARE Merkle Anchor Batch: ${anchorData.id}`;

    const signatureBase = `POST&https://api.safecreative.org/v2/work/register&${nonce}&${timestamp}&${apiKey}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(sharedSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(signatureBase));
    const authSignature = Array.from(new Uint8Array(signatureBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    const apiPayload = {
      title: title,
      workType: "TECHNICAL_EVIDENCE",
      checksum: anchorData.merkleRoot,
      checksumAlgorithm: "SHA-256",
      extraData: JSON.stringify({
        node: "2607076315021",
        batchSize: anchorData.batchSize,
        trustAnchor: "SAARE-MD-IPRES-2026",
        standard: "ISO/IEC 27037:2012 / EU AI Act Art. 27"
      })
    };

    const response = await fetch("https://api.safecreative.org/v2/work/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SafeCreative-ApiKey": apiKey,
        "X-SafeCreative-Nonce": nonce,
        "X-SafeCreative-Timestamp": timestamp,
        "X-SafeCreative-Signature": authSignature
      },
      body: JSON.stringify(apiPayload)
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && result.code) {
      console.log(`[SafeCreative API] Anclaje por Lote Registrado. Código: ${result.code}`);
      return { success: true, registryCode: result.code };
    }
    return { success: false, error: result };
  } catch (err) {
    console.error("[SafeCreative API] Error al conectar con el registro externo:", err);
    return { success: false, error: err.message };
  }
}