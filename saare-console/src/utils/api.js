// saare-console/src/utils/api.js

const ENV_URL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : null;
const isLocal = typeof window !== "undefined" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Raíz base del API Gateway
export const API_HOST = isLocal ? 'http://127.0.0.1:8787' : (ENV_URL || 'https://api.saare.es');
export const API_BASE_URL = `${API_HOST}/api/v1`;

function isOwnApi(url) {
  return url.startsWith(API_HOST) || url.startsWith(API_BASE_URL);
}

/**
 * Cliente HTTP universal para el Control Plane de S.A.A.R.E. (SGP 1.0 / v8.1 SRP)
 * @param {string} endpoint - Ruta del endpoint o URL absoluta
 * @param {RequestInit} options - Opciones nativas de fetch
 * @returns {Promise<Response>}
 */
export async function saareFetch(endpoint, options = {}) {
  const isAbsolute = typeof endpoint === 'string' && endpoint.startsWith('http');
  let cleanEndpoint = endpoint;

  // 1. Normalización de URL y versionado (Prevención de duplicados de prefijo)
  if (!isAbsolute) {
    if (!cleanEndpoint.startsWith('/')) cleanEndpoint = `/${cleanEndpoint}`;
    
    // Antepone /api/v1 solo si no especifica una versión de API explícita (/api/...)
    if (!cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = `/api/v1${cleanEndpoint}`;
    }
    
    cleanEndpoint = `${API_HOST}${cleanEndpoint}`;
  }

  // 2. Extracción de credenciales y contexto desde la sesión unificada
  let token = null;
  let currentUser = null;
  let currentTenant = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token');
    
    try {
      const storedUser = localStorage.getItem('saare_session_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        currentUser = parsed.email || localStorage.getItem('saare_user_email') || null;
        currentTenant = parsed.tenantName || parsed.company || localStorage.getItem('saare_tenant_domain') || null;
      } else {
        currentUser = localStorage.getItem('saare_user_email') || null;
        currentTenant = localStorage.getItem('saare_tenant_domain') || null;
      }
    } catch (e) {
      currentUser = localStorage.getItem('saare_user_email') || null;
      currentTenant = localStorage.getItem('saare_tenant_domain') || null;
    }
  }

  // 3. Ensamblado de cabeceras de seguridad e identidad multi-tenant (solo en API propia)
  const defaultHeaders = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    ...(token && isOwnApi(cleanEndpoint) ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(currentUser && isOwnApi(cleanEndpoint) ? { 'x-saare-user': currentUser } : {}),
    ...(currentTenant && isOwnApi(cleanEndpoint) ? { 'x-saare-tenant': currentTenant } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(cleanEndpoint, {
      ...options,
      headers: defaultHeaders
    });

    // 4. Gestión global de sesión expirada o no autorizada
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('saare_auth_token');
      localStorage.removeItem('saare_session_user');
      localStorage.removeItem('saare_token');
      localStorage.removeItem('saare_user_email');
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con SAARE Control Plane:', error);
    throw new Error(`Error de conexión con el Control Plane: ${error.message}`);
  }
}

/**
 * Helpers especializados para simplificar llamadas desde la UI
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
  
  // Helper especializado para recuperar el Manifiesto SRP v8.1
  getSrpManifest: () => saareFetch('/manifest/srp', { method: 'GET' }),
  
  // Helper especializado para obtener KPIs de auditoría
  getKpis: (startDate, endDate) => {
    const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
    return saareFetch(`/metrics/kpis${query}`, { method: 'GET' });
  }
};