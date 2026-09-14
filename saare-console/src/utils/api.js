/**
 * Configuración centralizada de red para S.A.A.R.E.
 * Detecta automáticamente si opera en el entorno local (Sandbox / Auditoría) o en Producción.
 */
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocal ? 'http://localhost:3001' : 'https://api.saare.es';

/**
 * Helper optimizado para llamadas fetch hacia la API de S.A.A.R.E.
 */
export async function saareFetch(endpoint, options = {}) {
  const url = `${endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`}`;
  
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