import fs from "fs";
const code = `import crypto from "crypto";
import fs from "fs";
import path from "path";
export class EnterpriseKeyManager {
  constructor(keysDir = "./evidence/keys") {
    this.keysDir = path.resolve(keysDir);
    this.keyStore = new Map();
    this.activeKeyId = null;
    this._initializeKeyStore();
  }
  _initializeKeyStore() {
    if (!fs.existsSync(this.keysDir)) {
      fs.mkdirSync(this.keysDir, { recursive: true });
    }
    // Cargar clave primaria por defecto
    const pubPath = path.join(this.keysDir, "ed25519_public.pem");
    const privPath = path.join(this.keysDir, "ed25519_private.pem");
    if (fs.existsSync(pubPath) && fs.existsSync(privPath)) {
      const pubKey = fs.readFileSync(pubPath, "utf-8");
      const privKey = fs.readFileSync(privPath, "utf-8");
      this.keyStore.set("ed25519_pub_prod_01", { pubKey, privKey, status: "ACTIVE" });
      this.activeKeyId = "ed25519_pub_prod_01";
    }
  }
  rotateKey() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });
    const newKeyId = "ed25519_pub_v3_" + crypto.randomBytes(3).toString("hex");
    // Marcar clave actual como ROTATED
    if (this.activeKeyId && this.keyStore.has(this.activeKeyId)) {
      this.keyStore.get(this.activeKeyId).status = "ROTATED";
    }
    // Registrar nueva clave activa
    this.keyStore.set(newKeyId, { pubKey: publicKey, privKey: privateKey, status: "ACTIVE" });
    this.activeKeyId = newKeyId;
    return { activeKeyId: newKeyId, previousKeyStatus: "ROTATED" };
  }
  getSigningKey() {
    const active = this.keyStore.get(this.activeKeyId);
    if (!active) throw new Error("[CRYPTO_ERROR] No hay clave activa configurada.");
    return { keyId: this.activeKeyId, privKey: active.privKey };
  }
  getPublicKey(keyId) {
    const key = this.keyStore.get(keyId);
    if (!key) throw new Error("[CRYPTO_ERROR] Key ID no encontrado en KeyStore: " + keyId);
    return key.pubKey;
  }
}
`;
fs.writeFileSync("keyManager.js", code);
console.log("=== keyManager.js generado exitosamente ===");

