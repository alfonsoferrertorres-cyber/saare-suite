/**
 * SAARE Multi-Tenant Isolation & Quota Controller v10.0 (SGP 1.0)
 * Persistent KV Management & Execution Authorization Tenant Isolation
 */

export class TenantManager {
  constructor(kvBinding = null) {
    this.kv = kvBinding;
    this.memoryCache = new Map();
  }

  /**
   * Registra o aprovisiona un nuevo inquilino en la Bóveda KV
   */
  async registerTenant(tenantId, name, config = {}) {
    const tenantData = {
      tenantId,
      name,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      quota: config.quota || 1000000,
      usedQuota: 0,
      protocol: "SGP_1.0",
      licenseType: config.licenseType || "ENTERPRISE_EXECUTION_RUNTIME",
      activeScenarios: config.scenarios || [
        "cumplimiento_corporativo_integral",
        "razonamiento_activo_l7",
        "deepfake_fake_disprover",
        "auditoria_dictamen_normativo",
        "subvenciones_requisitos_infranqueables"
      ]
    };

    this.memoryCache.set(tenantId, tenantData);

    if (this.kv) {
      await this.kv.put(`tenant:${tenantId}`, JSON.stringify(tenantData));
    }

    return tenantData;
  }

  /**
   * Obtiene los metadatos del inquilino con fallback en memoria
   */
  async getTenant(tenantId) {
    if (this.memoryCache.has(tenantId)) {
      return this.memoryCache.get(tenantId);
    }

    if (this.kv) {
      const raw = await this.kv.get(`tenant:${tenantId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.memoryCache.set(tenantId, parsed);
        return parsed;
      }
    }

    // Default Fallback
    const defaultTenant = {
      tenantId: tenantId || "tenant_default",
      name: "Corporate Enterprise Tenant",
      status: "ACTIVE",
      quota: 1000000,
      usedQuota: 0,
      licenseType: "ENTERPRISE_EXECUTION_RUNTIME",
      activeScenarios: [
        "cumplimiento_corporativo_integral",
        "razonamiento_activo_l7",
        "deepfake_fake_disprover",
        "auditoria_dictamen_normativo",
        "subvenciones_requisitos_infranqueables"
      ]
    };

    this.memoryCache.set(tenantId, defaultTenant);
    return defaultTenant;
  }

  /**
   * Valida permisos de ejecución del SAARE Judge para el tenant
   */
  async validateAccess(tenantId, scenarioId) {
    const tenant = await this.getTenant(tenantId);

    if (tenant.status !== "ACTIVE") {
      return {
        allowed: false,
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        reason: `Acceso denegado: El inquilino [${tenantId}] se encuentra suspendido.`
      };
    }

    const cleanScenario = (scenarioId || "cumplimiento_corporativo_integral").toLowerCase().replace(/[-_\s]/g, '');
    const isScenarioActive = tenant.activeScenarios.some(
      s => s.toLowerCase().replace(/[-_\s]/g, '') === cleanScenario
    );

    if (!isScenarioActive) {
      return {
        allowed: false,
        decision: "DENY",
        enforcement: { action: "BLOCK" },
        reason: `Directiva de autorización [${scenarioId}] no habilitada en el plan del inquilino [${tenantId}].`
      };
    }

    return {
      allowed: true,
      decision: "ALLOW",
      enforcement: { action: "PASS" },
      tenantName: tenant.name
    };
  }
}