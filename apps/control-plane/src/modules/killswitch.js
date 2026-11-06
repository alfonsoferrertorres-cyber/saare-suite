/**
 * Interceptor Killswitch para S.A.A.R.E. Control Plane
 */
export async function verifyKillswitch(env) {
  // 1. Comprobación rápida en la Bóveda KV (bandera de emergencia global)
  const isEmergencyLock = await env.SAARE_VAULT_KV.get("EMERGENCY_KILLSWITCH_ACTIVE");

  // 2. Comprobación de variable de entorno
  if (isEmergencyLock === "true" || env.ALLOW_FALLBACK_VAULT === "LOCKDOWN") {
    return new Response(
      JSON.stringify({
        status: "BLOCKED",
        error: "EMERGENCY_KILLSWITCH_TRIGGERED",
        message: "Acceso denegado por el protocolo de contención L7.",
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  return null; // Si no hay bloqueo, continúa el tráfico normal
}