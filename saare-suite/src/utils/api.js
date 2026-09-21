export const API_BASE_URL = 'https://api.saare.es';

export async function saareFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const token = localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token');
  const session = JSON.parse(localStorage.getItem('saare_session_user') || '{}');

  const defaultHeaders = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(session.tenantName ? { 'x-saare-tenant': session.tenantName } : {}),
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