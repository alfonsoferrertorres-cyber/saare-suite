export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Email",
    };

    // 1. Manejo de preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 2. ENDPOINT: /api/v1/runs
    if (url.pathname === "/api/v1/runs") {
      
      // GET: Consultar SAARE_KV y entregar a saare-console
      if (request.method === "GET") {
        const user = url.searchParams.get("user") || request.headers.get("X-User-Email") || "alfonsosb1@gmail.com";
        const kvKey = `runs:${user}`;

        try {
          const rawData = await env.SAARE_KV.get(kvKey, { type: "json" });
          const runsList = Array.isArray(rawData) ? rawData : [];

          return new Response(
            JSON.stringify({
              user: user,
              total: runsList.length,
              runs: runsList,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: "Error consultando KV", details: err.message }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
      }

      // POST: Recibir evidencia forense y persistir en SAARE_KV
      if (request.method === "POST") {
        try {
          const payload = await request.json();

          const user = payload.user || url.searchParams.get("user") || request.headers.get("X-User-Email") || "alfonsosb1@gmail.com";
          const kvKey = `runs:${user}`;

          // Estructura completa preservando la firma pericial y atributos DLP
          const evidenceEntry = {
            evidenceId: payload.evidenceId || `EV-${Math.floor(100000 + Math.random() * 900000)}`,
            timestamp: payload.timestamp || new Date().toISOString(),
            event: payload.event || (payload.verdict === "RECHAZADO" ? "Exfiltración PII Bloqueada" : "Interacción IA Conforme"),
            verdict: payload.verdict || payload.status || "CONFORME",
            status: payload.status || payload.verdict || "CONFORME",
            action: payload.action || (payload.verdict === "RECHAZADO" ? "REDACTED (RAM)" : "LOGGED"),
            user: user,
            licenseKey: payload.licenseKey || "SAARE-MASTER-2026-ROOT-001",
            origin: payload.origin || "gemini.google.com",
            violationDetails: payload.violationDetails || { isViolation: false, category: "NINGUNA" },
            hash: payload.hash || null,
            metadata: { ...payload.metadata }
          };

          // Sanitización de seguridad: eliminar contraseñas o tokens crudos si vinieran en metadata
          delete evidenceEntry.metadata.apiKey;
          delete evidenceEntry.metadata.password;
          delete evidenceEntry.metadata.token;

          // Recuperar histórico en memoria KV
          const rawData = await env.SAARE_KV.get(kvKey, { type: "json" });
          let currentRuns = Array.isArray(rawData) ? rawData : [];

          // Pila LIFO: registrar al inicio y limitar a los últimos 100 registros
          currentRuns.unshift(evidenceEntry);
          currentRuns = currentRuns.slice(0, 100);

          await env.SAARE_KV.put(kvKey, JSON.stringify(currentRuns));

          return new Response(
            JSON.stringify({
              status: "CONFORME",
              message: "Evidencia registrada en SAARE_KV",
              evidenceId: evidenceEntry.evidenceId,
            }),
            {
              status: 201,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: "Error procesando payload o escribiendo en KV", details: err.message }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ error: "Endpoint no encontrado" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  },
};