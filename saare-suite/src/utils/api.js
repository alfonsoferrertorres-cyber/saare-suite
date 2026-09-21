/**
 * Configuración centralizada de red para S.A.A.R.E.
 * Alineado con App.jsx, Login.jsx y el Control Plane (worker.js).
 */

const ENV_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL =
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8787'
    : (ENV_URL || 'https://api.saare.es');

function readSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('saare_session_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isOwnApi(url) {
  return url.startsWith(API_BASE_URL) || url.startsWith('https://api.saare.es');
}

export async function saareFetch(endpoint, options = {}) {
  const isAbsolute = typeof endpoint === 'string' && endpoint.startsWith('http');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = isAbsolute ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

  const session = readSession();
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token'))
    : null;

  const sessionTenant = session?.tenantName || session?.tenant || null;

  const defaultHeaders = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    ...(token && isOwnApi(url) ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(sessionTenant && isOwnApi(url) ? { 'x-saare-tenant': sessionTenant } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers: defaultHeaders });
    return response;
  } catch (error) {
    console.error('Error de conexión con el Control Plane de S.A.A.R.E.:', error);
    throw new Error(`Error de conexión con el Control Plane: ${error.message}`);
  }
}