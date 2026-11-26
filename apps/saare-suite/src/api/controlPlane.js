// saare-suite/src/api/controlPlane.js — Conector Control Plane
import { API_HOST } from './api';

const rawBase = import.meta.env.VITE_CONTROL_PLANE_URL || API_HOST || 'https://api.saare.es';
const API_BASE = rawBase.replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '');

export async function callControlPlane(path, payload = {}, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 5000);

  try {
    const method = (options.method || 'POST').toUpperCase();
    const token = localStorage.getItem('saare_auth_token') || localStorage.getItem('saare_token');
    const formattedPath = path.startsWith('/') ? path : `/${path}`;

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      body: (method === 'GET' || method === 'HEAD') ? undefined : JSON.stringify(payload),
      signal: controller.signal
    };

    const response = await fetch(`${API_BASE}${formattedPath}`, fetchOptions);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `Control Plane HTTP ${response.status}`);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkResilience(payload) {
  return callControlPlane('/api/v1/resilience/check', payload);
}

export async function interceptAction(payload) {
  return callControlPlane('/api/v1/intercept', payload);
}

export async function verifyEvidence(hash) {
  return callControlPlane(`/api/v1/evidence/verify/${encodeURIComponent(hash)}`, {}, { method: 'GET' });
}