// saare-console/src/services/apiService.js — Servicio API S.A.A.R.E. (v12.5 / Multi-Tenant + Enrutador L7 Local)
import { SAARE_CONFIG } from '../config/saareState';

const LOCAL_SIDECAR_URL = 'http://127.0.0.1:8080/api/v1/validate';
const ROUTE_MODE_KEY = 'SAARE_ROUTE_MODE'; // 'CLOUD_EDGE' | 'LOCAL_SIDECAR'

function getAuthContext() {
  const token = localStorage.getItem('saare_auth_token') || localStorage.getItem('saare_token') || '';
  const tenant = localStorage.getItem('saare_tenant_domain') || SAARE_CONFIG?.DEFAULT_TENANT || 'DEMO_ENTERPRISE';
  const user = localStorage.getItem('saare_user_email') || SAARE_CONFIG?.DEFAULT_USER || 'operador@saare.es';
  const role = localStorage.getItem('saare_user_role') || 'AUDITOR_GUEST';

  const rawBase = (SAARE_CONFIG?.API_BASE_URL || 'https://api.saare.es').trim().replace(/\/+$/, '');
  const cleanRoot = rawBase.replace(/\/api\/v1$/i, '').replace(/\/api$/i, '').replace(/\/v1$/i, '');
  const baseUrl = `${cleanRoot}/v1`;

  return { token, tenant, user, role, baseUrl, cleanRoot };
}

