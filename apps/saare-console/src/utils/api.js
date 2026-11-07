// saare-console/src/utils/api.js — Puente de compatibilidad API y constantes
import apiService from '../services/apiService';

export const API_HOST = "https://api.saare.es";

export const api = {
  getCurrentUser: () => {
    return {
      email: localStorage.getItem('saare_user_email') || 'alfonsoferrertorres@gmail.com',
      tenantId: localStorage.getItem('saare_tenant_domain') || 'ORGANISMO_DEMO_01',
      role: localStorage.getItem('saare_user_role') || 'CISO_ADMIN'
    };
  }
};

export const saareFetch = async (endpoint, options = {}) => {
  try {
    return await apiService.request(endpoint, options);
  } catch (e) {
    console.warn("[SAARE API BRIDGE WARNING]:", e);
    return { ok: false, error: e.message };
  }
};