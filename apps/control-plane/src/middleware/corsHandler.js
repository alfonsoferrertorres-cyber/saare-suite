// control-plane/src/middleware/corsHandler.js — Manejador de Cabeceras CORS Enterprise (SGP 1.0)

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
    "x-saare-provider",
    "x-saare-profile",
    "x-saare-browser-profile",
    "x-saare-client-profile",
    "x-saare-profile-email",
    "x-saare-signature",
    "x-saare-credential-proof",
    "x-saare-node-id",
    "X-Saare-Tenant",
    "X-Saare-User",
    "X-Saare-Role",
    "X-Saare-Plan",
    "X-Saare-Provider",
    "X-Saare-Profile",
    "X-Saare-Browser-Profile",
    "X-Saare-Client-Profile",
    "X-Saare-Profile-Email",
    "X-Saare-Signature",
    "X-Saare-Credential-Proof",
    "X-Saare-Node-Id"
  ].join(", "),
  "Access-Control-Expose-Headers": [
    "X-Saare-Permit",
    "X-SAARE-Verdict",
    "X-SAARE-Proof-Status",
    "X-SAARE-Latency-Ms",
    "X-SAARE-Spec",
    "X-SAARE-Tenant",
    "X-SAARE-Browser-Profile",
    "X-SAARE-Client-Profile",
    "X-SAARE-Witness-Tag",
    "X-SAARE-Provider",
    "X-SAARE-MS3V-Hash",
    "X-SAARE-MS3V-Timestamp",
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
  const origin = request?.headers?.get("Origin") || "";
  const allowOrigin = !origin || origin === "null" ? "*" : origin;

  const corsHeaders = {
    ...DEFAULT_CORS_HEADERS,
    "Access-Control-Allow-Origin": allowOrigin,
    ...(allowOrigin !== "*" ? { Vary: "Origin" } : {})
  };

  return {
    corsHeaders,
    preflightResponse: () =>
      new Response(null, {
        status: 204,
        headers: corsHeaders
      })
  };
}

export default handleCors;