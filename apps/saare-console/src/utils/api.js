// saare-console/src/utils/api.js — Puente de compatibilidad API y constantes (SGP 1.0 Producción)
import { SAARE_CONFIG } from '../config/saareState';
import apiService from '../services/apiService';

// Host dinámico resuelto desde la configuración centralizada (sin dominios fijados)
export const API_HOST = SAARE_CONFIG?.CONTROL_PLANE_URL || "https://api.saare.es";

export const api = {
  getCurrentUser: () => {
    return {
      email: localStorage.getItem('saare_user_email') || SAARE_CONFIG?.DEFAULT_USER || 'auditor@saare.es',
      tenantId: localStorage.getItem('saare_tenant_domain') || SAARE_CONFIG?.DEFAULT_TENANT || 'DEMO_ENTERPRISE',
      role: localStorage.getItem('saare_user_role') || SAARE_CONFIG?.DEFAULT_ROLE || 'AUDITOR_GUEST'
    };
  }
};

export const saareFetch = async (endpoint, options = {}) => {
  try {
    // Si apiService tiene un método request o delegamos directamente
    const token = localStorage.getItem('saare_auth_token') || localStorage.getItem('saare_token') || '';
    const tenant = localStorage.getItem('saare_tenant_domain') || 'DEMO_ENTERPRISE';
    const user = localStorage.getItem('saare_user_email') || 'auditor@saare.es';
    const role = localStorage.getItem('saare_user_role') || 'AUDITOR_GUEST';

    const cleanBase = API_HOST.trim().replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${cleanBase}${cleanEndpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'x-saare-tenant': options.overrideTenant || tenant,
      'x-saare-user': options.overrideUser || user,
      'x-saare-role': options.overrideRole || role,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    return response;
  } catch (e) {
    console.warn("[SAARE API BRIDGE WARNING]:", e);
    return { ok: false, error: e.message };
  }
};

export default api;