// control-plane/tenantManager.js — S.A.A.R.E. Enterprise SGP 1.0 (Dynamic Tenant Resilience)
export class TenantManager {
  constructor(env) {
    this.env = env;
    this.cache = new Map(); 
  }

  /**
   * Sanitiza y normaliza el identificador del tenant para evitar duplicidades por capitalización.
   */
  _normalizeId(tenantId) {
    if (!tenantId) return "ENTERPRISE";
    return String(tenantId).trim().toUpperCase();
  }

  /**
   * Normaliza y mapea los datos del plan para mantener compatibilidad con verifyLicense y Entitlements.
   */
  _buildTenantObject(cleanId, name, config = {}) {
    const planId = config.planId || config.plan_id || config.plan || "PROFESSIONAL_649";
    const isSandbox = cleanId === "SANDBOX" || planId === "SANDBOX";

    return {
      tenantId: cleanId,
      tenant_id: cleanId,
      name: name || (cleanId === "ENTERPRISE" ? "Organización Enterprise" : `Organización (${cleanId})`),
      plan_id: planId,
      planId: planId,
      tier: isSandbox ? "SANDBOX" : (config.tier || "ENTERPRISE"),
      priceEur: isSandbox ? 0 : (config.priceEur || 649),
      expiresAt: config.expiresAt || null,
      status: config.status || "ACTIVE",
      createdAt: config.createdAt || new Date().toISOString(),
      vaultUri: `kv://saare-vault/tenants/${cleanId}_vault.jsonld`,
      quota: config.quota || 10000,
      activeScenarios: config.activeScenarios || config.scenarios || ["banca_dora_pci_dss", "*"]
    };
  }

  /**
   * Registra o actualiza la configuración de un Tenant en KV y RAM.
   */
  async registerTenant(tenantId, name, config = {}) {
    const cleanId = this._normalizeId(tenantId);
    const tenantData = this._buildTenantObject(cleanId, name, config);

    this.cache.set(cleanId, tenantData);

    if (this.env?.SAARE_VAULT_KV) {
      try {
        await this.env.SAARE_VAULT_KV.put(`tenant:${cleanId}`, JSON.stringify(tenantData));
      } catch (e) {
        console.warn("[TenantManager] Error guardando tenant en KV:", e);
      }
    }

    return tenantData;
  }

  /**
   * Obtiene la metainformación del Tenant con fallback de resistencia (RAM -> KV -> Dynamic).
   */
  async getTenant(tenantId) {
    const cleanId = this._normalizeId(tenantId);

    // 1. Nivel 1: RAM efímera
    if (this.cache.has(cleanId)) {
      return this.cache.get(cleanId);
    }

    // 2. Nivel 2: Bóveda Cloudflare KV
    if (this.env?.SAARE_VAULT_KV) {
      try {
        const storedTenant = await this.env.SAARE_VAULT_KV.get(`tenant:${cleanId}`, "json");
        if (storedTenant) {
          const normalized = this._buildTenantObject(cleanId, storedTenant.name, storedTenant);
          this.cache.set(cleanId, normalized);
          return normalized;
        }
      } catch (e) {
        console.warn("[TenantManager] Fallo de lectura KV:", e);
      }
    }

    // 3. Nivel 3: Generación dinámica en caliente (Resiliencia Fail-Safe)
    const dynamicTenant = this._buildTenantObject(cleanId, null, {
      planId: "PROFESSIONAL_649",
      tier: "ENTERPRISE",
      priceEur: 649
    });

    this.cache.set(cleanId, dynamicTenant);
    return dynamicTenant;
  }

  /**
   * Valida el acceso ex-ante de un Tenant a un escenario normativo (verificando estado y expiración).
   */
  async validateAccess(tenantId, scenarioId) {
    try {
      const tenant = await this.getTenant(tenantId);
      
      // Verificación de estado del contrato
      if (tenant.status !== "ACTIVE") {
        return {
          allowed: false,
          reason: `El Tenant ${tenant.tenantId} no se encuentra activo (Estado actual: ${tenant.status}).`
        };
      }

      // Verificación de vencimiento temporal
      if (tenant.expiresAt) {
        const expirationDate = new Date(tenant.expiresAt);
        if (!isNaN(expirationDate.getTime()) && expirationDate < new Date()) {
          return {
            allowed: false,
            reason: `La suscripción del Tenant ${tenant.tenantId} expiró el ${expirationDate.toISOString()}.`
          };
        }
      }

      // Verificación de matriz de escenarios permitidos
      const scenarios = tenant.activeScenarios || [];
      const hasDirectAccess = scenarios.includes(scenarioId);
      const hasGlobalAccess = scenarios.includes("*") || tenant.tenantId === "ENTERPRISE";

      if (!hasDirectAccess && !hasGlobalAccess) {
        return { 
          allowed: false, 
          reason: `Escenario ${scenarioId} no habilitado por contrato para el Tenant ${tenant.tenantId}.` 
        };
      }

      return { allowed: true };
      
    } catch (error) {
      return { allowed: false, reason: error.message };
    }
  }
}

export default TenantManager;