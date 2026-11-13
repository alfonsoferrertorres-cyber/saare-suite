/**
 * Interceptor Killswitch para S.A.A.R.E. Control Plane
 */
export async function verifyKillswitch(env) {
  let isEmergencyLock = false;

  if (env?.SAARE_VAULT_KV) {
    try {
      const lockVal = await env.SAARE_VAULT_KV.get("EMERGENCY_KILLSWITCH_ACTIVE");
      isEmergencyLock = lockVal === "true";
    } catch (e) {
      console.warn("[Killswitch KV Warning]:", e.message);
    }
  }

  if (isEmergencyLock || String(env?.ALLOW_FALLBACK_VAULT || "").toUpperCase() === "LOCKDOWN") {
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

  return null;
}

export default verifyKillswitch;