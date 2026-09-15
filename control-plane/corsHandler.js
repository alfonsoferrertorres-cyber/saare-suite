// control-plane/corsHandler.js — Gestor de CORS Seguro S.A.A.R.E. Enterprise
export function handleCors(request) {
  const origin = request.headers.get("Origin") || "";
  
  // Validación estricta mediante regex y dominios permitidos
  const isAllowedOrigin = (
    /^https:\/\/(?:[a-zA-Z0-9-]+\.)*saare\.es$/.test(origin) ||
    /^https:\/\/(?:[a-zA-Z0-9-]+\.)*pages\.dev$/.test(origin) ||
    origin.startsWith("chrome-extension://") ||
    origin.startsWith("edge-extension://") ||
    /^http:\/\/localhost(?::\d+)?$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)
  );

  // Si el origen es permitido, se devuelve exactamente el origen solicitante.
  // De lo contrario, se asigna el dominio por defecto de la consola.
  const allowedOriginHeader = isAllowedOrigin ? origin : "https://console.saare.es";
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOriginHeader,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Saare-Client, x-saare-token, x-saare-tenant, x-saare-user, X-Saare-Token, X-Saare-Tenant, X-Saare-User",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin" // Notifica a las cachés intermedias que la respuesta depende del origen
  };

  return {
    corsHeaders,
    isPreflight: request.method === "OPTIONS",
    preflightResponse: () => new Response(null, { status: 204, headers: corsHeaders })
  };
}