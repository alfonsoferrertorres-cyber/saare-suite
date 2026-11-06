/**
 * Utility de Criptografía Client-Side (Web Crypto API)
 * Protocolo SGP 1.0 — S.A.A.R.E. SL
 */

export async function sha256Hex(value) {
  if (value === null || value === undefined) return '';
  
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const data = new TextEncoder().encode(text);

  const cryptoObj = typeof window !== 'undefined' ? (window.crypto || window.msCrypto) : null;
  
  if (!cryptoObj || !cryptoObj.subtle) {
    console.warn('[SAARE Crypto] Web Crypto API no disponible en este entorno.');
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }

  const digest = await cryptoObj.subtle.digest('SHA-256', data);
  
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}