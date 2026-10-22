import { API_HOST } from './api';

const API_BASE = (import.meta.env.VITE_CONTROL_PLANE_URL || API_HOST || '').replace(/\/$/, '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function demoResponse(path, payload = {}) {
  if (path.includes('/resilience/check')) {
    const drift = Number(payload.delta ?? 0.004);
    const pass = Math.abs(drift) < 0.01;
    return {
      ok: true,
      source: 'DEMO_RAM',
      threshold: '<0.010%',
      delta: drift,
      deterministic: true,
      status: pass ? 'INVARIANTS_OK' : 'FORENSIC_ISOLATION',
      invariants: Array.from({ length: 8 }, (_, i) => ({
        id: `INV-${String(i + 1).padStart(2, '0')}: ${
          ['FAIL_CLOSED', 'PII_RAM_MASK', 'MERKLE_TREE', 'RFC3161_TSA', 'ED25519_SIG', 'ZERO_DISK', 'PROMPT_SHIELD', 'LATENCY_P99'][i]
        }`,
        state: pass ? 'PASS' : i === 1 ? 'FAIL' : 'PASS'
      }))
    };
  }

  if (path.includes('/intercept') || path.includes('/enforce')) {
    const action = payload.action || 'SEND_PAYMENT';
    const highImpact = ['SEND_PAYMENT', 'DELETE_RECORDS', 'EXPORT_CUSTOMERS'].includes(action);
    const piiFound = /\b\d{8}[A-HJ-NP-TV-Z]\b|ES\d{2}[0-9A-Z]{20,}/i.test(payload.prompt || '');
    
    let verdict = payload.forceReview ? 'REVIEW' : (highImpact || piiFound) ? 'DENY' : 'ALLOW';
    
    return {
      ok: true,
      source: 'DEMO_RAM',
      verdict,
      policy: payload.policy || 'FIN-PAYMENT-042:v17',
      traceId: `VRD-2026-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      reasons: verdict === 'DENY' 
        ? [piiFound ? 'PII_DETECTED_AND_SANANITIZED' : 'HIGH_IMPACT_ACTION', 'FAIL_CLOSED_POLICY'] 
        : verdict === 'REVIEW' 
        ? ['HUMAN_REVIEW_REQUIRED'] 
        : ['POLICY_MATCH_CLEAN'],
      sanitized: piiFound,
      piiDetected: piiFound,
      latencyMs: 1.12
    };
  }

  if (path.includes('/verify') || path.includes('/evidence')) {
    const rawHash = decodeURIComponent(path.split('/').pop() || '');
    return {
      ok: true,
      source: 'DEMO_RAM',
      verified: true,
      vrdId: rawHash.startsWith('VRD-') ? rawHash : `VRD-2026-${rawHash.substring(0, 8).toUpperCase()}`,
      algorithm: 'Ed25519 / SHA-256',
      spec: 'SGP 1.0 (RFC 3161)',
      timestamp: new Date().toISOString(),
      merkleRoot: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      status: 'INMUTABLE_VERIFIED'
    };
  }

  return { ok: true, source: 'DEMO_RAM', payload };
}

export async function callControlPlane(path, payload = {}, options = {}) {
  if (!API_BASE || API_BASE.includes('localhost:8787')) {
    await sleep(200);
    return demoResponse(path, payload);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 3500);
  
  try {
    const method = options.method || 'POST';
    const token = localStorage.getItem('saare_auth_token') || localStorage.getItem('saare_token');
    
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 
        'Content-Type': 'application/json; charset=utf-8', 
        'Accept': 'application/json',
        'x-saare-spec': 'SGP-1.0',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}) 
      },
      body: method === 'GET' ? undefined : JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`Control Plane HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return { ...demoResponse(path, payload), degraded: true, error: String(error.message || error) };
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