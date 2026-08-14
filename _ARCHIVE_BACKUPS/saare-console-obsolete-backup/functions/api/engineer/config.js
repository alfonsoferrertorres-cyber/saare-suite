export async function onRequest(context) {
  const { request } = context;

  // Manejo de Preflight CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Respuesta para POST /api/engineer/config
  if (request.method === "POST" || request.method === "GET") {
    const responsePayload = {
      status: "OK",
      engine: "S.A.A.R.E. Core Engine v7.2",
      runtime_version: "0.1.1",
      timestamp: new Date().toISOString(),
      config: {
        active_scenario: "scen-corp-governance",
        security_level: "STRICT",
        hsm_protection: true,
        merkle_wills: true
      }
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
