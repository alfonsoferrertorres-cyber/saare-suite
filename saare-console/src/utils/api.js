// saare-console/src/utils/api.js — Cliente HTTP Universal S.A.A.R.E. (SGP 1.0 / v8.4 SRP)

const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
  ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL) 
  : null;

const rawEnvUrlString = typeof envBaseUrl === 'string' ? envBaseUrl : null;
const cleanEnvUrl = rawEnvUrlString 
  ? rawEnvUrlString.replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '') 
  : null;

const isLocal = typeof window !== "undefined" && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

export function getApiHost() {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('saare_override_vault_host');
    if (override && override.trim() !== '') {
      return override.replace(/\/$/, '');
    }
  }

  if (cleanEnvUrl) {
    return cleanEnvUrl;
  }

  if (isLocal) {
    return 'http://127.0.0.1:8080';
  }

  return 'https://api.saare.es';
}

export const API_HOST = getApiHost();
export const API_BASE_URL = `${API_HOST}/api/v1`;

function isOwnApi(url) {
  if (typeof url !== 'string') return false;
  const currentHost = getApiHost();
  return (
    url.startsWith(currentHost) || 
    url.startsWith('/') || 
    url.includes('saare.es') || 
    url.includes('workers.dev') ||
    url.includes('127.0.0.1') ||
    url.includes('localhost')
  );
}

export async function saareFetch(endpoint, options = {}) {
  const activeHost = getApiHost();
  const activeBaseUrl = `${activeHost}/api/v1`;
  const isAbsolute = typeof endpoint === 'string' && (endpoint.startsWith('http://') || endpoint.startsWith('https://'));
  
  let finalUrl = endpoint;

  if (!isAbsolute) {
    let relativePath = String(endpoint || '').replace(/^\/+/, '');
    relativePath = relativePath.replace(/^api\/(v1\/)?/, '');
    finalUrl = `${activeBaseUrl}/${relativePath}`;
  }

  let token = null;
  let currentUser = null;
  let currentTenant = null;
  let currentRole = 'DPO_GRC_LEVEL_2';

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token');
    currentRole = localStorage.getItem('saare_user_role') || 'DPO_GRC_LEVEL_2';
    
    try {
      const storedUser = localStorage.getItem('saare_session_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        currentUser = parsed.email || localStorage.getItem('saare_user_email') || null;
        currentTenant = parsed.tenantName || parsed.company || localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';
        if (parsed.role) currentRole = parsed.role;
      } else {
        currentUser = localStorage.getItem('saare_user_email') || null;
        currentTenant = localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';
      }
    } catch (e) {
      currentUser = localStorage.getItem('saare_user_email') || null;
      currentTenant = localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';
    }
  }

  if (!currentTenant || currentTenant.includes('@')) {
    currentTenant = 'ENTERPRISE';
  }

  const credentialProof = token ? `Ed25519-Proof:${token.slice(-12)}` : 'UNSIGNED_ANON';

  const defaultHeaders = {
    'Accept': 'application/json',
    'x-saare-spec': 'SGP-1.0',
    'x-saare-credential-proof': credentialProof,
    ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    ...(token && isOwnApi(finalUrl) ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(currentUser && isOwnApi(finalUrl) ? { 'x-saare-user': currentUser } : {}),
    ...(currentTenant && isOwnApi(finalUrl) ? { 'x-saare-tenant': currentTenant } : {}),
    ...(currentRole && isOwnApi(finalUrl) ? { 'x-saare-role': currentRole } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers: defaultHeaders
    });

    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('saare_auth_token');
      localStorage.removeItem('saare_session_user');
      localStorage.removeItem('saare_token');
      localStorage.removeItem('saare_user_email');
      localStorage.removeItem('saare_user_role');
      localStorage.removeItem('saare_tenant_domain');
    }

    return response;
  } catch (error) {
    console.error('[SAARE_CONSOLE_API] Error de conexión con Control Plane / Bóveda:', error);
    throw new Error(`Error de conexión con la Bóveda (${activeHost}): ${error.message}`);
  }
}

export const api = {
  get: async (endpoint, options = {}) => {
    const res = await saareFetch(endpoint, { ...options, method: 'GET' });
    if (!res.ok) throw new Error(`GET error ${res.status}: ${res.statusText}`);
    return res.json();
  },
  
  post: async (endpoint, body, options = {}) => {
    const res = await saareFetch(endpoint, { 
      ...options, 
      method: 'POST', 
      body: typeof body === 'string' ? body : JSON.stringify(body) 
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `POST error ${res.status}`);
    }
    return res.json();
  },
  
  put: async (endpoint, body, options = {}) => {
    const res = await saareFetch(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: typeof body === 'string' ? body : JSON.stringify(body) 
    });
    if (!res.ok) throw new Error(`PUT error ${res.status}: ${res.statusText}`);
    return res.json();
  },
  
  delete: async (endpoint, options = {}) => {
    const res = await saareFetch(endpoint, { ...options, method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE error ${res.status}: ${res.statusText}`);
    return res.json();
  },
  
  getSrpManifest: async () => {
    const res = await saareFetch('/manifest/srp', { method: 'GET' }).catch(() => null);
    return res && res.ok ? res.json() : null;
  },
  
  getKpis: async (startDate, endDate) => {
    const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
    const res = await saareFetch(`/metrics/kpis${query}`, { method: 'GET' }).catch(() => null);
    return res && res.ok ? res.json() : {};
  },

  getEvidences: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/evidences${query ? `?${query}` : ''}`;
    try {
      const res = await saareFetch(endpoint, { method: 'GET' });
      if (!res.ok) return { evidences: [], total: 0 };
      const data = await res.json();
      return {
        evidences: data.evidences || data.data || (Array.isArray(data) ? data : []),
        total: data.total || (data.evidences ? data.evidences.length : 0)
      };
    } catch (e) {
      console.warn('[SAARE_API] Error al cargar evidencias desde /evidences, probando fallback /runs:', e);
      return api.getRuns(params);
    }
  },

  getRuns: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/runs${query ? `?${query}` : ''}`;
    try {
      const res = await saareFetch(endpoint, { method: 'GET' });
      if (!res.ok) return { evidences: [], total: 0 };
      const data = await res.json();
      return {
        evidences: data.evidences || data.runs || data.data || (Array.isArray(data) ? data : []),
        total: data.total || 0
      };
    } catch (e) {
      console.error('[SAARE_API] Error fatal al obtener trazas:', e);
      return { evidences: [], total: 0 };
    }
  },

  getTraceById: async (traceId) => {
    try {
      const res = await saareFetch(`/evidences/${traceId}`, { method: 'GET' });
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      return null;
    }
  }
};

export default saareFetch;