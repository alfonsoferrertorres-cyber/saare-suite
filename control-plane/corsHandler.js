// control-plane CORS Manager optimizado y corregido
export function handleCors(request) {
  const origin = request.headers.get("Origin") || "";
  
  const isAllowedOrigin =
    origin.endsWith(".saare.es") ||
    origin === "https://saare.es" ||
    origin.endsWith(".pages.dev") || // Crucial para Cloudflare Pages (*.pages.dev)
    origin.startsWith("chrome-extension://") ||
    origin.startsWith("edge-extension://") ||
    origin === "http://localhost:3000" ||
    origin === "http://localhost:3001" ||
    origin.startsWith("http://localhost:"); // Soporte flexible para entornos de desarrollo local

  const allowedOriginHeader = isAllowedOrigin ? origin : "https://console.saare.es";
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOriginHeader,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Saare-Client, x-saare-token, x-saare-tenant, x-saare-user",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400"
  };

  return {
    corsHeaders,
    isPreflight: request.method === "OPTIONS",
    preflightResponse: () => new Response(null, { status: 204, headers: corsHeaders })
  };
}