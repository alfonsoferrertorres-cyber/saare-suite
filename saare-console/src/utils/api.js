// saare-console/src/utils/api.js

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

// Raíz base del API Gateway
export const API_HOST = isLocal ? 'http://localhost:8787' : 'https://api.saare.es';[cite: 32]
export const API_BASE_URL = `${API_HOST}/api/v1`;[cite: 32]

/**
 * Cliente HTTP universal para el Control Plane de S.A.A.R.E. (SGP 1.0 / v8.1 SRP)
 * @param {string} endpoint - Ruta del endpoint o URL absoluta
 * @param {RequestInit} options - Opciones nativas de fetch
 * @returns {Promise<Response>}
 */
export async function saareFetch(endpoint, options = {}) {[cite: 32]
  let cleanEndpoint = endpoint;[cite: 32]
  
  // 1. Normalización de URL y versionado (Prevención de duplicados de prefijo)
  if (!cleanEndpoint.startsWith('http')) {[cite: 32]
    if (!cleanEndpoint.startsWith('/')) cleanEndpoint = `/${cleanEndpoint}`;[cite: 32]
    
    // Antepone /api/v1 solo si no especifica una versión de API explícita (/api/...)
    if (!cleanEndpoint.startsWith('/api/')) {[cite: 32]
      cleanEndpoint = `/api/v1${cleanEndpoint}`;[cite: 32]
    }
    
    cleanEndpoint = `${API_HOST}${cleanEndpoint}`;[cite: 32]
  }

  // 2. Extracción de credenciales y contexto desde la sesión unificada
  let token = null;
  let currentUser = 'legal@saare.es';
  let currentTenant = 'ENTERPRISE';

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('saare_auth_token') || localStorage.getItem('saare_token');
    
    try {
      const storedUser = localStorage.getItem('saare_session_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        currentUser = parsed.email || localStorage.getItem('saare_user_email') || currentUser;
        currentTenant = parsed.tenantName || parsed.company || localStorage.getItem('saare_tenant_domain') || currentTenant;
      } else {
        currentUser = localStorage.getItem('saare_user_email') || currentUser;
        currentTenant = localStorage.getItem('saare_tenant_domain') || currentTenant;
      }
    } catch (e) {
      currentUser = localStorage.getItem('saare_user_email') || currentUser;
      currentTenant = localStorage.getItem('saare_tenant_domain') || currentTenant;
    }
  }

  // 3. Ensamblado de cabeceras universales de seguridad e identidad multi-tenant
  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',[cite: 32]
    'Accept': 'application/json',[cite: 32]
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),[cite: 32]
    'x-saare-user': currentUser,
    'x-saare-tenant': currentTenant,
    ...(options.headers || {})[cite: 32]
  };

  try {
    const response = await fetch(cleanEndpoint, {[cite: 32]
      ...options,[cite: 32]
      headers: defaultHeaders[cite: 32]
    });[cite: 32]

    // 4. Gestión global de sesión expirada o no autorizada
    if (response.status === 401 && typeof window !== 'undefined') {[cite: 32]
      localStorage.removeItem('saare_auth_token');
      localStorage.removeItem('saare_session_user');
      localStorage.removeItem('saare_token');[cite: 32]
      localStorage.removeItem('saare_user_email');[cite: 32]
    }

    return response;[cite: 32]
  } catch (error) {
    console.error('Error de conexión con SAARE Control Plane:', error);[cite: 32]
    throw error;[cite: 32]
  }
}

/**
 * Helpers especializados para simplificar llamadas desde la UI
 */
export const api = {[cite: 32]
  get: (endpoint, options = {}) => saareFetch(endpoint, { ...options, method: 'GET' }),[cite: 32]
  post: (endpoint, body, options = {}) => saareFetch(endpoint, { [cite: 32]
    ...options, [cite: 32]
    method: 'POST', [cite: 32]
    body: JSON.stringify(body) [cite: 32]
  }),[cite: 32]
  put: (endpoint, body, options = {}) => saareFetch(endpoint, { [cite: 32]
    ...options, [cite: 32]
    method: 'PUT', [cite: 32]
    body: JSON.stringify(body) [cite: 32]
  }),[cite: 32]
  delete: (endpoint, options = {}) => saareFetch(endpoint, { ...options, method: 'DELETE' }),[cite: 32]
  
  // Helper especializado para recuperar el Manifiesto SRP v8.1
  getSrpManifest: () => saareFetch('/manifest/srp', { method: 'GET' }),[cite: 32]
  
  // Helper especializado para obtener KPIs de auditoría
  getKpis: (startDate, endDate) => {[cite: 32]
    const query = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';[cite: 32]
    return saareFetch(`/metrics/kpis${query}`, { method: 'GET' });[cite: 32]
  }
};