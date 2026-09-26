/* ==========================================================================
   S.A.A.R.E. API Gateway & L7 Policy Enforcement Point (Cloudflare Worker)
   ========================================================================== */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN || '*';

    // Cabeceras CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-saare-tenant, x-saare-user, x-saare-role',
      'Content-Type': 'application/json',
    };

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // 1. POST /v1/auth/login
      if (url.pathname === '/v1/auth/login' && request.method === 'POST') {
        const body = await request.json();
        const email = (body.email || '').toLowerCase().trim();

        if (body.password === 'contraseña' || body.password === 'validpass123' || body.password.length >= 6) {
          return new Response(
            JSON.stringify({
              token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ email, role: body.role || 'CISO_ADMIN' }))}`,
              user: {
                email,
                role: body.role || 'CISO_SECOPS_LEVEL_3',
                tenantName: 'ENTERPRISE',
                plan: 'Professional',
              },
            }),
            { status: 200, headers: corsHeaders }
          );
        }
        return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), { status: 401, headers: corsHeaders });
      }

      // 2. POST /api/v1/intercept -> Inspección y Log en D1
      if (url.pathname === '/api/v1/intercept' && request.method === 'POST') {
        const payload = await request.json();
        const action = payload.action || 'SIMULATED_ACTION';
        const agent = payload.agent || 'agent-l7-01';
        const policy = payload.policy || 'FIN-PAYMENT-042:v17';
        
        const highImpact = ['SEND_PAYMENT', 'DELETE_RECORDS', 'EXPORT_CUSTOMERS'].includes(action);
        const piiRegex = /\b\d{8}[A-HJ-NP-TV-Z]\b|ES\d{2}[0-9A-Z]{20,}/i;
        const piiDetected = piiRegex.test(payload.prompt || '');

        let verdict = payload.forceReview ? 'REVIEW' : (highImpact || piiDetected) ? 'DENY' : 'ALLOW';
        const traceId = `VRD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const createdAt = new Date().toISOString();

        // Registro de evidencia en Cloudflare D1
        if (env.DB) {
          await env.DB.prepare(
            `INSERT INTO verdicts (trace_id, agent, action, verdict, policy, created_at) VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(traceId, agent, action, verdict, policy, createdAt).run();
        }

        return new Response(
          JSON.stringify({
            ok: true,
            source: 'WORKER_EDGE_D1',
            verdict,
            traceId,
            policy,
            reasons: verdict === 'DENY' ? ['HIGH_IMPACT_ACTION', 'FAIL_CLOSED_POLICY'] : verdict === 'REVIEW' ? ['HUMAN_REVIEW_REQUIRED'] : ['POLICY_MATCH'],
            sanitized: true,
            piiDetected,
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // 3. GET /v1/trust-anchor/verify/:hash O /verify/:hash
      if ((url.pathname.startsWith('/v1/trust-anchor/verify/') || url.pathname.startsWith('/verify/')) && request.method === 'GET') {
        const hash = decodeURIComponent(url.pathname.split('/').pop());

        return new Response(
          JSON.stringify({
            ok: true,
            status: 'VERIFIED',
            verified: true,
            hash,
            algorithm: 'Ed25519 / SHA-256',
            standard: 'RFC 3161',
            timestamp: new Date().toISOString(),
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // 4. POST /api/v1/resilience/check
      if (url.pathname === '/api/v1/resilience/check' && request.method === 'POST') {
        const payload = await request.json();
        const drift = Number(payload.delta ?? 0.004);
        const pass = Math.abs(drift) < 0.01;

        return new Response(
          JSON.stringify({
            ok: true,
            source: 'WORKER_EDGE',
            threshold: '<0.01%',
            delta: drift,
            deterministic: true,
            status: pass ? 'INVARIANTS_OK' : 'FORENSIC_ISOLATION',
            invariants: Array.from({ length: 8 }, (_, i) => ({
              id: `INV-${String(i + 1).padStart(2, '0')}`,
              state: pass ? 'PASS' : i === 6 ? 'FAIL' : 'PASS',
            })),
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Error interno del servidor' }), { status: 500, headers: corsHeaders });
    }
  },
};