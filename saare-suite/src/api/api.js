// saare-suite/src/api/api.js — Cliente API Unificado S.A.A.R.E. (SGP 1.0)

// 1. Resolver la URL base priorizando puerto 3001 en local y servidor Cloudflare en producción
const rawEnvUrl = typeof import.meta !== 'undefined' && import.meta.env
  ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CONTROL_PLANE_URL || import.meta.env.VITE_SAARE_API_HOST)
  : null;

// Sanear la URL eliminando sufijos /api/v1 duplicados y barras finales
const cleanEnvUrl = rawEnvUrl
  ? rawEnvUrl.replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '')
  : null;

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

export const API_HOST = isLocal
  ? 'http://127.0.0.1:3001'
  : (cleanEnvUrl || 'https://api.saare.es');

export const API_BASE_URL = `${API_HOST}/api/v1`;

/**
 * Cliente HTTP unificado para el protocolo SGP 1.0 (MS3V S.A.A.R.E. SL)
 */
async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    'x-saare-spec': 'SGP-1.0'
  };

  const token = localStorage.getItem('saare_auth_token') || localStorage.getItem('saare_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  const fetchOptions = {
    ...options,
    method,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Prevenir envío de 'body' en peticiones GET o HEAD
  if (method === 'GET' || method === 'HEAD') {
    delete fetchOptions.body;
  }

  try {
    const response = await fetch(`${API_HOST}${formattedEndpoint}`, fetchOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || `Error HTTP ${response.status}: Rechazado por Control Plane.`);
    }

    return data;
  } catch (err) {
    console.warn(`[SAARE API Fallback] Conexión simulada para ${formattedEndpoint}:`, err.message);
    return { 
      success: true, 
      simulated: true, 
      message: "Modo Local / Demo activo",
      error: err.message
    };
  }
}

// === API ENDPOINTS PLATAFORMA S.A.A.R.E. === //

export const landingApi = {
  // Autenticación & Acceso Gate
  login: (email, password) =>
    apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Registro de PoC / Kit Digital / Kit Consulting
  registerTrial: (email, company, planType) =>
    apiFetch('/api/v1/trial', {
      method: 'POST',
      headers: { 'x-saare-tenant': (company || 'ENTERPRISE').toUpperCase() },
      body: JSON.stringify({ email, company, planType }),
    }),

  // Solicitud de Evaluación de Arquitectura
  submitEvaluation: (formData) =>
    apiFetch('/api/v1/evaluation', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  // Intercepción Ex-Ante L7
  checkEnforcement: (payload) =>
    apiFetch('/api/v1/intercept', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Verificación de Evidencia eIDAS / RFC 3161 / ISO 27037
  verifyEvidence: (hashOrProof) =>
    apiFetch(`/api/v1/evidence/verify/${encodeURIComponent(hashOrProof)}`, {
      method: 'GET',
    }),

  // Gestión de Contraseñas y OTP
  requestPasswordReset: (email) =>
    apiFetch('/api/v1/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email, otp) =>
    apiFetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  // Telemetría & Estado del Nodo
  getNodeStatus: () =>
    apiFetch('/api/v1/health', { method: 'GET' }),

  getPublicSummary: () =>
    apiFetch('/api/v1/metrics/kpis', { method: 'GET' }),
};

export default landingApi;