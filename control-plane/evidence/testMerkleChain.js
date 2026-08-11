import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ChainVault } from "./chainVault.js";

const keysDir = path.resolve("./keys");
const privateKeyPem = fs.readFileSync(path.join(keysDir, "ed25519_private.pem"), "utf-8");

console.log("=== SUITE DE PRUEBAS V1.2 (MERKLE TREE & HASH CHAINING) ===");

const vault = new ChainVault();

function createDummyReceipt(id, decision) {
  const canonical = {
    "@context": "https://schema.saare.ai/v1/evidence.jsonld",
    "type": "GovernanceDecisionReceipt",
    "evidenceId": id,
    "scenario": "banca_dora_pci_dss",
    "timestamp": new Date().toISOString(),
    "decision": decision,
    "reason": "Regla L7 Aislamiento de Red"
  };
  const str = JSON.stringify(canonical);
  const hash = crypto.createHash("sha256").update(str).digest("hex");
  const sig = crypto.sign(null, Buffer.from(str, "utf-8"), privateKeyPem).toString("base64");
  return { ...canonical, contentHash: hash, signature: sig };
}

// 1. Insertar 3 evidencias en la cadena
console.log("\n[PASO 1] Generando bloque de 3 evidencias enlazadas...");
vault.addEvidence(createDummyReceipt("ev_101", "REJECTED"));
vault.addEvidence(createDummyReceipt("ev_102", "VALIDATED"));
vault.addEvidence(createDummyReceipt("ev_103", "REJECTED"));

// Test 1: Comprobar cadena legítima
const testLegit = vault.verifyChainIntegrity();
console.log("\n[TEST 1 - Cadena Legítima]:", testLegit);

if (!testLegit.ok) {
  console.error("FAIL: La cadena legítima dio error.");
  process.exit(1);
}

// Test 2: Inyección de alteración en el registro intermedio (ev_102)
console.log("\n[PASO 2] Forzando alteración en el nodo 1 (ev_102)...");
vault.chain[1].decision = "REJECTED"; // Alteramos contenido
vault.chain[1].contentHash = crypto.createHash("sha256").update(JSON.stringify(vault.chain[1])).digest("hex");

const testTampered = vault.verifyChainIntegrity();
console.log("\n[TEST 2 - Verificación tras Alteración]:", testTampered);

if (testTampered.ok) {
  console.error("FAIL CRÍTICO: La alteración en la cadena de Merkle no fue detectada.");
  process.exit(1);
} else {
  console.log("\n[SUCCESS]: La arquitectura Hash Chain detectó y aisló la rotura de la cadena.");
}

console.log("\n=== FASE V1.2 COMPLETADA CON ÉXITO ===");

