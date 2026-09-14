// Eliminado: import crypto from "crypto"

export class TenantManager {
  constructor(env) {
    // Inyectamos las variables de entorno para acceder a Cloudflare KV / D1
    this.env = env;
    // Mantenemos el Map como una caché L1 rápida en memoria (efímera)
    this.cache = new Map(); 
  }

  async registerTenant(tenantId, name, config = {}) {
    const tenantData = {
      tenantId,
      name,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      // Adaptado para usar almacenamiento en la nube (ej. Cloudflare R2 o KV)
      vaultUri: `kv://saare-vault/tenants/${tenantId}_vault.jsonld`,
      quota: config.quota || 10000,
      activeScenarios: config.scenarios || ["banca_dora_pci_dss"]
    };

    // Guardar en caché L1
    this.cache.set(tenantId, tenantData);

    // Persistencia real en Cloudflare KV (Sincronizado con StripeWebhook)
    if (this.env && this.env.SAARE_VAULT_KV) {
      await this.env.SAARE_VAULT_KV.put(`tenant:${tenantId}`, JSON.stringify(tenantData));
    }

    return tenantData;
  }

  async getTenant(tenantId) {
    // 1. Intentar recuperación rápida desde caché en memoria
    if (this.cache.has(tenantId)) {
      return this.cache.get(tenantId);
    }

    // 2. Si no está en memoria, consultar la base de datos persistente (KV)
    if (this.env && this.env.SAARE_VAULT_KV) {
      const storedTenant = await this.env.SAARE_VAULT_KV.get(`tenant:${tenantId}`, "json");
      if (storedTenant) {
        this.cache.set(tenantId, storedTenant); // Repoblar caché
        return storedTenant;
      }
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