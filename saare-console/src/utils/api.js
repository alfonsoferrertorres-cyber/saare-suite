// saare-console/src/utils/api.js

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

// Raíz base del API Gateway
export const API_HOST = isLocal ? 'http://localhost:8787' : 'https://api.saare.es';
export const API_BASE_URL = `${API_HOST}/api/v1`;

/**
 * Cliente HTTP universal para el Control Plane de S.A.A.R.E. (SGP 1.0 / v8.1 SRP)
 * @param {string} endpoint - Ruta del endpoint o URL absoluta
 * @param {RequestInit} options - Opciones nativas de fetch
 * @returns {Promise<Response>}
 */
export async function saareFetch(endpoint, options = {}) {
  let cleanEndpoint = endpoint;
  
  // 1. Normalización de URL y versionado
  if (!cleanEndpoint.startsWith('http')) {
    if (!cleanEndpoint.startsWith('/')) cleanEndpoint = `/${cleanEndpoint}`;
    
    // Antepone /api/v1 por defecto si no especifica versión (/api/v1 o /api/v7)
    if (!cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = `/api/v1${cleanEndpoint}`;
    }
    
    cleanEndpoint = `${API_HOST}${cleanEndpoint}`;
  }

  // 2. Extracción de credenciales y contexto desde la sesión del navegador
  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token')) 
    : null;

  const currentUser = typeof window !== 'undefined'
    ? (localStorage.getItem('saare_user_email') || 'ciso@empresa.com')
    : 'legal@saare.es';

  const currentTenant = typeof window !== 'undefined'
    ? (localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE')
    : 'ENTERPRISE';

  // 3. Ensamblado de cabeceras universales de seguridad e identidad multi-tenant
  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'x-saare-user': currentUser,
    'x-saare-tenant': currentTenant,
    ...(options.headers || {})
  };

  try {
    const response = await fetch(cleanEndpoint, {
      ...options,
      headers: defaultHeaders
    });

    // 4. Gestión global de sesión expirada o no autorizada
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('saare_token');
      localStorage.removeItem('saare_user_email');
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con SAARE Control Plane:', error);
    throw error;
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