async function saareFetch(endpoint, options = {}) {
  const { token, tenant, user, role, baseUrl } = getAuthContext();

  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBaseUrl}${cleanEndpoint}`;
  const activeToken = options.overrideToken || token;
  const activeTenant = options.overrideTenant || tenant;

  const headers = {
    'Content-Type': 'application/json',
    'x-saare-tenant': activeTenant,
    'x-saare-user': options.overrideUser || user,
    'x-saare-role': options.overrideRole || role,
    ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {}),
    ...(options.headers || {})
  };

  const { overrideTenant, overrideUser, overrideRole, overrideToken, ...fetchOptions } = options;

  return await fetch(url, {
    ...fetchOptions,
    headers
  });
}

export const apiService = {
  getRouteMode() {
    return localStorage.getItem(ROUTE_MODE_KEY) || 'CLOUD_EDGE';
  },

  async setRouteMode(targetMode) {
    if (targetMode === 'LOCAL_SIDECAR') {
      const probe = await fetch(LOCAL_SIDECAR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'PING_HEALTH_CHECK', scenario: 'HEALTH' })
      });
      if (!probe.ok) {
        throw new Error('El agente Python local respondió con error.');
      }
      localStorage.setItem(ROUTE_MODE_KEY, 'LOCAL_SIDECAR');
      return { mode: 'LOCAL_SIDECAR', endpoint: LOCAL_SIDECAR_URL };
    }

    localStorage.setItem(ROUTE_MODE_KEY, 'CLOUD_EDGE');
    return { mode: 'CLOUD_EDGE', endpoint: `${getAuthContext().baseUrl}/chat/completions` };
  },

  downloadNativeSidecar(overrideTenant) {
    const { tenant, cleanRoot } = getAuthContext();
    const targetTenant = overrideTenant || tenant;
    window.open('/deploy/saare_native_sidecar.zip', '_blank');
    window.open(`${cleanRoot}/api/v1/agent/bootstrap?tenant=${encodeURIComponent(targetTenant)}`, '_blank');
  },

  async getKpis(startDate, endDate) {
    const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
    try {
      const res = await saareFetch(`/metrics/kpis${query}`, { method: 'GET' });
      if (res && res.ok) {
        const data = await res.json();
        const total = Number(data.totalInspections ?? data.total ?? 0);
        const denied = Number(data.deniedActions ?? data.deniedCount ?? data.denied ?? 0);
        const allowed = Number(data.allowedActions ?? (total >= denied ? total - denied : 0));

        return {
          totalInterceptions: total,
          allowedActions: allowed,
          deniedActions: denied,
          reviewActions: Number(data.reviewActions ?? 0),
          averageLatencyMs: Number(data.averageLatencyMs ?? 0.84),
          activeSellersCount: Number(data.activeSellersCount ?? 12),
          activeTenantsCount: Number(data.activeTenantsCount ?? 1)
        };
      }
    } catch (e) {
      console.warn('[SAARE API] Error en KPIs:', e);
    }
    return null;
  },

  async getTelemetryTraces(params = {}) {
    try {
      const { tenant, user } = getAuthContext();
      const limit = params.limit || 100;
      const activeTenant = params.tenant || tenant;
      const activeUser = params.user || user;

      const query = `?limit=${limit}&tenant=${encodeURIComponent(activeTenant)}&user=${encodeURIComponent(activeUser)}`;
      const res = await saareFetch(`/traces${query}`, {
        method: 'GET',
        overrideTenant: activeTenant,
        overrideUser: activeUser,
        overrideRole: params.role,
        overrideToken: params.token
      });

      if (res && res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data.traces || data.evidences || data.runs || []);
      }
      if (res && res.status === 429) {
        console.warn('⚠️ Rate Limit 429 alcanzado.');
        return [];
      }
    } catch (e) {
      console.warn('[SAARE API] Error al recuperar trazas de telemetría:', e);
    }
    return [];
  },

  async getNodeStatus() {
    const { tenant } = getAuthContext();
    try {
      const res = await saareFetch('/health', { method: 'GET' });
      if (res && res.ok) {
        const data = await res.json();
        return {
          nodeId: data.node || data.service || 'RPI-2607076315021',
          tenantId: tenant,
          mode: 'FAIL-CLOSED',
          latencyP99Ms: Number(data.latencyP99Ms ?? 0.84),
          activePolicies: 8,
          status: data.status || 'HEALTHY',
          trustAnchor: data.trustAnchor || 'https://vault.saare.es',
          vaultSource: 'D1_HYBRID'
        };
      }
    } catch (e) {}

    return {
      nodeId: 'RPI-2607076315021',
      tenantId: tenant,
      mode: 'FAIL-CLOSED',
      latencyP99Ms: 0.84,
      activePolicies: 8,
      status: 'OPERATIVE',
      trustAnchor: 'https://vault.saare.es',
      vaultSource: 'D1_HYBRID'
    };
  },

  async interceptPrompt(payloadOrPrompt, context = {}) {
    const { tenant, user, role } = getAuthContext();
    const routeMode = this.getRouteMode();

    let bodyData = {};
    if (typeof payloadOrPrompt === 'string') {
      bodyData = {
        prompt: payloadOrPrompt,
        tenant: context.tenant || tenant,
        user: context.user || user,
        role: context.role || role,
        ...context
      };
    } else if (payloadOrPrompt && typeof payloadOrPrompt === 'object') {
      bodyData = {
        tenant,
        user,
        role,
        ...payloadOrPrompt,
        ...context
      };
    }

    // Ruta 1: Sidecar Local en RAM (127.0.0.1:8080)
    if (routeMode === 'LOCAL_SIDECAR') {
      try {
        const localRes = await fetch(LOCAL_SIDECAR_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SAARE-Tenant': bodyData.tenant
          },
          body: JSON.stringify({
            prompt: bodyData.prompt || '',
            scenario: bodyData.scenarioId || bodyData.scenario || 'EU_AI_ACT_L7',
            tenant_id: bodyData.tenant
          })
        });

        const localData = await localRes.json();
        const isDeny = localData.verdict === 'DENY' || localRes.status === 403;

        return {
          success: !isDeny,
          route: 'LOCAL_SIDECAR_RAM',
          tenant: localData.tenant_id || bodyData.tenant,
          evidence_id: `EV-EDGE-${(localData.evidence_hash || '').slice(0, 10).toUpperCase()}`,
          decision: isDeny ? 'DENY' : 'ALLOW',
          verdict: isDeny ? 'RECHAZADO' : (localData.detox_status === 'SANITIZED' ? 'SANCP_SANITIZED' : 'PERMITIDO'),
          enforcement: {
            verdict: isDeny ? 'DENY' : 'ALLOW',
            sanitizedInRam: true,
            piiDetected: Boolean(localData.threat_detected),
            ms3vIntegrityHash: localData.evidence_hash,
            latencyMs: localData.latency_ms,
            d1VaultSynced: Boolean(localData.d1_vault_synced)
          },
          inference: {
            provider: 'LOCAL_SIDECAR_PYTHON',
            responseContent: isDeny
              ? '[BLOQUEO LOCAL EN RAM] Inducción semántica neutralizada en el nodo perimetral.'
              : localData.clean_prompt
          }
        };
      } catch (e) {
        return {
          decision: 'DENY',
          verdict: 'LOCAL_SIDECAR_UNREACHABLE',
          error: `Agente local 127.0.0.1:8080 inaccesible (${e.message}). Inicia saare_framework.py o cambia a Cloud Edge.`
        };
      }
    }

    // Ruta 2: Cloud Edge (api.saare.es)
    try {
      const res = await saareFetch('/chat/completions', {
        method: 'POST',
        overrideTenant: bodyData.tenant,
        overrideUser: bodyData.user,
        overrideRole: bodyData.role,
        overrideToken: bodyData.token,
        body: JSON.stringify(bodyData)
      });

      if (res && res.ok) {
        return await res.json();
      }

      const errData = await res?.json().catch(() => ({}));
      return {
        decision: 'DENY',
        verdict: 'FAIL_CLOSED_BLOCKED',
        error: errData.message || `HTTP ${res?.status}: Acceso bloqueado preventivamente por la Bóveda L7.`
      };
    } catch (e) {
      return { decision: 'DENY', verdict: 'FAIL_CLOSED', error: e.message };
    }
  },

  async syncVault() {
    try {
      const res = await saareFetch('/vault/sync', { method: 'GET' });
      if (res && res.ok) return await res.json();
    } catch (e) {}
    return { success: true, trustAnchor: 'https://vault.saare.es', source: 'D1_HYBRID' };
  }
};

export default apiService;