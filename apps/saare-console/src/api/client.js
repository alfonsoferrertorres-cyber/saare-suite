// apps/saare-console/src/api/client.js
export async function saareFetch(endpoint, options = {}) {
  const session = JSON.parse(localStorage.getItem('saare_session') || '{}');
  const token = session.token || '';
  const tenant = session.tenantId || 'DEMO_ENTERPRISE';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-saare-tenant': tenant,
    'x-saare-role': session.role || 'CISO_ADMIN',
    ...options.headers,
  };

  const response = await fetch(`https://api.saare.es${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Manejo de expiración de token o falta de acceso
    console.warn('[SAARE Security] Sesión o tenant no autorizados');
  }

  return response.json();
}