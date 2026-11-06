// saare-console/src/utils/api.js — Cliente HTTP Universal S.A.A.R.E. (SGP 1.0 / V12.1 Producción Conectada)
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

  // 3. Prioridad (Producción / Single-Origin): URL donde corre la web si es api.saare.es
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin.includes('saare.es')) {
    return window.location.origin;
  }

  // Fallback predeterminado hacia el API gateway de producción S.A.A.R.E.
  return SAARE_CONFIG?.TRUST_ANCHOR || 'https://api.saare.es';
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

// Helper interno para decodificar JWT sin librerías externas
function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
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
  let currentUser = SAARE_CONFIG?.DEFAULT_USER || 'admin@saare.es';
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

  // Cabeceras Estándar S.A.A.R.E. v10.0 / SGP 1.0
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

// 3. MÉTODOS AUXILIARES Y SERVICIOS DE AUTENTICACIÓN / AUDITORÍA
export const api = {
  // === SERVICIO DE AUTENTICACIÓN Y VERIFICACIÓN DE CREDENCIALES ===
  login: async (email, password, tenantDomain) => {
    const res = await saareFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, tenant: tenantDomain })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error en la verificación de credenciales.');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('saare_token', data.token);
      localStorage.setItem('saare_user_email', data.user?.email || email);
      localStorage.setItem('saare_tenant_domain', data.user?.tenantId || tenantDomain);
      localStorage.setItem('saare_user_role', data.user?.role || 'CISO_ADMIN');
      localStorage.setItem('saare_consent_accepted', 'true');
    }
    return data;
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token');
    
    if (token) {
      const decoded = parseJwtPayload(token);
      if (decoded) {
        return {
          email: decoded.email || decoded.sub || localStorage.getItem('saare_user_email'),
          tenantId: decoded.tenant_id || decoded.tenant || localStorage.getItem('saare_tenant_domain'),
          role: decoded.role || localStorage.getItem('saare_user_role') || 'CISO_ADMIN'
        };
      }
    }

    const email = localStorage.getItem('saare_user_email');
    const tenantId = localStorage.getItem('saare_tenant_domain');
    const role = localStorage.getItem('saare_user_role');

    if (email && tenantId) {
      return { email, tenantId, role: role || 'CISO_ADMIN' };
    }

    return null;
  },

  verifySession: async () => {
    try {
      const res = await saareFetch('/auth/me', { method: 'GET' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saare_token');
      localStorage.removeItem('saare_auth_token');
      localStorage.removeItem('saare_session_user');
      localStorage.removeItem('saare_consent_accepted');
    }
  },

  // === MÉTODOS HTTP GENÉRICOS ===
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
    return api.getTraces(params);
  },

  getRuns: async (params = {}) => {
    return api.getTraces(params);
  },

  getTraces: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/traces${query ? `?${query}` : ''}`;
    try {
      const res = await saareFetch(endpoint, { method: 'GET' });
      if (!res.ok) return { evidences: [], total: 0 };
      const data = await res.json();
      return {
        evidences: data.traces || data.evidences || data.runs || data.data || (Array.isArray(data) ? data : []),
        total: data.count || data.total || 0
      };
    } catch (e) {
      console.error('[SAARE_API] Error al obtener trazas:', e);
      return { evidences: [], total: 0 };
    }
  },

  getTraceById: async (traceId) => {
    try {
      const res = await saareFetch(`/traces/${traceId}`, { method: 'GET' });
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      return null;
    }
  },

  downloadForensicReport: async () => {
    try {
      const res = await saareFetch('/evidence/download-pdf', { method: 'GET' });
      if (!res.ok) throw new Error('No se pudo generar el informe pericial');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_pericial_ms3v_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    } catch (e) {
      console.error('[SAARE_API] Error al descargar informe pericial:', e);
      throw e;
    }
  }
};

export default saareFetch;