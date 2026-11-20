// control-plane/src/services/tenantManager.js — S.A.A.R.E. Enterprise SGP 1.0 (D1 + KV + Fail-Closed Billing)
import { PLAN_IDS, sanitizePlanId, getPlanEntitlements } from "../packages/entitlements.js";

export class TenantManager {
  constructor(env) {
    this.env = env;
    this.cache = new Map();
  }

  _getKv() {
    return this.env?.SAARE_KV_VAULT || this.env?.SAARE_VAULT_KV || null;
  }

  _normalizeId(tenantId) {
    if (!tenantId) return "SANDBOX_PUBLIC";
    return (
      String(tenantId)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "_")
        .slice(0, 32) || "SANDBOX_PUBLIC"
    );
  }

  _isSandboxTenant(cleanId, planId) {
    return (
      planId === PLAN_IDS.SANDBOX_FREE ||
      cleanId === "SANDBOX" ||
      cleanId.startsWith("SANDBOX_") ||
      cleanId.startsWith("SBX_") ||
      cleanId.startsWith("DEMO_")
    );
  }

  _buildTenantObject(cleanId, name, config = {}) {
    const safeCfg = config && typeof config === "object" ? config : {};
    const planId = sanitizePlanId(
      safeCfg.planId || safeCfg.plan_id || safeCfg.plan || PLAN_IDS.SANDBOX_FREE
    );
    const entitlements = getPlanEntitlements(planId);
    const isSandbox = this._isSandboxTenant(cleanId, planId);

    return {
      tenantId: cleanId,
      tenant_id: cleanId,
      name:
        name ||
        (isSandbox
          ? `Entorno Sandbox (${cleanId})`
          : `Organización (${cleanId})`),
      plan_id: planId,
      planId,
      tier: isSandbox ? "SANDBOX" : safeCfg.tier || "ENTERPRISE",
      priceEur: isSandbox ? 0 : safeCfg.priceEur ?? 649,
      expiresAt: isSandbox ? null : safeCfg.expiresAt || safeCfg.expires_at || null,
      status: safeCfg.status || "ACTIVE",
      createdAt: safeCfg.createdAt || safeCfg.created_at || new Date().toISOString(),
      vaultUri: `kv://saare-vault/tenants/${cleanId}_vault.jsonld`,
      quota: safeCfg.quota ?? entitlements.monthlyVerdicts,
      maxSeats: safeCfg.maxSeats ?? entitlements.maxSeats,
      activeScenarios: Array.isArray(safeCfg.activeScenarios)
        ? safeCfg.activeScenarios
        : Array.isArray(safeCfg.scenarios)
        ? safeCfg.scenarios
        : ["*"]
    };
  }

  async registerTenant(tenantId, name, config = {}) {
    const cleanId = this._normalizeId(tenantId);
    const tenantData = this._buildTenantObject(cleanId, name, config);

    this.cache.set(cleanId, tenantData);

    if (this.env?.DB) {
      try {
        await this.env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS tenants (
            tenant_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            plan_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            quota INTEGER NOT NULL DEFAULT 1000,
            expires_at TEXT,
            config_json TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )
        `).run();

        await this.env.DB.prepare(`
          INSERT OR REPLACE INTO tenants (tenant_id, name, plan_id, status, quota, expires_at, config_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
          .bind(
            cleanId,
            tenantData.name,
            tenantData.planId,
            tenantData.status,
            tenantData.quota,
            tenantData.expiresAt,
            JSON.stringify(tenantData),
            tenantData.createdAt
          )
          .run();
      } catch (e) {
        console.warn("[TenantManager] Error persistiendo tenant en D1:", e.message);
      }
    }

    const kv = this._getKv();
    if (kv) {
      try {
        await kv.put(`tenant:${cleanId}`, JSON.stringify(tenantData));
      } catch (e) {
        console.warn("[TenantManager] Error guardando tenant en KV:", e.message);
      }
    }

    return tenantData;
  }

  async getTenant(tenantId) {
    const cleanId = this._normalizeId(tenantId);

    if (this.cache.has(cleanId)) {
      return this.cache.get(cleanId);
    }

    if (this.env?.DB) {
      try {
        const row = await this.env.DB.prepare(
          "SELECT * FROM tenants WHERE tenant_id = ? LIMIT 1"
        )
          .bind(cleanId)
          .first();

        if (row) {
          let parsedConfig = {};
          if (row.config_json) {
            try {
              parsedConfig = JSON.parse(row.config_json);
            } catch {
              parsedConfig = {};
            }
          }
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

    const kv = this._getKv();
    if (kv) {
      try {
        const storedTenant = await kv.get(`tenant:${cleanId}`, "json");
        if (storedTenant) {
          const normalized = this._buildTenantObject(
            cleanId,
            storedTenant.name,
            storedTenant
          );
          this.cache.set(cleanId, normalized);
          return normalized;
        }
      } catch (e) {
        console.warn("[TenantManager] Fallo de lectura KV:", e.message);
      }
    }

    if (this._isSandboxTenant(cleanId, PLAN_IDS.SANDBOX_FREE)) {
      const sandboxEnt = getPlanEntitlements(PLAN_IDS.SANDBOX_FREE);
      const sandboxTenant = this._buildTenantObject(cleanId, null, {
        planId: PLAN_IDS.SANDBOX_FREE,
        tier: "SANDBOX",
        priceEur: 0,
        expiresAt: null,
        quota: sandboxEnt.monthlyVerdicts,
        maxSeats: sandboxEnt.maxSeats
      });
      this.cache.set(cleanId, sandboxTenant);
      return sandboxTenant;
    }

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

      const isSandbox = this._isSandboxTenant(tenant.tenantId, tenant.planId);
      if (!isSandbox && tenant.expiresAt) {
        const expirationDate = new Date(tenant.expiresAt);
        if (!Number.isNaN(expirationDate.getTime()) && expirationDate < new Date()) {
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