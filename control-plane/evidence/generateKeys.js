import crypto from "crypto";
import fs from "fs";
import path from "path";

const keysDir = path.resolve("./keys");
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" }
});

fs.writeFileSync(path.join(keysDir, "ed25519_private.pem"), privateKey);
fs.writeFileSync(path.join(keysDir, "ed25519_public.pem"), publicKey);

console.log("[OK] Par de claves Ed25519 generado en ./keys/");
