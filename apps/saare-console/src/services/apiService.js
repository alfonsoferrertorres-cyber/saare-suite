// saare-console/src/services/apiService.js
import { SAARE_CONFIG } from '../config/saareState';

const LOCAL_SIDECAR_URL = 'http://127.0.0.1:8080/api/v1/validate';
const ROUTE_MODE_KEY = 'SAARE_ROUTE_MODE'; // 'CLOUD_EDGE' | 'LOCAL_SIDECAR'

const readStorage = (keys = []) => {
  if (typeof window === 'undefined') return '';
  for (const key of keys) {
    try {
      const fromSession = window.sessionStorage?.getItem(key);
      if (fromSession) return fromSession;
      const fromLocal = window.localStorage?.getItem(key);
      if (fromLocal) return fromLocal;
    } catch {
      // Ignorar restricciones de almacenamiento
    }
  }
  return '';
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(key, value);
    window.sessionStorage?.setItem(key, value);
  } catch {
    // Ignorar restricciones de almacenamiento
  }
};

function getAuthContext() {
  const token = readStorage(['saare_auth_token', 'saare_token']);
  const tenant = readStorage(['saare_tenant_domain', 'saare_tenant']) || SAARE_CONFIG?.DEFAULT_TENANT || '';
  const user = readStorage(['saare_user_email']) || SAARE_CONFIG?.DEFAULT_USER || '';
  const role = readStorage(['saare_user_role']) || SAARE_CONFIG?.DEFAULT_ROLE || '';

  const rawBase = String(SAARE_CONFIG?.API_BASE_URL || 'https://api.saare.es').trim().replace(/\/+$/, '');
  const cleanRoot = rawBase.replace(/\/api\/v1$/i, '').replace(/\/api$/i, '').replace(/\/v1$/i, '');
  const baseUrl = `${cleanRoot}/v1`;

  return { token, tenant, user, role, baseUrl, cleanRoot };
}

