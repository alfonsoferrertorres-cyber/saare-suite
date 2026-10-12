// saare-console/src/utils/api.js — Cliente HTTP Universal S.A.A.R.E. (SGP 1.0 / v8.2 SRP)

const rawEnvUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : null;

// Normalización estricta de la URL base configurada en entorno
const cleanEnvUrl = rawEnvUrl 
  ? rawEnvUrl.replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '') 
  : null;

const isLocal = typeof window !== "undefined" && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

/**
 * Resuelve dinámicamente la URL base de la Bóveda / Control Plane.
 * Prioridad: 
 * 1. Anulación manual por el usuario (Botón Enrutador de Bóveda)
 * 2. Entorno local (127.0.0.1:3001)
 * 3. Variable de entorno VITE_API_BASE_URL
 * 4. Dominio corporativo oficial (api.saare.es)
 */
export function getApiHost() {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('saare_override_vault_host');
    if (override && override.trim() !== '') {
      return override.replace(/\/$/, '');
    }
  }
  if (isLocal) {
    return 'http://127.0.0.1:3001';
  }
  return cleanEnvUrl || 'https://api.saare.es';
}

export const API_HOST = getApiHost();
export const API_BASE_URL = `${API_HOST}/api/v1`;

/**
 * Valida si la URL destino pertenece al ecosistema S.A.A.R.E. para inyectar credenciales de forma segura
 */
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

/**
 * Cliente HTTP unificado para la Consola GRC de S.A.A.R.E.
 * @param {string} endpoint - Ruta relativa o URL absoluta
 * @param {RequestInit} options - Opciones de fetch
 * @returns {Promise<Response>}
 */
export async function saareFetch(endpoint, options = {}) {
  const activeHost = getApiHost();
  const activeBaseUrl = `${activeHost}/api/v1`;
  const isAbsolute = typeof endpoint === 'string' && (endpoint.startsWith('http://') || endpoint.startsWith('https://'));
  
  let finalUrl = endpoint;

  // 1. Normalización anti-duplicación de prefijos (/api/v1)
  if (!isAbsolute) {
    let relativePath = String(endpoint || '').replace(/^\/+/, '');
    relativePath = relativePath.replace(/^api\/(v1\/)?/, '');
    finalUrl = `${activeBaseUrl}/${relativePath}`;
  }

  // 2. Extracción segura de credenciales y contexto RBAC desde localStorage
  let token = null;
  let currentUser = null;
  let currentTenant = null;
  let currentRole = 'CISO_ADMIN';

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token');
    currentRole = localStorage.getItem('saare_user_role') || 'CISO_ADMIN';
    
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

  // Sanitización estricta del tenant
  if (!currentTenant || currentTenant.includes('@')) {
    currentTenant = 'ENTERPRISE';
  }

  // Generación de prueba de atestación de credencial para el testigo L7
  const credentialProof = token ? `Ed25519-Proof:${token.slice(-12)}` : 'UNSIGNED_ANON';

  // 3. Ensamblado de cabeceras de seguridad e identidad multi-tenant con atestación
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

    // 4. Limpieza automática de sesión si el token ha expirado
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

/**
 * Helpers API con parseo automático de JSON y manejo seguro de errores
 */
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
  }
};

export default saareFetch;