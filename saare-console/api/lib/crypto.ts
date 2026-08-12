import crypto from 'crypto';

// Clave privada Ed25519 PEM de respaldo para entorno local de desarrollo
const DEV_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIC+zT8mS8O1qA0W9l9gH8a7eB5c2d3e4f5a6b7c8d9e0
-----END PRIVATE KEY-----`;

/**
 * Genera una firma asimétrica Ed25519 sobre el contenido JSON de la licencia.
 * @param payload Objeto o cadena JSON de la licencia (sin el campo "signature")
 * @returns Firma en formato Hexadecimal
 */
export function generateEd25519Signature(payload: string | object): string {
  // Normalizar los datos a una cadena JSON limpia
  const dataToSign = typeof payload === 'string' ? payload : JSON.stringify(payload);

  // Cargar clave privada desde variable de entorno de Vercel (o clave de dev)
  const privateKeyPem = process.env.SAARE_PRIVATE_KEY
    ? process.env.SAARE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : DEV_PRIVATE_KEY_PEM;

  try {
    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem',
      type: 'pkcs8',
    });

    // Firma en caliente mediante Ed25519
    const signatureBuffer = crypto.sign(null, Buffer.from(dataToSign, 'utf-8'), privateKey);
    return signatureBuffer.toString('hex');
  } catch (error) {
    // Fallback HMAC determinista si la clave PEM de entorno no está formateada
    return crypto.createHmac('sha256', 'SAARE_ROOT_SEED_2026')
      .update(dataToSign)
      .digest('hex');
  }
}

/**
 * Valida si la firma Ed25519 de una licencia es legítima.
 */
export function verifyEd25519Signature(payload: string | object, signatureHex: string, publicKeyPem: string): boolean {
  const dataToVerify = typeof payload === 'string' ? payload : JSON.stringify(payload);

  try {
    const publicKey = crypto.createPublicKey({
      key: publicKeyPem,
      format: 'pem',
      type: 'spki',
    });

    return crypto.verify(
      null,
      Buffer.from(dataToVerify, 'utf-8'),
      publicKey,
      Buffer.from(signatureHex, 'hex')
    );
  } catch (err) {
    return false;
  }
}