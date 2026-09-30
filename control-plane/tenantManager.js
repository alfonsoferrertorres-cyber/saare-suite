// control-plane/tenantManager.js — S.A.A.R.E. Enterprise SGP 1.0 (Dynamic Tenant Resilience)
export class TenantManager {
  constructor(env) {
    this.env = env;
    this.cache = new Map(); 
  }

  async registerTenant(tenantId, name, config = {}) {
    const cleanId = tenantId ? tenantId.trim() : "ENTERPRISE";
    const tenantData = {
      tenantId: cleanId,
      name: name || cleanId,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      vaultUri: `kv://saare-vault/tenants/${cleanId}_vault.jsonld`,
      quota: config.quota || 10000,
      activeScenarios: config.scenarios || ["banca_dora_pci_dss"]
    };

    this.cache.set(cleanId, tenantData);

    if (this.env && this.env.SAARE_VAULT_KV) {
      try {
        await this.env.SAARE_VAULT_KV.put(`tenant:${cleanId}`, JSON.stringify(tenantData));
      } catch (e) {
        console.warn("[TenantManager] Error guardando tenant en KV:", e);
      }
    }

    return tenantData;
  }

  async getTenant(tenantId) {
    const cleanId = (tenantId || "ENTERPRISE").trim();

    if (this.cache.has(cleanId)) {
      return this.cache.get(cleanId);
    }

    if (this.env && this.env.SAARE_VAULT_KV) {
      try {
        const storedTenant = await this.env.SAARE_VAULT_KV.get(`tenant:${cleanId}`, "json");
        if (storedTenant) {
          this.cache.set(cleanId, storedTenant);
          return storedTenant;
        }
      } catch (e) {}
    }

    // Dynamic Fallback para organizaciones registradas sobre la marcha
    const dynamicTenant = {
      tenantId: cleanId,
      name: cleanId === "ENTERPRISE" ? "Organización Enterprise" : `Organización (${cleanId})`,
      status: "ACTIVE",
      activeScenarios: ["banca_dora_pci_dss"]
    };

    this.cache.set(cleanId, dynamicTenant);
    return dynamicTenant;
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