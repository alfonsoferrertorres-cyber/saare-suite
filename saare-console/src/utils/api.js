// saare-console/src/utils/api.js

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Raíz base del API Gateway
export const API_HOST = isLocal ? 'http://localhost:8787' : 'https://api.saare.es';
export const API_BASE_URL = `${API_HOST}/api/v1`;

export async function saareFetch(endpoint, options = {}) {
  let cleanEndpoint = endpoint;
  
  // 1. Si viene una URL absoluta (http://... o https://...), se respeta
  if (!cleanEndpoint.startsWith('http')) {
    if (!cleanEndpoint.startsWith('/')) cleanEndpoint = `/${cleanEndpoint}`;
    
    // Si el endpoint no especifica versión (/api/v1 o /api/v7), por defecto antepone /api/v1
    if (!cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = `/api/v1${cleanEndpoint}`;
    }
    
    cleanEndpoint = `${API_HOST}${cleanEndpoint}`;
  }

  // 2. Extracción de credenciales de sesión local
  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token')) 
    : null;

  const currentUser = typeof window !== 'undefined'
    ? (localStorage.getItem('saare_user_email') || 'ciso@empresa.com')
    : 'legal@saare.es';

  const currentTenant = typeof window !== 'undefined'
    ? (localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE')
    : 'ENTERPRISE';

  // 3. Ensamblado de cabeceras universales
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

    // Control de sesión expirada
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('saare_token');
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con SAARE Control Plane:', error);
    throw error;
  }
}