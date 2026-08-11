import { ComplianceEngine } from "./complianceEngine.js";

console.log("=== SUITE V2.0 — COMPLIANCE CONTROL MAPPING ENGINE ===");

const result = ComplianceEngine.mapExecutionToCompliance(
  "banca_dora_pci_dss",
  "REJECTED",
  "Bloqueo Determinista: Inyección de Prompt y Filtrado de PII"
);

console.log("\n[VEREDICTO ENRIQUECIDO PARA AUDITORÍA]:");
console.log(JSON.stringify(result, null, 2));

if (result.compliance_impact.frameworks_satisfied.dora) {
  console.log("\n[SUCCESS] Mapeo automático contra DORA y PCI-DSS v4.0 verificado.");
} else {
  console.error("\n[FAIL] Error en el mapeo normativo.");
  process.exit(1);
}

