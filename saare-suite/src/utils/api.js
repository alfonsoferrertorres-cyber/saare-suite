export const API_BASE_URL = 'https://api.saare.es';

export async function saareFetch(endpoint, options = {}) {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Asegura el prefijo /api/v1 solo si no viene especificado en la llamada
  if (!cleanEndpoint.startsWith('/api/v1') && !cleanEndpoint.startsWith('/v1') && !cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = `/api/v1${cleanEndpoint}`;
  }

  const url = `${API_BASE_URL}${cleanEndpoint}`;

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

    if (response.status === 403) {
      console.warn(`[SAARE RBAC] Intento de acceso a '${cleanEndpoint}' denegado para el rol '${userRole}'.`);
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con el Control Plane de S.A.A.R.E.:', error);
    throw new Error(`Error de conexión con el Control Plane: ${error.message}`);
  }
}

/**
 * Creación de sesión de checkout para pasarela de pago (Stripe)
 */
export async function saareCheckout(priceId, mode = 'subscription') {
  try {
    // Apunta al endpoint real del worker: /v1/checkout
    const response = await saareFetch('/v1/checkout', {
      method: 'POST',
      body: JSON.stringify({ price: priceId, mode }),
    });

    if (!response.ok) {
      throw new Error(`Error al iniciar la transacción: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url; // Redirección a la pasarela de pago Stripe
    } else {
      throw new Error('No se recibió la URL de la pasarela de pago.');
    }
  } catch (err) {
    console.error('[SAARE BILLING]', err);
    alert('No se pudo iniciar el proceso de cobro. Por favor, inténtelo de nuevo.');
  }
}