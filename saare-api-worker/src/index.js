// S.A.A.R.E. Cloudflare Edge API Worker - Clean Production Engine
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, SAARE-License",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Reglas dinámicas
    if (url.pathname.includes("custom-rules")) {
      return new Response(JSON.stringify([
        { id: "rule-1", pattern: "CONFIDENCIAL", label: "Información Clasificada" },
        { id: "rule-2", pattern: "SECRETO", label: "Secreto Empresarial" }
      ]), {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS }
      });
    }

    // Bóveda de Evidencias Forenses
    if (url.pathname.includes("runs")) {
      const user = url.searchParams.get("user") || "alfonsosb1@gmail.com";
      const kvKey = `runs:${user}`;

      if (request.method === "GET") {
        let storedRuns = [];
        if (env.SAARE_KV) {
          const raw = await env.SAARE_KV.get(kvKey);
          if (raw) storedRuns = JSON.parse(raw);
        }
        return new Response(JSON.stringify(storedRuns), {
          status: 200,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
      }

      if (request.method === "POST") {
        const body = await request.json();
        const evId = body.evidenceId || body.runId || ("EV-" + Math.floor(100000 + Math.random() * 900000));
        
        const newRecord = {
          evidenceId: evId,
          timestamp: body.timestamp || new Date().toISOString(),
          event: body.event || (body.verdict === "RECHAZADO" ? "Exfiltración PII" : "Interacción Conforme"),
          verdict: body.verdict || "RECHAZADO",
          action: body.action || (body.verdict === "RECHAZADO" ? "REDACTED (RAM)" : "LOGGED"),
          status: body.status || body.verdict || "RECHAZADO",
          origin: body.origin || "Gemini / L7 RAM",
          promptInput: body.promptInput || body.rawText || "",
          hash: body.hash || "sha256-sealed",
          user: user
        };

        if (env.SAARE_KV) {
          const existingRaw = await env.SAARE_KV.get(kvKey);
          const list = existingRaw ? JSON.parse(existingRaw) : [];
          const updated = [newRecord, ...list].slice(0, 100);
          await env.SAARE_KV.put(kvKey, JSON.stringify(updated));
        }

        return new Response(JSON.stringify({
          ok: true,
          status: "SUCCESS",
          verdict: newRecord.verdict,
          runId: evId,
          evidence: newRecord
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS }
        });
      }
    }

    return new Response(JSON.stringify({ status: "ONLINE", service: "S.A.A.R.E. API Gateway L7" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  }
};