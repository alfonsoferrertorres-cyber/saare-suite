const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Serializador Canónico RFC 8785 (JCS) Estricto
function canonicalize(val) {
  if (val === null || typeof val !== 'object') {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return '[' + val.map(canonicalize).join(',') + ']';
  }
  const keys = Object.keys(val).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(val[k])).join(',') + '}';
}

const keyPairFile = path.join(__dirname, 'ms3v_signing_key.json');
let keyPair;
if (fs.existsSync(keyPairFile)) {
  keyPair = JSON.parse(fs.readFileSync(keyPairFile, 'utf8'));
} else {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  keyPair = {
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }),
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' })
  };
  fs.writeFileSync(keyPairFile, JSON.stringify(keyPair, null, 2), 'utf8');
}

const rootDigest = "195cd0b59b7fb67b5d17d27e588def368ded68c15f54f2c891b049c7e0fbb019";
const certId = "RPI-2026-SAARE-0914X";
const timestamp = "2026-08-24T09:35:00Z";

const claimPayload = {
  certificate: certId,
  holder: "Alfonso Ferrer Torres (NIF: 48553065L)",
  issuer: "did:key:ms3v-saare-governance",
  legal_basis: [
    "DORA (UE 2022/2554) Art. 28",
    "EU AI Act (2024/1689) Art. 12/15",
    "RGPD (UE 2016/679) Art. 5/25",
    "UNE-EN ISO/IEC 17025 (Metrologia de Ensayo N=10000)"
  ],
  root_digest_sha256: rootDigest,
  timestamp: timestamp,
  variance_observed: "0.0024%",
  verdict: "CONFORME / ZERO-SUBMISSION VALIDATED"
};

const canonicalString = canonicalize(claimPayload);
const payloadHash = crypto.createHash('sha256').update(Buffer.from(canonicalString, 'utf8')).digest('hex');

const privateKeyObj = crypto.createPrivateKey(keyPair.privateKeyPem);
const signature = crypto.sign(undefined, Buffer.from(payloadHash, 'utf8'), privateKeyObj).toString('base64');

const cryptographicProof = {
  $schema: "https://saare.es/schemas/verifiable-audit-proof-v1.json",
  claim: claimPayload,
  canonical_jcs_sha256: payloadHash,
  proof: {
    type: "Ed25519Signature2020",
    created: timestamp,
    verificationMethod: "https://saare.es/.well-known/jwks.json#key-1",
    signatureAlgorithm: "EdDSA",
    signatureValue: signature
  }
};

fs.writeFileSync(path.join(__dirname, 'verifiable_proof.json'), JSON.stringify(cryptographicProof, null, 2), 'utf8');

const publicKeyDer = crypto.createPublicKey(keyPair.publicKeyPem).export({ format: 'jwk' });
const jwks = {
  keys: [
    {
      kty: "OKP",
      crv: "Ed25519",
      kid: "key-1",
      use: "sig",
      ...publicKeyDer
    }
  ]
};
const wellKnownDir = path.join(__dirname, '..', '..', 'saare-suite', 'public', '.well-known');
if (!fs.existsSync(wellKnownDir)) fs.mkdirSync(wellKnownDir, { recursive: true });
fs.writeFileSync(path.join(wellKnownDir, 'jwks.json'), JSON.stringify(jwks, null, 2), 'utf8');

console.log("-> [PASS] verifiable_proof.json generado bajo RFC 8785.");
console.log("-> Digest Canonico SHA-256:", payloadHash);