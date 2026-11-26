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

const DEFAULT_LOCAL_SIDECAR_URL = 'http://127.0.0.1:8080/api/v1/validate';
const ROUTE_MODE_KEY = 'SAARE_ROUTE_MODE'; // 'CLOUD_EDGE' | 'LOCAL_SIDECAR'

const TOKEN_KEYS = ['saare_auth_token', 'saare_token'];
const TENANT_KEYS = ['saare_tenant_domain', 'saare_tenant'];
const USER_KEYS = ['saare_user_email'];
const ROLE_KEYS = ['saare_user_role'];

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
    if (value) {
      window.localStorage?.setItem(key, value);
      window.sessionStorage?.setItem(key, value);
    } else {
      window.localStorage?.removeItem(key);
      window.sessionStorage?.removeItem(key);
    }
  } catch {
    // Ignorar restricciones de almacenamiento
  }
};

const writeStorageKeys = (keys = [], value = '') => {
  for (const key of keys) {
    writeStorage(key, value);
  }
};

function resolveLocalSidecarUrl() {
  const envSidecar =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_LOCAL_SIDECAR_URL : '';
  return String(envSidecar || SAARE_CONFIG?.LOCAL_SIDECAR_URL || DEFAULT_LOCAL_SIDECAR_URL)
    .trim()
    .replace(/\/+$/, '');
}

function resolveControlPlaneRoot() {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : '';
  const rawBase = String(envUrl || SAARE_CONFIG?.API_BASE_URL || 'https://api.saare.es')
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
  const token = readStorage(TOKEN_KEYS).replace(/^Bearer\s+/i, '').trim();
  const tenant = readStorage(TENANT_KEYS).trim();
  const user = readStorage(USER_KEYS).trim();
  const role = readStorage(ROLE_KEYS).trim();
  const cleanRoot = resolveControlPlaneRoot();
  const baseUrl = `${cleanRoot}/api/v1`;

  return { token, tenant, user, role, baseUrl, cleanRoot };
}

export async function saareFetch(endpoint, options = {}) {
  const { token, tenant, user, role, cleanRoot } = getAuthContext();
  const normalizedEndpoint = normalizeControlPlaneEndpoint(endpoint);
  const url = `${cleanRoot}${normalizedEndpoint}`;

  const activeToken = String(
    options.overrideToken !== undefined ? options.overrideToken : token
  )
    .replace(/^Bearer\s+/i, '')
    .trim();
  const activeTenant = String(
    options.overrideTenant !== undefined ? options.overrideTenant : tenant
  ).trim();
  const activeUser = String(
    options.overrideUser !== undefined ? options.overrideUser : user
  ).trim();
  const activeRole = String(
    options.overrideRole !== undefined ? options.overrideRole : role
  ).trim();

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

  clearSession() {
    writeStorageKeys(TOKEN_KEYS, '');
    writeStorageKeys(TENANT_KEYS, '');
    writeStorageKeys(USER_KEYS, '');
    writeStorageKeys(ROLE_KEYS, '');
  },

  async login(email, password, tenantId = '') {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanTenant = String(tenantId || '').trim();
    const { cleanRoot } = getAuthContext();

    const res = await fetch(`${cleanRoot}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cleanTenant ? { 'x-saare-tenant': cleanTenant } : {})
      },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        ...(cleanTenant ? { tenantId: cleanTenant, tenant: cleanTenant } : {})
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(
        data?.message || data?.error || `Credenciales no autorizadas (HTTP ${res.status}).`
      );
      err.status = res.status;
      throw err;
    }

    const token = String(data?.token || data?.access_token || '')
      .replace(/^Bearer\s+/i, '')
      .trim();
    const resolvedTenant = String(data?.user?.tenantId || data?.tenantId || cleanTenant).trim();
    const resolvedEmail = String(data?.user?.email || cleanEmail).trim();
    const resolvedRole = String(data?.user?.role || '').trim();

    if (token) writeStorageKeys(TOKEN_KEYS, token);
    if (resolvedTenant) writeStorageKeys(TENANT_KEYS, resolvedTenant);
    if (resolvedEmail) writeStorageKeys(USER_KEYS, resolvedEmail);
    if (resolvedRole) writeStorageKeys(ROLE_KEYS, resolvedRole);

    return {
      ...data,
      token,
      user: {
        ...(data?.user || {}),
        email: resolvedEmail,
        tenantId: resolvedTenant,
        ...(resolvedRole ? { role: resolvedRole } : {})
      }
    };
  },

  getRouteMode() {
    const mode = readStorage([ROUTE_MODE_KEY]);
    return mode === 'LOCAL_SIDECAR' ? 'LOCAL_SIDECAR' : 'CLOUD_EDGE';
  },

  async setRouteMode(targetMode) {
    const { token, tenant, baseUrl } = getAuthContext();
    const sidecarUrl = resolveLocalSidecarUrl();

    if (targetMode === 'LOCAL_SIDECAR') {
      const probe = await fetch(sidecarUrl, {
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
      return { mode: 'LOCAL_SIDECAR', endpoint: sidecarUrl };
    }

    writeStorage(ROUTE_MODE_KEY, 'CLOUD_EDGE');
    return { mode: 'CLOUD_EDGE', endpoint: `${baseUrl}/chat/completions` };
  },

  downloadNativeSidecar(overrideTenant) {
    const { tenant, cleanRoot } = getAuthContext();
    const targetTenant = String(overrideTenant !== undefined ? overrideTenant : tenant).trim();
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
    const activeTenant = String(overrideTenant !== undefined ? overrideTenant : tenant).trim();
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
      if (res && res.status === 401) {
        console.warn('[SAARE API] Sesión no autorizada (401) en /metrics/tenants.');
        return { unauthorized: true, status: 401 };
      }
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
      const activeTenant = String(params.tenant !== undefined ? params.tenant : tenant).trim();
      const activeUser = String(params.user !== undefined ? params.user : user).trim();

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

      if (res && res.status === 401) {
        console.warn('[SAARE API] Sesión no autorizada (401) en /traces.');
        return [];
      }
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
    const activeTenant = String(overrideTenant !== undefined ? overrideTenant : tenant).trim();
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
    const sidecarUrl = resolveLocalSidecarUrl();

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
    const resolvedTenant = String(
      rawBody.tenant !== undefined ? rawBody.tenant : tenant
    ).trim();
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
        const localRes = await fetch(sidecarUrl, {
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

      const isAuthError = res?.status === 401;
      const errMsg =
        data.message ||
        data.error ||
        (isAuthError
          ? 'HTTP 401: Sesión no autorizada o token inválido.'
          : `HTTP ${res?.status}: Acceso bloqueado.`);

      return normalizeVerdictResponse(
        {
          ...data,
          decision: 'DENY',
          verdict: isAuthError ? 'UNAUTHORIZED_401' : 'FAIL_CLOSED_BLOCKED',
          httpStatus: res?.status || 0,
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
    const activeTenant = String(overrideTenant !== undefined ? overrideTenant : tenant).trim();
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