/**
 * Utility de Criptografía Client-Side (Web Crypto API)
 * Protocolo SGP 1.0 — S.A.A.R.E. SL
 */

export async function sha256Hex(value) {
  if (value === null || value === undefined) return '';
  
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const data = new TextEncoder().encode(text);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}