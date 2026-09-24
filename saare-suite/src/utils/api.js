/* ==========================================================================
   S.A.A.R.E. SGP 1.0 · API CLIENT & STRIPE CHECKOUT UTILS
   ========================================================================== */

export const API_BASE_URL = 'https://api.saare.es';

/**
 * Mapeador central de peticiones HTTP hacia el Control Plane de S.A.A.R.E.
 */
export async function saareFetch(endpoint, options = {}) {
  // 1. Limpieza inicial del endpoint
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 2. Normalización de prefijos API (evita duplicar /api/v1 o /v1)
  if (!cleanEndpoint.startsWith('/api') && !cleanEndpoint.startsWith('/v1')) {
    cleanEndpoint = `/v1${cleanEndpoint}`;
  }

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // 3. Recuperación de credenciales y contexto desde la sesión o almacenamiento local
  let session = {};
  try {
    session = JSON.parse(localStorage.getItem('saare_session_user') || '{}');
  } catch {
    session = {};
  }

  const token = session.apiKey || localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token') || '';
  const userRole = session.role || localStorage.getItem('saare_user_role') || 'OPERATIONAL_AGENT_USER';
  const tenantName = session.tenantName || session.tenant || localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE';

  // 4. Preparación del payload si se pasa un objeto
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  // 5. Configuración de cabeceras por defecto
  const defaultHeaders = {
    'Accept': 'application/json',
    ...(body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'x-saare-tenant': tenantName,
    'x-saare-role': userRole,
    ...(session.email ? { 'x-saare-user': session.email } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      body,
      headers: defaultHeaders,
    });

    if (response.status === 403) {
      console.warn(`[SAARE RBAC] Acceso denegado a '${cleanEndpoint}' para el rol '${userRole}'.`);
    }

    return response;
  } catch (error) {
    console.error('[SAARE API] Error de conexión con el Control Plane:', error);
    throw new Error(`Error de conexión con el Control Plane: ${error.message}`);
  }
}

/**
 * Creación de sesión de checkout para pasarela de pago (Stripe)
 * @param {string} priceId - ID del precio en Stripe o identificador del plan
 * @param {string} mode - Modo de cobro: 'subscription' o 'payment'
 */
export async function saareCheckout(priceId, mode = 'subscription') {
  try {
    // Envía la petición a /v1/checkout
    const response = await saareFetch('/v1/checkout', {
      method: 'POST',
      body: { price: priceId, mode },
    });

    if (!response.ok) {
      throw new Error(`Error al iniciar la transacción: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.url) {
      // Redirección directa a la pasarela segura Stripe Checkout
      window.location.href = data.url;
    } else {
      throw new Error('No se recibió la URL de la pasarela de pago.');
    }
  } catch (err) {
    console.error('[SAARE BILLING]', err);
    alert('No se pudo iniciar el proceso de cobro. Por favor, inténtelo de nuevo.');
  }
}