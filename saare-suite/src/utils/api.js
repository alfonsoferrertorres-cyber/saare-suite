/**
 * Configuración centralizada de red para S.A.A.R.E.
 */
const ENV_URL = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = 
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8787'
    : (ENV_URL || 'https://api.saare.es');

export async function saareFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders
    });
    return response;
  } catch (error) {
    console.error('Error de conexión con el Control Plane:', error);
    throw new Error('Error de conexión con el Control Plane: ' + error.message);
  }
}