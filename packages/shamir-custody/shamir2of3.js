// packages/shamir-custody/shamir2of3.js — Custodia Criptográfica 2-de-3 (Shamir en GF(2^8)) + AES-GCM

const GF256_POLY = 0x11b;

/**
 * Multiplicación en GF(2^8) con polinomio irreducible 0x11b.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function gfMul(a, b) {
  let x = a & 0xff;
  let y = b & 0xff;
  let result = 0;

  while (y > 0) {
    if (y & 1) {
      result ^= x;
    }
    y >>= 1;
    const highBit = x & 0x80;
    x = (x << 1) & 0xff;
    if (highBit) {
      x ^= GF256_POLY & 0xff;
    }
  }

  return result & 0xff;
}

/**
 * Inverso multiplicativo en GF(2^8) (a^254 en GF(2^8)).
 * @param {number} a
 * @returns {number}
 */
function gfInv(a) {
  const clean = a & 0xff;
  if (clean === 0) {
    throw new Error("No existe inverso multiplicativo en GF(2^8) para 0");
  }
  let res = 1;
  let base = clean;
  let exp = 254;

  while (exp > 0) {
    if (exp & 1) {
      res = gfMul(res, base);
    }
    base = gfMul(base, base);
    exp >>= 1;
  }

  return res;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex = "") {
  const clean = String(hex || "").trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(clean) || clean.length % 2 !== 0) {
    throw new Error("Cadena hexadecimal inválida");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Divide un secreto (Uint8Array o hex) en 3 fragmentos (umbral 2-de-3) en GF(2^8).
 * Los índices x usados son 1, 2 y 3 (nunca 0).
 *
 * @param {Uint8Array | string} secretInput
 * @param {Object} [meta]
 * @returns {{
 *   scheme: "SHAMIR_2_OF_3_GF256",
 *   threshold: 2,
 *   totalShares: 3,
 *   meta: Object,
 *   shares: Array<{ index: number, shareHex: string, custodianHint: string }>
 * }}
 */
export function splitSecret2of3(secretInput, meta = {}) {
  const secretBytes =
    secretInput instanceof Uint8Array ? secretInput : hexToBytes(secretInput);

  if (!secretBytes || secretBytes.length === 0) {
    throw new Error("El secreto a dividir no puede estar vacío");
  }

  const slopes = new Uint8Array(secretBytes.length);
  crypto.getRandomValues(slopes);

  const shareBuffers = [
    new Uint8Array(secretBytes.length),
    new Uint8Array(secretBytes.length),
    new Uint8Array(secretBytes.length)
  ];

  const xCoords = [1, 2, 3];

  for (let i = 0; i < secretBytes.length; i++) {
    const s = secretBytes[i] & 0xff;
    const a1 = slopes[i] & 0xff;

    for (let k = 0; k < 3; k++) {
      const x = xCoords[k];
      // f(x) = s + a1 * x en GF(2^8)
      const val = s ^ gfMul(a1, x);
      shareBuffers[k][i] = val;
    }
  }

  const custodianHints = [
    "SHARE_1_CONTROL_PLANE_KMS",
    "SHARE_2_TENANT_CISO_CUSTODY",
    "SHARE_3_RECOVERY_ESCROW_CUSTODY"
  ];

  const shares = xCoords.map((x, idx) => ({
    index: x,
    shareHex: bytesToHex(shareBuffers[idx]),
    custodianHint: custodianHints[idx]
  }));

  // Limpiar material sensible temporal en memoria
  slopes.fill(0);

  return {
    scheme: "SHAMIR_2_OF_3_GF256",
    threshold: 2,
    totalShares: 3,
    meta: {
      tenantId: meta?.tenantId ? String(meta.tenantId).trim().toUpperCase() : null,
      keyId: meta?.keyId ? String(meta.keyId).trim() : null,
      createdAt: new Date().toISOString()
    },
    shares
  };
}

/**
 * Reconstruye el secreto original a partir de al menos 2 fragmentos ({ index, shareHex }).
 *
 * @param {Array<{ index: number, shareHex: string }>} providedShares
 * @returns {Uint8Array}
 */
export function reconstructSecret2of3(providedShares = []) {
  if (!Array.isArray(providedShares) || providedShares.length < 2) {
    throw new Error("Se requieren al menos 2 fragmentos válidos para reconstruir el secreto");
  }

  const selected = providedShares.slice(0, 2).map((item) => {
    const x = Number(item?.index);
    if (!Number.isInteger(x) || x < 1 || x > 255) {
      throw new Error(`Índice de fragmento inválido: ${item?.index}`);
    }
    const bytes = hexToBytes(item?.shareHex);
    return { x, bytes };
  });

  if (selected[0].x === selected[1].x) {
    throw new Error("No se puede reconstruir con dos fragmentos del mismo índice");
  }

  if (selected[0].bytes.length !== selected[1].bytes.length) {
    throw new Error("Los fragmentos tienen longitudes distintas");
  }

  const len = selected[0].bytes.length;
  const reconstructed = new Uint8Array(len);

  // Interpolación de Lagrange en x = 0 para 2 puntos (x0, y0) y (x1, y1):
  // L0(0) = (0 - x1) / (x0 - x1) = x1 / (x0 ^ x1)
  // L1(0) = (0 - x0) / (x1 - x0) = x0 / (x1 ^ x0)
  const [s0, s1] = selected;
  const denom0 = s0.x ^ s1.x;
  const denom1 = s1.x ^ s0.x;

  const lagrange0 = gfMul(s1.x, gfInv(denom0));
  const lagrange1 = gfMul(s0.x, gfInv(denom1));

  for (let i = 0; i < len; i++) {
    const y0 = s0.bytes[i];
    const y1 = s1.bytes[i];
    reconstructed[i] = gfMul(y0, lagrange0) ^ gfMul(y1, lagrange1);
  }

  return reconstructed;
}

/**
 * Cifra un texto/JSON en memoria con AES-256-GCM usando una clave aleatoria de 32 bytes
 * y divide esa clave en 3 fragmentos (2-de-3).
 *
 * @param {string | Object} plaintextData
 * @param {Object} [meta]
 */
export async function encryptWith2of3Key(plaintextData, meta = {}) {
  const text =
    typeof plaintextData === "string" ? plaintextData : JSON.stringify(plaintextData);

  const rawKey = new Uint8Array(32);
  crypto.getRandomValues(rawKey);

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encoded = new TextEncoder().encode(text);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded
  );

  const splitBundle = splitSecret2of3(rawKey, meta);
  rawKey.fill(0);

  return {
    algorithm: "AES-256-GCM+SHAMIR-2-OF-3",
    ivHex: bytesToHex(iv),
    ciphertextHex: bytesToHex(new Uint8Array(cipherBuffer)),
    custody: splitBundle
  };
}

/**
 * Descifra un paquete cifrado con `encryptWith2of3Key` reconstruyendo la clave
 * en RAM a partir de al menos 2 fragmentos.
 *
 * @param {{ ivHex: string, ciphertextHex: string }} encryptedPackage
 * @param {Array<{ index: number, shareHex: string }>} providedShares
 * @returns {Promise<string>}
 */
export async function decryptWith2of3Key(encryptedPackage, providedShares = []) {
  const rawKey = reconstructSecret2of3(providedShares);

  try {
    const iv = hexToBytes(encryptedPackage?.ivHex);
    const ciphertext = hexToBytes(encryptedPackage?.ciphertextHex);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      ciphertext
    );

    return new TextDecoder().decode(plainBuffer);
  } finally {
    rawKey.fill(0);
  }
}

export default {
  splitSecret2of3,
  reconstructSecret2of3,
  encryptWith2of3Key,
  decryptWith2of3Key
};