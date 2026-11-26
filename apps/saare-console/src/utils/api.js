// saare-console/src/utils/api.js
import { SAARE_CONFIG } from '../config/saareState';

const rawHost =
  SAARE_CONFIG?.CONTROL_PLANE_URL ||
  SAARE_CONFIG?.API_BASE_URL ||
  'https://api.saare.es';

export const API_HOST = String(rawHost)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/i, '')
  .replace(/\/api$/i, '')
  .replace(/\/v1$/i, '');

const TOKEN_KEYS = ['saare_auth_token', 'saare_token'];
const TENANT_KEYS = ['saare_tenant_domain', 'saare_tenant'];
const EMAIL_KEYS = ['saare_user_email'];
const ROLE_KEYS = ['saare_user_role'];

const readStorageValue = (keys = []) => {
  if (typeof window === 'undefined') return '';
  for (const key of keys) {
    try {
      const fromSession = window.sessionStorage?.getItem(key);
      if (fromSession) return fromSession;
      const fromLocal = window.localStorage?.getItem(key);
      if (fromLocal) return fromLocal;
    } catch {
      // Ignorar restricciones de almacenamiento
    }
  }
  return '';
};

const writeStorageValue = (keys = [], value = '') => {
  if (typeof window === 'undefined') return;
  const cleanVal = String(value || '').trim();
  for (const key of keys) {
    try {
      if (cleanVal) {
        window.sessionStorage?.setItem(key, cleanVal);
        window.localStorage?.setItem(key, cleanVal);
      } else {
        window.sessionStorage?.removeItem(key);
        window.localStorage?.removeItem(key);
      }
    } catch {
      // Ignorar restricciones de almacenamiento
    }
  }
};

const buildUrl = (endpoint = '') => {
  const cleanBase = String(API_HOST || 'https://api.saare.es')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/i, '')
    .replace(/\/api$/i, '')
    .replace(/\/v1$/i, '');
  const cleanEndpoint = String(endpoint || '').startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
};

const parseResponseBody = async (response) => {
  if (!response || typeof response.text !== 'function') return {};
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
};

export const saareFetch = async (endpoint, options = {}) => {
  try {
    const token = readStorageValue(TOKEN_KEYS).replace(/^Bearer\s+/i, '').trim();
    const currentUser = api.getCurrentUser();

    const tenant = String(options.overrideTenant ?? currentUser.tenantId ?? '').trim();
    const user = String(options.overrideUser ?? currentUser.email ?? '').trim();
    const role = String(options.overrideRole ?? currentUser.role ?? '').trim();

    const url = buildUrl(endpoint);

    const headers = {
      'Content-Type': 'application/json',
      ...(tenant ? { 'x-saare-tenant': tenant } : {}),
      ...(user ? { 'x-saare-user': user } : {}),
      ...(role ? { 'x-saare-role': role } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const { overrideTenant, overrideUser, overrideRole, ...fetchOptions } = options;

    return await fetch(url, {
      ...fetchOptions,
      headers
    });
  } catch (e) {
    console.warn('[SAARE API BRIDGE WARNING]:', e);
    return {
      ok: false,
      status: 0,
      error: e?.message || 'Error de red en saareFetch',
      text: async () => JSON.stringify({ message: e?.message || 'Error de red' })
    };
  }
};

export const saareFetchJson = async (endpoint, options = {}) => {
  const response = await saareFetch(endpoint, options);
  const data = await parseResponseBody(response);

  if (!response.ok) {
    const status = response.status || 500;
    const message =
      data?.message ||
      data?.error ||
      `Error HTTP ${status} en ${endpoint}`;
    const err = new Error(message);
    err.status = status;
    err.data = data;
    throw err;
  }

  return data;
};

export const api = {
  getCurrentUser: () => ({
    email: readStorageValue(EMAIL_KEYS) || SAARE_CONFIG?.DEFAULT_USER || '',
    tenantId: readStorageValue(TENANT_KEYS) || SAARE_CONFIG?.DEFAULT_TENANT || '',
    role: readStorageValue(ROLE_KEYS) || SAARE_CONFIG?.DEFAULT_ROLE || ''
  }),

  getToken: () => readStorageValue(TOKEN_KEYS).replace(/^Bearer\s+/i, '').trim(),

  clearSession: () => {
    writeStorageValue(TOKEN_KEYS, '');
    writeStorageValue(TENANT_KEYS, '');
    writeStorageValue(EMAIL_KEYS, '');
    writeStorageValue(ROLE_KEYS, '');
  },

  login: async (email, password, tenantId = '') => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanTenant = String(tenantId || '').trim();

    const headers = {
      'Content-Type': 'application/json',
      ...(cleanTenant ? { 'x-saare-tenant': cleanTenant } : {})
    };

    const response = await fetch(buildUrl('/api/v1/auth/login'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: cleanEmail,
        password,
        ...(cleanTenant ? { tenantId: cleanTenant, tenant: cleanTenant } : {})
      })
    });

    const data = await parseResponseBody(response);
    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Credenciales inválidas o no autorizadas (HTTP ${response.status}).`;
      const err = new Error(message);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    const token = String(data?.token || data?.access_token || '')
      .replace(/^Bearer\s+/i, '')
      .trim();
    const resolvedTenant = String(data?.user?.tenantId || data?.tenantId || cleanTenant).trim();
    const resolvedEmail = String(data?.user?.email || cleanEmail).trim();
    const resolvedRole = String(data?.user?.role || '').trim();

    if (token) writeStorageValue(TOKEN_KEYS, token);
    if (resolvedTenant) writeStorageValue(TENANT_KEYS, resolvedTenant);
    if (resolvedEmail) writeStorageValue(EMAIL_KEYS, resolvedEmail);
    if (resolvedRole) writeStorageValue(ROLE_KEYS, resolvedRole);

    return {
      ...data,
      token,
      user: {
        ...(data?.user || {}),
        email: resolvedEmail,
        tenantId: resolvedTenant,
        ...(resolvedRole ? { role: resolvedRole } : {})
      }
    };
  },

  getTraces: (limit = 50) => saareFetchJson(`/api/v1/traces?limit=${encodeURIComponent(limit)}`),

  getTenantMetrics: () => saareFetchJson('/api/v1/metrics/tenants'),

  requestJson: saareFetchJson
};

export default api;