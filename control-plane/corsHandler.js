// control-plane/corsHandler.js — Manejador de Cabeceras CORS Enterprise
export const DEFAULT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Saare-Tenant, X-Saare-User, X-Saare-Role, X-Saare-Plan, X-Saare-Signature",
  "Access-Control-Expose-Headers": "X-SAARE-Verdict, X-SAARE-Proof-Status, X-SAARE-Latency-Ms, X-SAARE-Spec"
};

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