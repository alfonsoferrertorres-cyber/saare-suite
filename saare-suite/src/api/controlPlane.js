const API_BASE = (import.meta.env.VITE_CONTROL_PLANE_URL || '').replace(/\/$/, '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function demoResponse(path, payload = {}) {
  if (path.includes('/resilience/check')) {
    const drift = Number(payload.delta ?? 0.004);
    const pass = Math.abs(drift) < 0.01;
    return {
      ok: true,
      source: 'DEMO',
      threshold: '<0.01%',
      delta: drift,
      deterministic: true,
      status: pass ? 'INVARIANTS_OK' : 'FORENSIC_ISOLATION',
      invariants: Array.from({ length: 8 }, (_, i) => ({ id: `INV-${String(i + 1).padStart(2, '0')}`, state: pass ? 'PASS' : i === 6 ? 'FAIL' : 'PASS' }))
    };
  }

  if (path.includes('/intercept')) {
    const action = payload.action || 'SEND_PAYMENT';
    const highImpact = ['SEND_PAYMENT', 'DELETE_RECORDS', 'EXPORT_CUSTOMERS'].includes(action);
    const verdict = payload.forceReview ? 'REVIEW' : highImpact ? 'DENY' : 'ALLOW';
    return {
      ok: true,
      source: 'DEMO',
      verdict,
      policy: payload.policy || 'FIN-PAYMENT-042:v17',
      traceId: `VRD-DEMO-${Date.now()}`,
      reasons: verdict === 'DENY' ? ['HIGH_IMPACT_ACTION', 'FAIL_CLOSED_POLICY'] : verdict === 'REVIEW' ? ['HUMAN_REVIEW_REQUIRED'] : ['POLICY_MATCH'],
      sanitized: true,
      piiDetected: /\b\d{8}[A-HJ-NP-TV-Z]\b|ES\d{2}[0-9A-Z]{20,}/i.test(payload.prompt || ''),
    };
  }

  if (path.includes('/verify/')) {
    return { ok: true, source: 'DEMO', verified: true, algorithm: 'Ed25519', timestamp: 'RFC 3161 / DEMO', hash: decodeURIComponent(path.split('/verify/')[1]) };
  }

  return { ok: true, source: 'DEMO', payload };
}

export async function callControlPlane(path, payload = {}, options = {}) {
  if (!API_BASE) {
    await sleep(240);
    return demoResponse(path, payload);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 3500);
  try {
    const method = options.method || 'POST';
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) },
      body: method === 'GET' ? undefined : JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Control Plane ${response.status}`);
    return await response.json();
  } catch (error) {
    // Fallback keeps the console usable in demo mode without pretending a live backend exists.
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
  return callControlPlane(`/verify/${encodeURIComponent(hash)}`, {}, { method: 'GET' });
}
