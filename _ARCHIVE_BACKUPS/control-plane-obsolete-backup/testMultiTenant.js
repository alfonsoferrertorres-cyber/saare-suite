import { TenantManager } from "./tenantManager.js";
console.log("=== SUITE V3.0 - MULTI-TENANT ISOLATION ENGINE TEST ===");
const manager = new TenantManager();
// 1. Registrar dos entidades financieras independientes
manager.registerTenant("bank_alpha_es", "Banco Alpha España", { scenarios: ["banca_dora_pci_dss"] });
manager.registerTenant("corp_beta_global", "Corporación Beta Global", { scenarios: ["cumplimiento_corporativo_es"] });
// 2. Validar acceso autorizado
const checkAlpha = manager.validateAccess("bank_alpha_es", "banca_dora_pci_dss");
console.log(`\n[TEST 1] Bank Alpha -> Escenario DORA/PCI: Allowed=${checkAlpha.allowed}`);
// 3. Validar bloqueo por intento de Cross-Tenant Spillover
const checkCrossTenant = manager.validateAccess("corp_beta_global", "banca_dora_pci_dss");
console.log(`[TEST 2] Corp Beta -> Intento de uso de Escenario de Bank Alpha: Allowed=${checkCrossTenant.allowed} (${checkCrossTenant.reason})`);
if (checkAlpha.allowed && !checkCrossTenant.allowed) {
  console.log("\n=== MULTI-TENANT ISOLATION VERIFIED (PASS) ===");
} else {
  console.error("\n=== FAIL EN MULTI-TENANT ISOLATION ===");
  process.exit(1);
}

