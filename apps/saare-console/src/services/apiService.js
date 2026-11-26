// saare-console/src/services/apiService.js
import { SAARE_CONFIG } from '../config/saareState';
import {
  EXECUTION_STATUS,
  normalizeNodeStatus,
  normalizeTraceRecord,
  normalizeVerdictResponse,
  normalizeBatchSealResponse,
  normalizeSignatureVerifyResponse
} from '../domain/contracts';

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

function resolveControlPlaneRoot() {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : '';
  const rawBase = String(
    envUrl ||
      SAARE_CONFIG?.API_BASE_URL ||
      (typeof window !== 'undefined' ? window.location?.origin : '') ||
      'https://api.saare.es'
  )
    .trim()
    .replace(/\/+$/, '');

  return rawBase
    .replace(/\/api\/v1$/i, '')
    .replace(/\/api$/i, '')
    .replace(/\/v1$/i, '');
}

function normalizeControlPlaneEndpoint(endpoint = '') {
  const trimmed = String(endpoint || '').trim();
  const cleanEndpoint = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (cleanEndpoint.startsWith('/api/v1/') || cleanEndpoint === '/api/v1') {
    return cleanEndpoint;
  }
  if (cleanEndpoint.startsWith('/v1/') || cleanEndpoint === '/v1') {
    return `/api${cleanEndpoint}`;
  }
  return `/api/v1${cleanEndpoint}`;
}

function getAuthContext() {
  const token = readStorage(['saare_auth_token', 'saare_token']);
  const tenant = readStorage(['saare_tenant_domain', 'saare_tenant']) || SAARE_CONFIG?.DEFAULT_TENANT || '';
  const user = readStorage(['saare_user_email']) || SAARE_CONFIG?.DEFAULT_USER || '';
  const role = readStorage(['saare_user_role']) || SAARE_CONFIG?.DEFAULT_ROLE || '';
  const cleanRoot = resolveControlPlaneRoot();
  const baseUrl = `${cleanRoot}/api/v1`;

  return { token, tenant, user, role, baseUrl, cleanRoot };
}

