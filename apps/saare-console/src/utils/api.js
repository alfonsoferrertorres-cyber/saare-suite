// saare-console/src/utils/api.js — Puente de compatibilidad API y constantes (SGP 1.0 Producción)
import { SAARE_CONFIG } from '../config/saareState';
import apiService from '../services/apiService';

// Host dinámico resuelto desde la configuración centralizada (sin dominios fijados)
export const API_HOST = SAARE_CONFIG?.CONTROL_PLANE_URL || "https://api.saare.es";

export const api = {
  getCurrentUser: () => {
    return {
      email: localStorage.getItem('saare_user_email') || SAARE_CONFIG?.DEFAULT_USER || '',
      tenantId: localStorage.getItem('saare_tenant_domain') || SAARE_CONFIG?.DEFAULT_TENANT || 'ORGANISMO_DEMO_01',
      role: localStorage.getItem('saare_user_role') || SAARE_CONFIG?.DEFAULT_ROLE || 'CISO_ADMIN'
    };
  }
};

export const saareFetch = async (endpoint, options = {}) => {
  try {
    // Delegación segura en el servicio centralizado apiService
    if (typeof apiService.request === 'function') {
      return await apiService.request(endpoint, options);
    }
    // Fallback de compatibilidad directa si se invoca como endpoint REST
    const response = await fetch(`${API_HOST}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, options);
    return response;
  } catch (e) {
    console.warn("[SAARE API BRIDGE WARNING]:", e);
    return { ok: false, error: e.message };
  }
};

export default api;