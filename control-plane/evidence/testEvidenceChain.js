import fs from "fs";
import path from "path";
import { verifyReceiptOffline } from "./offlineVerifier.js";
import crypto from "crypto";

const keysDir = path.resolve("./keys");
const publicKeyPem = fs.readFileSync(path.join(keysDir, "ed25519_public.pem"), "utf-8");
const privateKeyPem = fs.readFileSync(path.join(keysDir, "ed25519_private.pem"), "utf-8");

console.log("=== SUITE DE PRUEBAS CRIPTOGRAFICAS OFFLINE (Ed25519 Native) ===");

// 1. Definir Payload Canónico
const canonical = {
  "@context": "https://schema.saare.ai/v1/evidence.jsonld",
  "type": "GovernanceDecisionReceipt",
  "evidenceId": "ev_test_1001",
  "scenario": "cumplimiento_corporativo_es",
  "timestamp": new Date().toISOString(),
  "decision": "REJECTED",
  "reason": "Prompt Injection Pattern #412"
};

const canonicalString = JSON.stringify(canonical);
const hash = crypto.createHash("sha256").update(canonicalString).digest("hex");

// Firma Ed25519 directa sobre la cadena canónica
const signatureBuffer = crypto.sign(null, Buffer.from(canonicalString, "utf-8"), privateKeyPem);
const signatureBase64 = signatureBuffer.toString("base64");

const fullReceipt = {
  ...canonical,
  contentHash: hash,
  signature: signatureBase64
};

fs.writeFileSync("test_receipt.jsonld", JSON.stringify(fullReceipt, null, 2));

// Test 1: Verificación de Recibo Legítimo
const test1 = verifyReceiptOffline("test_receipt.jsonld", publicKeyPem);
console.log("\n[TEST 1 - Legitimo]:", test1);

// Test 2: Intento de Alteración (Tampering de REJECTED a VALIDATED)
const tampered = { ...fullReceipt, decision: "VALIDATED" };
fs.writeFileSync("tampered_receipt.jsonld", JSON.stringify(tampered, null, 2));

const test2 = verifyReceiptOffline("tampered_receipt.jsonld", publicKeyPem);
console.log("\n[TEST 2 - Intento de Tampering]:", test2);

// Limpieza de archivos temporales
fs.unlinkSync("test_receipt.jsonld");
fs.unlinkSync("tampered_receipt.jsonld");

console.log("\n=== PRUEBA CRIPTOGRAFICA COMPLETADA ===");

