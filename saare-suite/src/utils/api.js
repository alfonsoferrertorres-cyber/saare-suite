/**
 * Configuración centralizada de red para S.A.A.R.E. (saare-suite)
 */
export const API_BASE_URL = 
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8787'
    : 'https://api.saare.es';

/**
 * Helper optimizado para llamadas fetch hacia la API de S.A.A.R.E.
 */
export async function saareFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders
    });
    return response;
  } catch (error) {
    console.error('Error de conexión con el plano de control:', error);
    throw new Error('Error de conexión con el plano de control: ' + error.message);
  }
}