// saare-console/src/utils/api.js — Cliente HTTP para saare-console (SGP 1.0)

const rawEnvUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : null;

// Saneamiento robusto de URL base
const cleanEnvUrl = rawEnvUrl 
  ? rawEnvUrl.replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '') 
  : null;

const isLocal = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_HOST = isLocal ? 'http://127.0.0.1:8787' : (cleanEnvUrl || 'https://api.saare.es');
export const API_BASE_URL = `${API_HOST}/api/v1`;

function isOwnApi(url) {
  return url.startsWith(API_HOST);
}

/**
 * Cliente HTTP universal para la Consola GRC de S.A.A.R.E. (SGP 1.0 / v8.1 SRP)
 * @param {string} endpoint - Ruta del endpoint o URL absoluta
 * @param {RequestInit} options - Opciones nativas de fetch
 * @returns {Promise<Response>}
 */
export async function saareFetch(endpoint, options = {}) {
  const isAbsolute = typeof endpoint === 'string' && (endpoint.startsWith('http://') || endpoint.startsWith('https://'));
  let finalUrl = endpoint;

  // 1. Normalización estricta para erradicar el bug de duplicación (/api/v1/api/v1/)
  if (!isAbsolute) {
    // Quitamos las barras iniciales
    let relativePath = endpoint.replace(/^\/+/, '');
    // Quitamos cualquier prefijo api/ o api/v1/ residual que venga de las llamadas en los componentes
    relativePath = relativePath.replace(/^api\/(v1\/)?/, '');
    
    // Ensamblamos forzando exactamente un único bloque /api/v1/
    finalUrl = `${API_BASE_URL}/${relativePath}`;
  }

  // 2. Extracción de credenciales, rol y contexto desde la sesión unificada
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
        currentTenant = parsed.tenantName || parsed.company || localStorage.getItem('saare_tenant_domain') || null;
        if (parsed.role) currentRole = parsed.role;
      } else {
        currentUser = localStorage.getItem('saare_user_email') || null;
        currentTenant = localStorage.getItem('saare_tenant_domain') || null;
      }
    } catch (e) {
      currentUser = localStorage.getItem('saare_user_email') || null;
      currentTenant = localStorage.getItem('saare_tenant_domain') || null;
    }
  }

  // 3. Ensamblado de cabeceras de seguridad e identidad multi-tenant RBAC
  const defaultHeaders = {
    'Accept': 'application/json',
    'x-saare-spec': 'SGP-1.0',
    ...(options.body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
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

    // 4. Gestión global de sesión expirada o no autorizada
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('saare_auth_token');
      localStorage.removeItem('saare_session_user');
      localStorage.removeItem('saare_token');
      localStorage.removeItem('saare_user_email');
      localStorage.removeItem('saare_user_role');
    }

    return response;
  } catch (error) {
    console.error('[SAARE_CONSOLE_API] Error de conexión con Control Plane:', error);
    throw new Error(`Error de conexión con el Control Plane: ${error.message}`);
  }
}

/**
 * Helpers especializados para simplificar llamadas desde la UI de saare-console
 */
export const api = {
  get: (endpoint, options = {}) => saareFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => saareFetch(endpoint, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),
  put: (endpoint, body, options = {}) => saareFetch(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(body) 
  }),
  delete: (endpoint, options = {}) => saareFetch(endpoint, { ...options, method: 'DELETE' }),
  
  getSrpManifest: () => saareFetch('/manifest/srp', { method: 'GET' }),
  
  getKpis: (startDate, endDate) => {
    const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
    return saareFetch(`/metrics/kpis${query}`, { method: 'GET' });
  }
};