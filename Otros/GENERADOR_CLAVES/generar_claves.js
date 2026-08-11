import crypto from 'crypto';

console.log("Generando par de claves criptográficas Ed25519...\n");

// 1. Generación de las claves
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

// 2. Exportar Clave Privada (Formato PEM para Vercel)
const privateKeyPem = privateKey.export({
    type: 'pkcs8',
    format: 'pem'
});

// 3. Exportar Clave Pública (Extrayendo los 32 bytes puros para Rust)
const publicKeyDer = publicKey.export({ type: 'spki', format: 'der' });
const rawPublicKeyBytes = publicKeyDer.subarray(-32); // Rust necesita exactamente los 32 bytes crudos
const rustByteArray = `[${rawPublicKeyBytes.join(', ')}]`;

console.log("==================================================");
console.log("🔒 1. CLAVE PRIVADA (Pega esto en Vercel como SAARE_PRIVATE_KEY)");
console.log("==================================================");
console.log(privateKeyPem);

console.log("==================================================");
console.log("🛡️ 2. CLAVE PÚBLICA (Pega esto en tu core/src/crypto.rs)");
console.log("==================================================");
console.log(`pub const PUBLIC_KEY: [u8; 32] = ${rustByteArray};\n`);

console.log("⚠️ ATENCIÓN: Guarda estos datos en tu gestor de contraseñas y destruye este archivo si es necesario.");