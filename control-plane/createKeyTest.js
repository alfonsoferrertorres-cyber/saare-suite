import fs from "fs";
const code = `import crypto from "crypto";
import { EnterpriseKeyManager } from "./keyManager.js";
console.log("=== SUITE V3.2 - ENTERPRISE KEY MANAGEMENT & HOT-SWAP TEST ===");
const keyMgr = new EnterpriseKeyManager();
// 1. Firmar evidencia con clave inicial (v1)
const initialKey = keyMgr.getSigningKey();
console.log("\\n[FASE 1] Clave Activa Inicial:", initialKey.keyId);
const payloadData = Buffer.from(JSON.stringify({ verdict: "REJECTED", reason: "Hostile Injection #412" }));
const signatureV1 = crypto.sign(null, payloadData, initialKey.privKey).toString("hex");
// 2. Ejecutar Rotación en Caliente (Hot-Swap)
console.log("\\n[FASE 2] Ejecutando Rotación Criptográfica de Clave...");
const rotationResult = keyMgr.rotateKey();
console.log("  -> Nueva Clave Activa:", rotationResult.activeKeyId);
// 3. Firmar nueva evidencia con la clave v3
const newKey = keyMgr.getSigningKey();
const signatureV2 = crypto.sign(null, payloadData, newKey.privKey).toString("hex");
// 4. Verificar Retrocompatibilidad
console.log("\\n[FASE 3] Verificando Evidencias Históricas y Actuales...");
const pubV1 = keyMgr.getPublicKey(initialKey.keyId);
const pubV2 = keyMgr.getPublicKey(newKey.keyId);
const v1Valid = crypto.verify(null, payloadData, pubV1, Buffer.from(signatureV1, "hex"));
const v2Valid = crypto.verify(null, payloadData, pubV2, Buffer.from(signatureV2, "hex"));
console.log("  -> Verificación Firma Histórica (Clave Rotada):", v1Valid);
console.log("  -> Verificación Firma Nueva (Clave Activa):", v2Valid);
if (v1Valid && v2Valid && initialKey.keyId !== newKey.keyId) {
  console.log("\\n=== KEY ROTATION & BACKWARD COMPATIBILITY VERIFIED (PASS) ===");
} else {
  console.error("\\n=== FAIL EN KEY ROTATION ===");
  process.exit(1);
}
`;
fs.writeFileSync("testKeyRotation.js", code);
console.log("=== testKeyRotation.js generado exitosamente ===");

