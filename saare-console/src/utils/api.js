// saare-console/src/utils/api.js — Cliente HTTP Universal S.A.A.R.E. (SGP 1.0 / V12.1 Producción Virginizado)
import { SAARE_CONFIG } from '../config/saareState';

// 1. RESOLUCIÓN DINÁMICA Y AGNÓSTICA DE HOST DE API
export function getApiHost() {
  if (typeof window !== 'undefined') {
    // 1. Prioridad: Host personalizado guardado en localStorage
    const override = localStorage.getItem('saare_override_vault_host');
    if (override && override.trim() !== '') {
      return override.replace(/\/$/, '');
    }
  }

  // 2. Prioridad: Variable de entorno explícita (si existe)
  const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
    ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_SAARE_API_BASE_URL) 
    : null;

  if (typeof envBaseUrl === 'string' && envBaseUrl.trim() !== '') {
    return envBaseUrl.replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '');
  }

  // 3. Prioridad (Producción / Single-Origin): URL donde corre la web
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return SAARE_CONFIG?.TRUST_ANCHOR || 'http://127.0.0.1:8000';
}

// Getters dinámicos para evitar valores estáticos obsoletos si cambia localStorage
export const getApiBaseUrl = () => `${getApiHost()}/api/v1`;
export const API_HOST = getApiHost();
export const API_BASE_URL = getApiBaseUrl();

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

// 2. CLIENTE DE INTERCEPCIÓN HTTP CON INYECCIÓN AUTOMÁTICA DE ENCABEZADOS Y PRUEBAS RBAC
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
  let currentUser = SAARE_CONFIG?.DEFAULT_USER || '';
  let currentTenant = SAARE_CONFIG?.DEFAULT_TENANT || 'ORGANISMO_DEMO_01';
  let currentRole = SAARE_CONFIG?.DEFAULT_ROLE || 'CISO_ADMIN';

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token');
    currentRole = localStorage.getItem('saare_user_role') || SAARE_CONFIG?.DEFAULT_ROLE || 'CISO_ADMIN';
    
    try {
      const storedUser = localStorage.getItem('saare_session_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        currentUser = parsed.email || localStorage.getItem('saare_user_email') || currentUser;
        currentTenant = parsed.tenantName || parsed.company || localStorage.getItem('saare_tenant_domain') || currentTenant;
        if (parsed.role) currentRole = parsed.role;
      } else {
        currentUser = localStorage.getItem('saare_user_email') || currentUser;
        currentTenant = localStorage.getItem('saare_tenant_domain') || currentTenant;
      }
    } catch (e) {
      currentUser = localStorage.getItem('saare_user_email') || currentUser;
      currentTenant = localStorage.getItem('saare_tenant_domain') || currentTenant;
    }
  }

  if (!currentTenant || currentTenant.includes('@')) {
    currentTenant = SAARE_CONFIG?.DEFAULT_TENANT || 'ORGANISMO_DEMO_01';
  }

  const credentialProof = token ? `Ed25519-Proof:${token.slice(-12)}` : 'MS3V_MASTER_NODE_PROOF';

  // Inyección de JSON automatizada si se envía un objeto en body
  let processedBody = options.body;
  const isJsonBody = options.body && typeof options.body === 'object' && !(options.body instanceof FormData);
  if (isJsonBody) {
    processedBody = JSON.stringify(options.body);
  }

  // Cabeceras Estándar S.A.A.R.E. v10.0 / SGP 1.0 (Incluye Módulo 5 Witness Tag)
  const defaultHeaders = {
    'Accept': 'application/json',
    'x-saare-spec': SAARE_CONFIG?.SPEC_VERSION || 'SGP-1.0',
    'x-saare-witness-tag': '[MS3V-COMPLIANCE-L7-OK]',
    'x-saare-credential-proof': credentialProof,
    ...(processedBody && (typeof processedBody === 'string' || isJsonBody) ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    ...(token && isOwnApi(finalUrl) ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(currentUser && isOwnApi(finalUrl) ? { 'x-saare-user': currentUser } : {}),
    ...(currentTenant && isOwnApi(finalUrl) ? { 'x-saare-tenant': currentTenant } : {}),
    ...(currentRole && isOwnApi(finalUrl) ? { 'x-saare-role': currentRole } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(finalUrl, {
      ...options,
      body: processedBody,
      headers: defaultHeaders
    });

    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('saare_auth_token');
      localStorage.removeItem('saare_session_user');
      localStorage.removeItem('saare_token');
    }

    return response;
  } catch (error) {
    console.error('[SAARE_CONSOLE_API] Error de conexión con Control Plane / Bóveda:', error);
    
    // Oñemyatyrõ: Ndaipóri jave red (offline), ome'ẽ peteĩ Response sintético (status 503) aníagui ojapo error no-manejado (unhandled rejection)
    return new Response(
      JSON.stringify({
        error: true,
        offline: true,
        message: `Error de conexión con la Bóveda (${activeHost}): ${error.message}`
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 3. MÉTODOS AUXILIARES Y ENDPOINTS DE AUDITORÍA
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
    const endpoint = `/runs${query ? `?${query}` : ''}`;
    try {
      const res = await saareFetch(endpoint, { method: 'GET' });
      if (!res.ok) return { evidences: [], total: 0 };
      const data = await res.json();
      return {
        evidences: data.evidences || data.runs || data.data || (Array.isArray(data) ? data : []),
        total: data.total || (data.evidences ? data.evidences.length : 0)
      };
    } catch (e) {
      console.warn('[SAARE_API] Error al cargar evidencias desde /runs, probando fallback /traces:', e);
      return api.getTraces(params);
    }
  },

  getRuns: async (params = {}) => {
    return api.getEvidences(params);
  },

  getTraces: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/traces${query ? `?${query}` : ''}`;
    try {
      const res = await saareFetch(endpoint, { method: 'GET' });
      if (!res.ok) return { evidences: [], total: 0 };
      const data = await res.json();
      return {
        evidences: data.traces || data.evidences || data.data || (Array.isArray(data) ? data : []),
        total: data.count || data.total || 0
      };
    } catch (e) {
      console.error('[SAARE_API] Error fatal al obtener trazas:', e);
      return { evidences: [], total: 0 };
    }
  },

  getTraceById: async (traceId) => {
    try {
      const res = await saareFetch(`/runs/${traceId}`, { method: 'GET' });
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      return null;
    }
  }
};

export default saareFetch;