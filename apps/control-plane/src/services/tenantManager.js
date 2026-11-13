// control-plane/tenantManager.js — S.A.A.R.E. Enterprise SGP 1.0 (D1 + KV + Fail-Closed Billing)
export class TenantManager {
  constructor(env) {
    this.env = env;
    this.cache = new Map();
  }

  _normalizeId(tenantId) {
    if (!tenantId) return "SANDBOX_PUBLIC";
    return String(tenantId).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "_");
  }

  _buildTenantObject(cleanId, name, config = {}) {
    const planId = config.planId || config.plan_id || config.plan || "SANDBOX_FREE";
    const isSandbox = cleanId === "SANDBOX" || cleanId.startsWith("SANDBOX_") || cleanId.startsWith("DEMO_");

    return {
      tenantId: cleanId,
      tenant_id: cleanId,
      name: name || (isSandbox ? `Entorno Sandbox (${cleanId})` : `Organización (${cleanId})`),
      plan_id: planId,
      planId: planId,
      tier: isSandbox ? "SANDBOX" : (config.tier || "ENTERPRISE"),
      priceEur: isSandbox ? 0 : (config.priceEur ?? 649),
      expiresAt: config.expiresAt || config.expires_at || null,
      status: config.status || "ACTIVE",
      createdAt: config.createdAt || config.created_at || new Date().toISOString(),
      vaultUri: `kv://saare-vault/tenants/${cleanId}_vault.jsonld`,
      quota: isSandbox ? 100 : (config.quota || 10000),
      activeScenarios: config.activeScenarios || config.scenarios || ["*"]
    };
  }

  async registerTenant(tenantId, name, config = {}) {
    const cleanId = this._normalizeId(tenantId);
    const tenantData = this._buildTenantObject(cleanId, name, config);

    this.cache.set(cleanId, tenantData);

    // 1. Persistencia primaria en D1
    if (this.env?.DB) {
      try {
        await this.env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS tenants (
            tenant_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            plan_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            quota INTEGER NOT NULL DEFAULT 10000,
            expires_at TEXT,
            config_json TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )
        `).run();

        await this.env.DB.prepare(`
          INSERT OR REPLACE INTO tenants (tenant_id, name, plan_id, status, quota, expires_at, config_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          cleanId,
          tenantData.name,
          tenantData.planId,
          tenantData.status,
          tenantData.quota,
          tenantData.expiresAt,
          JSON.stringify(tenantData),
          tenantData.createdAt
        ).run();
      } catch (e) {
        console.warn("[TenantManager] Error persistiendo tenant en D1:", e.message);
      }
    }

    // 2. Caché distribuida en KV
    if (this.env?.SAARE_VAULT_KV) {
      try {
        await this.env.SAARE_VAULT_KV.put(`tenant:${cleanId}`, JSON.stringify(tenantData));
      } catch (e) {
        console.warn("[TenantManager] Error guardando tenant en KV:", e.message);
      }
    }

    return tenantData;
  }

  async getTenant(tenantId) {
    const cleanId = this._normalizeId(tenantId);

    // 1. Nivel 1: RAM efímera
    if (this.cache.has(cleanId)) {
      return this.cache.get(cleanId);
    }

    // 2. Nivel 2: Base de datos SQL D1 (Fuente de verdad de facturación)
    if (this.env?.DB) {
      try {
        const row = await this.env.DB.prepare(
          `SELECT * FROM tenants WHERE tenant_id = ? LIMIT 1`
        ).bind(cleanId).first();

        if (row) {
          const parsedConfig = row.config_json ? JSON.parse(row.config_json) : {};
          const normalized = this._buildTenantObject(cleanId, row.name, {
            ...parsedConfig,
            planId: row.plan_id,
            status: row.status,
            quota: row.quota,
            expiresAt: row.expires_at,
            createdAt: row.created_at
          });
          this.cache.set(cleanId, normalized);
          return normalized;
        }
      } catch (e) {
        console.warn("[TenantManager] Fallo de lectura D1:", e.message);
      }
    }

    // 3. Nivel 3: Bóveda Cloudflare KV
    if (this.env?.SAARE_VAULT_KV) {
      try {
        const storedTenant = await this.env.SAARE_VAULT_KV.get(`tenant:${cleanId}`, "json");
        if (storedTenant) {
          const normalized = this._buildTenantObject(cleanId, storedTenant.name, storedTenant);
          this.cache.set(cleanId, normalized);
          return normalized;
        }
      } catch (e) {
        console.warn("[TenantManager] Fallo de lectura KV:", e.message);
      }
    }

    // 4. Nivel 4: Solo permitir auto-creación en modo SANDBOX / DEMO
    const isSandbox = cleanId === "SANDBOX" || cleanId.startsWith("SANDBOX_") || cleanId.startsWith("DEMO_");
    if (isSandbox) {
      const sandboxTenant = this._buildTenantObject(cleanId, null, {
        planId: "SANDBOX_FREE",
        tier: "SANDBOX",
        priceEur: 0,
        quota: 100
      });
      this.cache.set(cleanId, sandboxTenant);
      return sandboxTenant;
    }

    // Bloqueo Fail-Closed para tenants no registrados en la pasarela
    return {
      tenantId: cleanId,
      tenant_id: cleanId,
      status: "UNPROVISIONED",
      planId: "NONE",
      activeScenarios: []
    };
  }

  async validateAccess(tenantId, scenarioId) {
    try {
      const tenant = await this.getTenant(tenantId);

      if (tenant.status === "UNPROVISIONED") {
        return {
          allowed: false,
          reason: `El Tenant ${tenant.tenantId} no está aprovisionado. Complete la suscripción en saare.es.`
        };
      }

      if (tenant.status !== "ACTIVE") {
        return {
          allowed: false,
          reason: `El Tenant ${tenant.tenantId} no se encuentra activo (Estado actual: ${tenant.status}).`
        };
      }

      if (tenant.expiresAt) {
        const expirationDate = new Date(tenant.expiresAt);
        if (!isNaN(expirationDate.getTime()) && expirationDate < new Date()) {
          return {
            allowed: false,
            reason: `La suscripción del Tenant ${tenant.tenantId} expiró el ${expirationDate.toISOString()}.`
          };
        }
      }

      const scenarios = tenant.activeScenarios || [];
      const hasDirectAccess = !scenarioId || scenarios.includes(scenarioId);
      const hasGlobalAccess = scenarios.includes("*");

      if (!hasDirectAccess && !hasGlobalAccess) {
        return {
          allowed: false,
          reason: `Escenario ${scenarioId} no habilitado por contrato para el Tenant ${tenant.tenantId}.`
        };
      }

      return { allowed: true, tenant };
    } catch (error) {
      return { allowed: false, reason: error.message };
    }
  }
}

export default TenantManager;