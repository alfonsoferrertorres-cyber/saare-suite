const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal ? 'http://localhost:3001/api/v1' : 'https://api.saare.es/api/v1';

export async function saareFetch(endpoint, options = {}) {
  let targetUrl = endpoint;

  if (!endpoint.startsWith('http')) {
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Remueve el prefijo /api/v1 unicamente si es un segmento de ruta exacto
    cleanEndpoint = cleanEndpoint.replace(/^\/api\/v1(?=\/|$)/, '');

    // Garantiza que el endpoint relativo tenga siempre una barra inicial
    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = `/${cleanEndpoint}`;
    }

    targetUrl = `${API_BASE_URL}${cleanEndpoint}`;
  }

  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token')) 
    : null;

  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers: defaultHeaders
    });

    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('saare_token');
      localStorage.removeItem('saare_auth_token');
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con el plano de control SAARE:', error);
    throw new Error('Error de conexión con el plano de control: ' + error.message);
  }
}