export async function saareFetch(endpoint, options = {}) {
  const { token, tenant, user, role, cleanRoot } = getAuthContext();
  const normalizedEndpoint = normalizeControlPlaneEndpoint(endpoint);
  const url = `${cleanRoot}${normalizedEndpoint}`;

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
    const { token, tenant, baseUrl } = getAuthContext();
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
    return { mode: 'CLOUD_EDGE', endpoint: `${baseUrl}/chat/completions` };
  },

  downloadNativeSidecar(overrideTenant) {
    const { tenant, cleanRoot } = getAuthContext();
    const targetTenant = overrideTenant !== undefined ? overrideTenant : tenant;
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const query = targetTenant ? `?tenant=${encodeURIComponent(targetTenant)}` : '';
    const sidecarUrl = `${cleanRoot}/api/v1/deploy/sidecar-zip${query}`;

    const link = document.createElement('a');
    link.href = sidecarUrl;
    link.download = `saare_native_sidecar_${targetTenant || 'tenant'}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async getKpis(startDate, endDate, overrideTenant) {
    const { tenant } = getAuthContext();
    const activeTenant = overrideTenant !== undefined ? overrideTenant : tenant;
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (activeTenant) params.set('tenant', activeTenant);
    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      const res = await saareFetch(`/metrics/tenants${query}`, {
        method: 'GET',
        overrideTenant: activeTenant
      });
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        const rows = Array.isArray(data?.data) ? data.data : [];
        const total = rows.reduce((acc, r) => acc + Number(r.total_prompts ?? 0), 0);
        const denied = rows.reduce((acc, r) => acc + Number(r.bloqueados_pii ?? 0), 0);
        const allowed = rows.reduce((acc, r) => acc + Number(r.aprobados ?? 0), 0);

        return {
          totalInterceptions: total,
          allowedActions: allowed || (total >= denied ? total - denied : 0),
          deniedActions: denied,
          reviewActions: 0,
          averageLatencyMs: 0,
          activeSellersCount: 0,
          activeTenantsCount: rows.length
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
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data)
          ? data
          : data.traces || data.evidences || data.runs || [];
        return list.map((item) => normalizeTraceRecord(item, activeTenant));
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

  async getNodeStatus(overrideTenant) {
    const { tenant } = getAuthContext();
    const activeTenant = overrideTenant !== undefined ? overrideTenant : tenant;
    try {
      const res = await saareFetch('/health', {
        method: 'GET',
        overrideTenant: activeTenant
      });
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        return normalizeNodeStatus(
          {
            ...data,
            trustAnchor: data.trustAnchor || SAARE_CONFIG?.TRUST_ANCHOR || ''
          },
          activeTenant
        );
      }
    } catch (e) {
      console.warn('[SAARE API] Error consultando estado del nodo:', e);
    }

    return normalizeNodeStatus(
      {
        status: 'NO_DISPONIBLE',
        healthy: false,
        trustAnchor: SAARE_CONFIG?.TRUST_ANCHOR || ''
      },
      activeTenant
    );
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

    const isSimulation = Boolean(
      bodyData.simulation === true ||
        String(bodyData.mode || '').toUpperCase() === 'SIMULATION'
    );
    const activeToken = bodyData.token !== undefined ? bodyData.token : token;
    const { token: _omitToken, ...rawBody } = bodyData;
    const resolvedTenant = rawBody.tenant !== undefined ? rawBody.tenant : tenant;
    const cleanBody = {
      ...rawBody,
      ...(resolvedTenant
        ? { tenant: resolvedTenant, tenant_id: rawBody.tenant_id || resolvedTenant }
        : {})
    };

    const profileHeaders = {
      ...(cleanBody.browserProfile
        ? { 'x-saare-browser-profile': String(cleanBody.browserProfile) }
        : {}),
      ...(cleanBody.clientProfile
        ? { 'x-saare-client-profile': String(cleanBody.clientProfile) }
        : {})
    };

    if (routeMode === 'LOCAL_SIDECAR') {
      try {
        const localRes = await fetch(LOCAL_SIDECAR_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...profileHeaders,
            ...(cleanBody.tenant
              ? { 'x-saare-tenant': cleanBody.tenant, 'X-SAARE-Tenant': cleanBody.tenant }
              : {}),
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
          },
          body: JSON.stringify({
            prompt: cleanBody.prompt || '',
            scenario: cleanBody.scenarioId || cleanBody.scenario || 'DEFAULT',
            tenant_id: cleanBody.tenant || '',
            simulation: isSimulation
          })
        });

        const localData = await localRes.json().catch(() => ({}));
        const isDeny =
          localData?.verdict === 'DENY' || localRes.status === 403 || !localRes.ok;

        return normalizeVerdictResponse(
          {
            ...localData,
            success: !isDeny,
            route: 'LOCAL_SIDECAR_RAM',
            tenant: localData?.tenant_id || cleanBody.tenant || '',
            evidence_id: localData?.evidence_hash
              ? `EV-${String(localData.evidence_hash).slice(0, 10).toUpperCase()}`
              : '',
            decision: isDeny ? 'DENY' : 'ALLOW',
            enforcement: {
              verdict: isDeny ? 'DENY' : 'ALLOW',
              sanitizedInRam: true,
              piiDetected: Boolean(localData?.threat_detected),
              ms3vIntegrityHash: localData?.evidence_hash || '',
              latencyMs: localData?.latency_ms ?? 0
            },
            inference: {
              provider: 'LOCAL_SIDECAR',
              responseContent: isDeny ? '' : localData?.clean_prompt || ''
            }
          },
          { simulation: isSimulation, tenantId: cleanBody.tenant }
        );
      } catch (e) {
        return normalizeVerdictResponse(
          {
            decision: 'DENY',
            verdict: 'LOCAL_SIDECAR_UNREACHABLE',
            error: e.message,
            message: e.message
          },
          { simulation: isSimulation, tenantId: cleanBody.tenant }
        );
      }
    }

    try {
      const res = await saareFetch('/chat/completions', {
        method: 'POST',
        headers: profileHeaders,
        overrideTenant: cleanBody.tenant,
        overrideUser: cleanBody.user,
        overrideRole: cleanBody.role,
        overrideToken: activeToken,
        body: JSON.stringify(cleanBody)
      });

      const data = await res?.json().catch(() => ({}));
      if (res && res.ok) {
        return normalizeVerdictResponse(data, {
          simulation: isSimulation,
          tenantId: cleanBody.tenant
        });
      }

      const errMsg = data.message || data.error || `HTTP ${res?.status}: Acceso bloqueado.`;
      return normalizeVerdictResponse(
        {
          ...data,
          decision: 'DENY',
          verdict: 'FAIL_CLOSED_BLOCKED',
          error: errMsg,
          message: errMsg
        },
        { simulation: isSimulation, tenantId: cleanBody.tenant }
      );
    } catch (e) {
      return normalizeVerdictResponse(
        {
          decision: 'DENY',
          verdict: 'FAIL_CLOSED',
          error: e.message,
          message: e.message
        },
        { simulation: isSimulation, tenantId: cleanBody.tenant }
      );
    }
  },

  async verifyEvidenceSignature(hash = '', extra = {}) {
    const cleanHash = String(hash || '').trim();
    if (!cleanHash) {
      return normalizeSignatureVerifyResponse(
        { verified: false, error: 'Hash vacío o no especificado.' },
        ''
      );
    }

    try {
      const res = await saareFetch('/evidence/verify', {
        method: 'POST',
        body: JSON.stringify({
          proof: extra.proof || 'SHA256_RFC3161_VALIDATED',
          leafHash: cleanHash,
          merkleRoot: extra.merkleRoot || cleanHash,
          ...extra
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return normalizeSignatureVerifyResponse(
          {
            ...data,
            verified: false,
            error: data?.message || data?.error || `HTTP ${res.status}`
          },
          cleanHash
        );
      }
      return normalizeSignatureVerifyResponse(data, cleanHash);
    } catch (e) {
      return normalizeSignatureVerifyResponse(
        { verified: false, error: e?.message || 'Error al verificar firma.' },
        cleanHash
      );
    }
  },

  async sealMerkleBatch(params = {}) {
    const { tenant } = getAuthContext();
    const targetTenant = String(params.tenantId || params.tenant || tenant || '').trim();

    try {
      const res = await saareFetch('/forensics/batch/seal', {
        method: 'POST',
        overrideTenant: targetTenant,
        body: JSON.stringify({
          tenantId: targetTenant,
          enable2of3Custody: params.enable2of3Custody !== false,
          ...params
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return normalizeBatchSealResponse(
          {
            ...data,
            tsaStatus: EXECUTION_STATUS.FAILED,
            error: data?.message || data?.error || `HTTP ${res.status}`
          },
          targetTenant
        );
      }
      return normalizeBatchSealResponse(data, targetTenant);
    } catch (e) {
      return normalizeBatchSealResponse(
        {
          tsaStatus: EXECUTION_STATUS.FAILED,
          error: e?.message || 'Error al sellar lote Merkle.'
        },
        targetTenant
      );
    }
  },

  async syncVault(overrideTenant) {
    const { tenant } = getAuthContext();
    const activeTenant = overrideTenant !== undefined ? overrideTenant : tenant;
    try {
      let res = await saareFetch('/vault/sync', {
        method: 'GET',
        overrideTenant: activeTenant
      });
      if (res && res.status === 405) {
        res = await saareFetch('/vault/sync', {
          method: 'POST',
          overrideTenant: activeTenant,
          body: JSON.stringify({ tenantId: activeTenant })
        });
      }
      const data = await res?.json().catch(() => ({}));
      if (res && res.ok) {
        return {
          ...data,
          ok: true,
          status: EXECUTION_STATUS.VERIFIED
        };
      }
      return {
        ...data,
        ok: false,
        status: EXECUTION_STATUS.FAILED,
        httpStatus: res?.status || 0
      };
    } catch (e) {
      return {
        ok: false,
        status: EXECUTION_STATUS.FAILED,
        error: e.message
      };
    }
  }
};

export const api = apiService;
export default apiService;