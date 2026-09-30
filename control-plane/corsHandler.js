// control-plane/corsHandler.js — Manejador de Cabeceras HTTP CORS (SGP 1.0)

export function handleCors(request) {
  const origin = request.headers.get("Origin") || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-saare-user, x-saare-tenant, x-saare-role, x-saare-node, x-saare-spec, x-saare-plan",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400"
  };

  return {
    corsHeaders,
    preflightResponse: () => new Response(null, { status: 204, headers: corsHeaders })
  };
}