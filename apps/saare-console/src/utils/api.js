// saare-console/src/utils/api.js
import { SAARE_CONFIG } from '../config/saareState';

export const API_HOST = SAARE_CONFIG?.CONTROL_PLANE_URL || 'https://api.saare.es';

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

export const api = {
  getCurrentUser: () => {
    return {
      email: readStorageValue(['saare_user_email']) || SAARE_CONFIG?.DEFAULT_USER || '',
      tenantId:
        readStorageValue(['saare_tenant_domain', 'saare_tenant']) ||
        SAARE_CONFIG?.DEFAULT_TENANT ||
        '',
      role: readStorageValue(['saare_user_role']) || SAARE_CONFIG?.DEFAULT_ROLE || ''
    };
  }
};

export const saareFetch = async (endpoint, options = {}) => {
  try {
    const token = readStorageValue(['saare_auth_token', 'saare_token']);
    const currentUser = api.getCurrentUser();

    const tenant = options.overrideTenant ?? currentUser.tenantId;
    const user = options.overrideUser ?? currentUser.email;
    const role = options.overrideRole ?? currentUser.role;

    const cleanBase = String(API_HOST || '').trim().replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${cleanBase}${cleanEndpoint}`;

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
    return { ok: false, error: e.message };
  }
};

export default api;