const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal ? 'http://localhost:3001/api/v1' : 'https://api.saare.es/api/v1';

export async function saareFetch(endpoint, options = {}) {
  let cleanEndpoint = endpoint;
  
  // Si viene una URL absoluta (https://...), se usa directamente
  if (!endpoint.startsWith('http')) {
    // Eliminar /api/v1 si viene repetido al inicio del endpoint
    cleanEndpoint = cleanEndpoint.replace(/^\/?api\/v1/, '');
    if (!cleanEndpoint.startsWith('/')) cleanEndpoint = `/${cleanEndpoint}`;
    cleanEndpoint = `${API_BASE_URL}${cleanEndpoint}`;
  }

  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token')) 
    : null;

  const currentUser = typeof window !== 'undefined'
    ? (localStorage.getItem('saare_user_email') || 'el.abuelo.del.punk@gmail.com')
    : 'legal@saare.es';

  const currentTenant = typeof window !== 'undefined'
    ? (localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE')
    : 'ENTERPRISE';

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

    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('saare_token');
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con SAARE Control Plane:', error);
    throw error;
  }
}