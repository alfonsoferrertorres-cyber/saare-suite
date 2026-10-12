// control-plane/corsHandler.js — Manejador de Cabeceras CORS Enterprise (SGP 1.0)

export const DEFAULT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": [
    "Content-Type",
    "Authorization",
    "Accept",
    "x-saare-spec",
    "x-saare-tenant",
    "x-saare-user",
    "x-saare-role",
    "x-saare-plan",
    "x-saare-signature",
    "X-Saare-Tenant",
    "X-Saare-User",
    "X-Saare-Role",
    "X-Saare-Plan",
    "X-Saare-Signature"
  ].join(", "),
  "Access-Control-Expose-Headers": [
    "X-SAARE-Verdict",
    "X-SAARE-Proof-Status",
    "X-SAARE-Latency-Ms",
    "X-SAARE-Spec",
    "x-saare-spec"
  ].join(", "),
  "Access-Control-Max-Age": "86400"
};

/**
 * Gestiona la configuración CORS dinámica para las solicitudes entrantes del Control Plane
 * @param {Request} request 
 * @returns {{ corsHeaders: Record<string, string>, preflightResponse: () => Response }}
 */
export function handleCors(request) {
  const origin = request.headers.get("Origin") || "*";
  
  const corsHeaders = {
    ...DEFAULT_CORS_HEADERS,
    "Access-Control-Allow-Origin": origin === "null" ? "*" : origin
  };

  return {
    corsHeaders,
    preflightResponse: () => new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  };
}

export default handleCors;