// saare-suite/src/api/api.js — Cliente API Unificado S.A.A.R.E. (SGP 1.0)

const rawEnvUrl = typeof import.meta !== 'undefined' && import.meta.env
  ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CONTROL_PLANE_URL || import.meta.env.VITE_SAARE_API_HOST)
  : null;

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

  if (method === 'GET' || method === 'HEAD') {
    delete fetchOptions.body;
  }

  const response = await fetch(`${API_HOST}${formattedEndpoint}`, fetchOptions);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Error HTTP ${response.status}: Rechazado por Control Plane.`);
  }

  return data;
}

export const landingApi = {
  login: (email, password) =>
    apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerTrial: (email, company, planType) =>
    apiFetch('/api/v1/trial', {
      method: 'POST',
      headers: { 'x-saare-tenant': (company || 'ENTERPRISE').toUpperCase() },
      body: JSON.stringify({ email, company, planType }),
    }),

  submitEvaluation: (formData) =>
    apiFetch('/api/v1/evaluation', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  checkEnforcement: (payload) =>
    apiFetch('/api/v1/intercept', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyEvidence: (hashOrProof) =>
    apiFetch(`/api/v1/evidence/verify/${encodeURIComponent(hashOrProof)}`, {
      method: 'GET',
    }),

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

  getNodeStatus: () =>
    apiFetch('/api/v1/health', { method: 'GET' }),

  getPublicSummary: () =>
    apiFetch('/api/v1/metrics/kpis', { method: 'GET' }),
};

export default landingApi;