export async function saareFetch(endpoint, options = {}) {
  const { token, tenant, user, role, baseUrl } = getAuthContext();

  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBaseUrl}${cleanEndpoint}`;

  const activeToken = options.overrideToken !== undefined ? options.overrideToken : token;
  const activeTenant = options.overrideTenant !== undefined ? options.overrideTenant : tenant;
  const activeUser = options.overrideUser !== undefined ? options.overrideUser : user;
  const activeRole = options.overrideRole !== undefined ? options.overrideRole : role;

  const headers = {
    'Content-Type': 'application/json',
    ...(activeTenant ? { 'x-saare-tenant': activeTenant } : {}),
    ...(activeUser ? { 'x-saare-user': activeUser } : {}),
    ...(activeRole ? { 'x-saare-role': activeRole } : {}),
    ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
    ...(options.headers || {})
  };

  const { overrideTenant, overrideUser, overrideRole, overrideToken, ...fetchOptions } = options;

  return await fetch(url, {
    ...fetchOptions,
    headers
  });
}

export const apiService = {
  getCurrentUser() {
    const { user, tenant, role } = getAuthContext();
    return {
      email: user,
      tenantId: tenant,
      tenantName: tenant,
      role
    };
  },

  getRouteMode() {
    const mode = readStorage([ROUTE_MODE_KEY]);
    return mode === 'LOCAL_SIDECAR' ? 'LOCAL_SIDECAR' : 'CLOUD_EDGE';
  },

  async setRouteMode(targetMode) {
    const { token, tenant } = getAuthContext();
    if (targetMode === 'LOCAL_SIDECAR') {
      const probe = await fetch(LOCAL_SIDECAR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tenant ? { 'x-saare-tenant': tenant, 'X-SAARE-Tenant': tenant } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt: 'PING_HEALTH_CHECK', scenario: 'HEALTH' })
      });
      if (!probe.ok) {
        throw new Error(`El agente local respondió con estado HTTP ${probe.status}.`);
      }
      writeStorage(ROUTE_MODE_KEY, 'LOCAL_SIDECAR');
      return { mode: 'LOCAL_SIDECAR', endpoint: LOCAL_SIDECAR_URL };
    }

    writeStorage(ROUTE_MODE_KEY, 'CLOUD_EDGE');
    return { mode: 'CLOUD_EDGE', endpoint: `${getAuthContext().baseUrl}/chat/completions` };
  },

  downloadNativeSidecar(overrideTenant) {
    const { tenant, cleanRoot } = getAuthContext();
    const targetTenant = overrideTenant !== undefined ? overrideTenant : tenant;
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const link = document.createElement('a');
    link.href = '/deploy/saare_native_sidecar.zip';
    link.download = `saare_native_sidecar_${targetTenant || 'tenant'}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const query = targetTenant ? `?tenant=${encodeURIComponent(targetTenant)}` : '';
    window.open(`${cleanRoot}/api/v1/agent/bootstrap${query}`, '_blank', 'noopener,noreferrer');
  },

  async getKpis(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';

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
          averageLatencyMs: Number(data.averageLatencyMs ?? 0),
          activeSellersCount: Number(data.activeSellersCount ?? 0),
          activeTenantsCount: Number(data.activeTenantsCount ?? 0)
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
      const limit = Number(params.limit) > 0 ? Number(params.limit) : 100;
      const activeTenant = params.tenant !== undefined ? params.tenant : tenant;
      const activeUser = params.user !== undefined ? params.user : user;

      const searchParams = new URLSearchParams({ limit: String(limit) });
      if (activeTenant) searchParams.set('tenant', activeTenant);
      if (activeUser) searchParams.set('user', activeUser);

      const res = await saareFetch(`/traces?${searchParams.toString()}`, {
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
        console.warn('[SAARE API] Rate limit alcanzado.');
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
          nodeId: data.node || data.service || '',
          tenantId: tenant,
          mode: data.mode || 'FAIL-CLOSED',
          latencyP99Ms: Number(data.latencyP99Ms ?? 0),
          activePolicies: Number(data.activePolicies ?? 0),
          status: data.status || 'HEALTHY',
          trustAnchor: data.trustAnchor || SAARE_CONFIG?.TRUST_ANCHOR || '',
          vaultSource: data.vaultSource || ''
        };
      }
    } catch (e) {
      console.warn('[SAARE API] Error consultando estado del nodo:', e);
    }

    return {
      nodeId: '',
      tenantId: tenant,
      mode: 'FAIL-CLOSED',
      latencyP99Ms: 0,
      activePolicies: 0,
      status: 'UNAVAILABLE',
      trustAnchor: SAARE_CONFIG?.TRUST_ANCHOR || '',
      vaultSource: ''
    };
  },

  async interceptPrompt(payloadOrPrompt, context = {}) {
    const { tenant, user, role, token } = getAuthContext();
    const routeMode = this.getRouteMode();

    let bodyData = {};
    if (typeof payloadOrPrompt === 'string') {
      bodyData = {
        prompt: payloadOrPrompt,
        tenant: context.tenant !== undefined ? context.tenant : tenant,
        user: context.user !== undefined ? context.user : user,
        role: context.role !== undefined ? context.role : role,
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

    const activeToken = bodyData.token !== undefined ? bodyData.token : token;
    const { token: _omitToken, ...cleanBody } = bodyData;

    if (routeMode === 'LOCAL_SIDECAR') {
      try {
        const localRes = await fetch(LOCAL_SIDECAR_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cleanBody.tenant ? { 'x-saare-tenant': cleanBody.tenant, 'X-SAARE-Tenant': cleanBody.tenant } : {}),
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
          },
          body: JSON.stringify({
            prompt: cleanBody.prompt || '',
            scenario: cleanBody.scenarioId || cleanBody.scenario || 'DEFAULT',
            tenant_id: cleanBody.tenant || ''
          })
        });

        const localData = await localRes.json().catch(() => ({}));
        const isDeny = localData?.verdict === 'DENY' || localRes.status === 403 || !localRes.ok;

        return {
          success: !isDeny,
          route: 'LOCAL_SIDECAR_RAM',
          tenant: localData?.tenant_id || cleanBody.tenant || '',
          evidence_id: localData?.evidence_hash ? `EV-${String(localData.evidence_hash).slice(0, 10).toUpperCase()}` : '',
          decision: isDeny ? 'DENY' : 'ALLOW',
          verdict: isDeny ? 'RECHAZADO' : (localData?.detox_status === 'SANITIZED' ? 'SANITIZED' : 'PERMITIDO'),
          enforcement: {
            verdict: isDeny ? 'DENY' : 'ALLOW',
            sanitizedInRam: true,
            piiDetected: Boolean(localData?.threat_detected),
            ms3vIntegrityHash: localData?.evidence_hash || '',
            latencyMs: localData?.latency_ms ?? 0,
            d1VaultSynced: Boolean(localData?.d1_vault_synced)
          },
          inference: {
            provider: 'LOCAL_SIDECAR',
            responseContent: isDeny ? '' : (localData?.clean_prompt || '')
          }
        };
      } catch (e) {
        return {
          decision: 'DENY',
          verdict: 'LOCAL_SIDECAR_UNREACHABLE',
          error: e.message
        };
      }
    }

    try {
      const res = await saareFetch('/chat/completions', {
        method: 'POST',
        overrideTenant: cleanBody.tenant,
        overrideUser: cleanBody.user,
        overrideRole: cleanBody.role,
        overrideToken: activeToken,
        body: JSON.stringify(cleanBody)
      });

      if (res && res.ok) {
        return await res.json();
      }

      const errData = await res?.json().catch(() => ({}));
      return {
        decision: 'DENY',
        verdict: 'FAIL_CLOSED_BLOCKED',
        error: errData.message || `HTTP ${res?.status}: Acceso bloqueado.`
      };
    } catch (e) {
      return { decision: 'DENY', verdict: 'FAIL_CLOSED', error: e.message };
    }
  },

  async syncVault() {
    try {
      const res = await saareFetch('/vault/sync', { method: 'GET' });
      if (res && res.ok) {
        return await res.json();
      }
      return { success: false, status: res?.status || 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

export const api = apiService;
export default apiService;