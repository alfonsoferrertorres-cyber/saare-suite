import crypto from "crypto";
export class TenantManager {
  constructor() {
    this.tenants = new Map();
  }
  registerTenant(tenantId, name, config = {}) {
    const tenantData = {
      tenantId,
      name,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      vaultPath: `./evidence/tenants/${tenantId}_vault.jsonld`,
      quota: config.quota || 10000,
      activeScenarios: config.scenarios || ["banca_dora_pci_dss"]
    };
    this.tenants.set(tenantId, tenantData);
    return tenantData;
  }
  getTenant(tenantId) {
    if (!this.tenants.has(tenantId)) {
      throw new Error(`[SECURITY_ALERT] Isolation Violation: Tenant "${tenantId}" no existe`);
    }
    return this.tenants.get(tenantId);
  }
  validateAccess(tenantId, scenarioId) {
    const tenant = this.getTenant(tenantId);
    if (!tenant.activeScenarios.includes(scenarioId)) {
      return { allowed: false, reason: `Escenario ${scenarioId} no habilitado para Tenant ${tenantId}` };
    }
    return { allowed: true };
  }
}

