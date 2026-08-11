import fs from "fs";
import { DossierGenerator } from "./dossierGenerator.js";

console.log("=== SUITE V2.1 — AUDIT CERTIFICATION DOSSIER GENERATOR ===");

const dossier = DossierGenerator.generateDossier({
  executionId: "exec_dora_compliance_prod_01",
  scenarioId: "banca_dora_pci_dss",
  verdict: "REJECTED",
  reason: "Bloqueo Determinista: Inyección de Prompt #412",
  merkleRoot: "595728a940c1ef336a596d280aafee2aab9a835f92e2bc11cdeebf6df678bf4b",
  traceId: "4bf92f3577b34da6a3ce929d0e0e4736"
});

const mdReport = DossierGenerator.exportToMarkdown(dossier);

fs.writeFileSync("sample_dossier.jsonld", JSON.stringify(dossier, null, 2));
fs.writeFileSync("sample_dossier.md", mdReport);

console.log("\n[TEST 1] Dossier JSON-LD generado con éxito.");
console.log("[TEST 2] Reporte Markdown exportado a disco.");
console.log("\n--- VISTA PREVIA DEL DOSSIER EN MARKDOWN ---\n");
console.log(mdReport);

fs.unlinkSync("sample_dossier.jsonld");
fs.unlinkSync("sample_dossier.md");

console.log("=== FASE V2.1 COMPLETADA CON ÉXITO ===");

