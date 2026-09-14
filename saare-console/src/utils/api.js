/**
 * Configuración centralizada de red para S.A.A.R.E. (SGP 1.0)
 * Detecta automáticamente el entorno (Sandbox Local vs Producción Edge)
 * e inyecta la versión de la API (/api/v1).
 */
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal ? 'http://localhost:3001/api/v1' : 'https://api.saare.es/api/v1';

/**
 * Helper optimizado para llamadas fetch hacia la API de S.A.A.R.E.
 * Inyecta automáticamente el token de la sesión guardado en localStorage.
 */
export async function saareFetch(endpoint, options = {}) {
  let targetUrl = endpoint;

  if (!endpoint.startsWith('http')) {
    // Garantiza que la barra inicial / exista
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Evita duplicar /api/v1 si el llamador ya incluyó el prefijo
    if (cleanEndpoint.startsWith('/api/v1')) {
      cleanEndpoint = cleanEndpoint.replace('/api/v1', '');
    }

    targetUrl = `${API_BASE_URL}${cleanEndpoint}`;
  }

  // Recuperar el token de la sesión activa
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

    // Limpieza automática si el token expira en producción
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