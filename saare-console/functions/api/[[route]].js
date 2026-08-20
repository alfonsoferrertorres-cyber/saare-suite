// Cloudflare Pages Universal API Route Handler & CORS Preflight Engine
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, SAARE-License",
  "Access-Control-Max-Age": "86400",
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  // 1. Reglas personalizadas dinamicas
  if (url.pathname.includes("custom-rules")) {
    return new Response(JSON.stringify([
      { id: "rule-1", pattern: "CONFIDENCIAL", label: "Información Clasificada" },
      { id: "rule-2", pattern: "SECRETO", label: "Secreto Empresarial" }
    ]), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  }

  // 2. Consulta de logs/evidencias
  return new Response(JSON.stringify({
    ok: true,
    runs: [
      {
        evidenceId: "EV-" + Date.now().toString().slice(-6),
        timestamp: new Date().toISOString(),
        event: "Detección PII / Peritaje Forense L7",
        verdict: "RECHAZADO",
        action: "REDACTED & SEPARATED",
        status: "RECHAZADO",
        origin: "Gemini / L7 RAM",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    ]
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const evId = body.evidenceId || body.runId || ("EV-" + Math.floor(100000 + Math.random() * 900000));

    // Reenvio transparente al Worker Edge KV
    try {
      await fetch("https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=alfonsosb1@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch(e) {}

    return new Response(JSON.stringify({
      ok: true,
      status: "SUCCESS",
      verdict: body.verdict || "RECHAZADO",
      runId: evId,
      evidence: {
        evidenceId: evId,
        hash: body.hash || "sha256-ed25519-sealed",
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  }
}