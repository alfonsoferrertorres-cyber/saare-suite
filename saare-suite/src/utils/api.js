/**
 * Configuración centralizada de red para S.A.A.R.E.
 * Alineado con App.jsx y Login.jsx
 */

// 1. Determinación dinámica de la URL base
const ENV_URL = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = 
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8787'
    : (ENV_URL || 'https://api.saare.es');

/**
 * Wrapper de fetch para ejecutar peticiones hacia el Control Plane de S.A.A.R.E.
 * Injecta automáticamente credenciales de sesión, cabezeras por defecto y normaliza endpoints.
 */
export async function saareFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;
  
  // Recuperar token guardado por Login.jsx
  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token'))
    : null;

  // Cabeceras predeterminadas con soporte para autenticación Bearer
  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders
    });

    return response;
  } catch (error) {
    console.error('Error de conexión con el Control Plane de S.A.A.R.E.:', error);
    throw new Error(`Error de conexión con el Control Plane: ${error.message}`);
  }
}