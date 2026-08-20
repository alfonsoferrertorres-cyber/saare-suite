export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ENDPOINT: /api/v1/runs
    if (url.pathname === "/api/v1/runs") {
      const user = url.searchParams.get("user") || "alfonsosb1@gmail.com";
      const kvKey = `runs:${user}`;

      // 1. GET: Consultar SAARE_KV y entregar a saare-console
      if (request.method === "GET") {
        try {
          const rawData = await env.SAARE_KV.get(kvKey, { type: "json" });
          const runsList = Array.isArray(rawData) ? rawData : [];
          return new Response(JSON.stringify({
            user: user,
            total: runsList.length,
            runs: runsList
          }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Error consultando KV", details: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }

      // 2. POST: Recibir evidencia desde saare-extension y persistir en SAARE_KV
      if (request.method === "POST") {
        try {
          const payload = await request.json();
          const rawData = await env.SAARE_KV.get(kvKey, { type: "json" });
          let currentRuns = Array.isArray(rawData) ? rawData : [];

          // Insertar en la primera posición y truncar a 100 registros
          currentRuns.unshift(payload);
          currentRuns = currentRuns.slice(0, 100);

          await env.SAARE_KV.put(kvKey, JSON.stringify(currentRuns));

          return new Response(JSON.stringify({
            status: "CONFORME",
            message: "Evidencia registrada en SAARE_KV",
            evidenceId: payload.evidenceId
          }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Error escribiendo en KV", details: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }
    }

    return new Response(JSON.stringify({ error: "Endpoint no encontrado" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};
