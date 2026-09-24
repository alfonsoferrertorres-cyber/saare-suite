// control-plane/tenantManager.js — S.A.A.R.E. Enterprise SGP 1.0
export class TenantManager {
  constructor(env) {
    this.env = env;
    this.cache = new Map(); 
  }

  async registerTenant(tenantId, name, config = {}) {
    const tenantData = {
      tenantId,
      name,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      vaultUri: `kv://saare-vault/tenants/${tenantId}_vault.jsonld`,
      quota: config.quota || 10000,
      activeScenarios: config.scenarios || ["banca_dora_pci_dss"]
    };

    this.cache.set(tenantId, tenantData);

    if (this.env && this.env.SAARE_VAULT_KV) {
      await this.env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantData));
    }

    return tenantData;
  }

  async getTenant(tenantId) {
    if (this.cache.has(tenantId)) {
      return this.cache.get(tenantId);
    }

    if (this.env && this.env.SAARE_VAULT_KV) {
      const storedTenant = await this.env.SAARE_VAULT_KV.get(`tenant:${tenantId}`, "json");
      if (storedTenant) {
        this.cache.set(tenantId, storedTenant);
        return storedTenant;
      }
    }

    // Tenant por defecto si opera en modo público/evaluación
    if (tenantId === "ENTERPRISE" || tenantId === "DEMO_TENANT") {
      return {
        tenantId,
        name: "Organización Enterprise",
        status: "ACTIVE",
        activeScenarios: ["banca_dora_pci_dss"]
      };
    }

    throw new Error(`[SECURITY_ALERT] Isolation Violation: Tenant "${tenantId}" no existe o fue revocado.`);
  }

  async validateAccess(tenantId, scenarioId) {
    try {
      const tenant = await this.getTenant(tenantId);
      
      if (!tenant.activeScenarios || !tenant.activeScenarios.includes(scenarioId)) {
        return { 
          allowed: false, 
          reason: `Escenario ${scenarioId} no habilitado por contrato para el Tenant ${tenantId}` 
        };
      }
      return { allowed: true };
      
    } catch (error) {
      return { allowed: false, reason: error.message };
    }
  }
}