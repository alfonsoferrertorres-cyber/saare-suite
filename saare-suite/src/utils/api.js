export const API_BASE_URL = 'https://api.saare.es';

export async function saareFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // Lectura de credenciales y contexto del usuario activo
  const session = JSON.parse(localStorage.getItem('saare_session_user') || '{}');
  const token = session.apiKey || localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token') || '';
  const userRole = session.role || localStorage.getItem('saare_user_role') || 'OPERATIONAL_AGENT_USER';
  const tenantName = session.tenantName || session.tenant || localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';

  const defaultHeaders = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(tenantName ? { 'x-saare-tenant': tenantName } : {}),
    ...(session.email ? { 'x-saare-user': session.email } : {}),
    'x-saare-role': userRole,
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers: defaultHeaders });

    // Manejo de restricciones de rango (RBAC - 403 Forbidden)
    if (response.status === 403) {
      console.warn(`[SAARE RBAC] Intento de acceso a '${cleanEndpoint}' denegado para el rol '${userRole}'.`);
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con el Control Plane de S.A.A.R.E.:', error);
    throw new Error(`Error de conexión con el Control Plane: ${error.message}`);
  }
}