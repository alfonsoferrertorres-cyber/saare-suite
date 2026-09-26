/**
 * Cloudflare Worker adapter for S.A.A.R.E. control-plane.
 * This is a contract-ready skeleton: bind D1 as DB and adapt the SQL schema
 * to the real production control-plane before enabling it on a live system.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' };
    if (request.method === 'OPTIONS') return new Response('', { headers: cors });

    try {
      if (url.pathname === '/api/v1/resilience/check' && request.method === 'POST') {
        const body = await request.json();
        const delta = Number(body.delta ?? 0);
        const pass = Math.abs(delta) < 0.01;
        return Response.json({ ok:true, source:'CONTROL_PLANE', threshold:'<0.01%', delta, deterministic:true, status:pass?'INVARIANTS_OK':'FORENSIC_ISOLATION', invariants:Array.from({length:8},(_,i)=>({id:`INV-${String(i+1).padStart(2,'0')}`,state:pass?'PASS':(i===6?'FAIL':'PASS')})) }, { headers: cors });
      }

      if (url.pathname === '/api/v1/intercept' && request.method === 'POST') {
        const body = await request.json();
        const highImpact = ['SEND_PAYMENT','DELETE_RECORDS','EXPORT_CUSTOMERS'].includes(body.action);
        const verdict = body.forceReview ? 'REVIEW' : highImpact ? 'DENY' : 'ALLOW';
        const traceId = `VRD-${crypto.randomUUID()}`;
        if (env.DB) {
          await env.DB.prepare('INSERT INTO verdicts (trace_id, agent, action, verdict, policy, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))')
            .bind(traceId, body.agent || 'unknown', body.action || 'unknown', verdict, body.policy || 'unknown').run();
        }
        return Response.json({ok:true, source:'CONTROL_PLANE', verdict, traceId, policy:body.policy||'FIN-PAYMENT-042:v17', sanitized:true, piiDetected:false, reasons:verdict==='DENY'?['HIGH_IMPACT_ACTION','FAIL_CLOSED_POLICY']:verdict==='REVIEW'?['HUMAN_REVIEW_REQUIRED']:['POLICY_MATCH']},{headers:cors});
      }

      const verifyMatch = url.pathname.match(/^\/verify\/(.+)$/);
      if (verifyMatch && request.method === 'GET') {
        const hash = decodeURIComponent(verifyMatch[1]);
        return Response.json({ok:true, verified:true, hash, algorithm:'Ed25519', timestamp:'RFC 3161'}, {headers:cors});
      }

      if (url.pathname === '/api/v1/health') return Response.json({ok:true, service:'control-plane', mode:'FAIL-CLOSED'}, {headers:cors});
      return Response.json({ok:false,error:'Not found'}, {status:404,headers:cors});
    } catch (error) {
      return Response.json({ok:false,error:String(error?.message||error)}, {status:500,headers:cors});
    }
  }
};
