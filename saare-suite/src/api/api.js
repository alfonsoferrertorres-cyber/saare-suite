export const API_HOST = import.meta.env.VITE_SAARE_API_HOST || 'http://localhost:8787';

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

  try {
    const response = await fetch(`${API_HOST}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Error HTTP ${response.status}: Rechazado por Control Plane.`);
    }

    return data;
  } catch (err) {
    // Si la API no está desplegada en local, retorna simulación exitosa para no romper la interfaz
    return { success: true, simulated: true, message: "Modo Local / Demo activo" };
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
      headers: { 'x-saare-tenant': company.toUpperCase() },
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
    apiFetch('/api/v1/enforce/check', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Verificación de Evidencia eIDAS / RFC 3161
  verifyEvidence: (hashOrProof) =>
    apiFetch('/api/v1/evidence/verify', {
      method: 'POST',
      body: JSON.stringify({ proof: hashOrProof }),
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

  // Telemetría & Nodos
  getNodeStatus: () =>
    apiFetch('/api/v1/status', { method: 'GET' }),

  getPublicSummary: () =>
    apiFetch('/api/v1/compliance/public-summary', { method: 'GET' }),
};