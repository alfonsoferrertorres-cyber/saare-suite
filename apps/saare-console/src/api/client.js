// apps/saare-console/src/api/client.js
import { SAARE_CONFIG } from '../config/saareState';

export async function saareFetch(endpoint, options = {}) {
  let session = {};
  try {
    session = JSON.parse(localStorage.getItem('saare_session') || '{}');
  } catch {
    session = {};
  }

  const token = session.token || localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token') || '';
  const tenant = session.tenantId || localStorage.getItem('saare_tenant_domain') || SAARE_CONFIG?.DEFAULT_TENANT || '';
  const role = session.role || localStorage.getItem('saare_user_role') || SAARE_CONFIG?.DEFAULT_ROLE || '';

  const baseUrl = String(SAARE_CONFIG?.CONTROL_PLANE_URL || SAARE_CONFIG?.API_BASE_URL || 'https://api.saare.es')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/i, '')
    .replace(/\/api$/i, '')
    .replace(/\/v1$/i, '');

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenant ? { 'x-saare-tenant': tenant } : {}),
    ...(role ? { 'x-saare-role': role } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    console.warn('[SAARE Security] Sesión o tenant no autorizados');
  }

  return response.json();
}