// SAARE L7 Background Service Worker (SGP 1.0) - Production Runtime

/**
 * Resuelve la identidad y credenciales activas del sensor desde Managed o Local Storage
 */
async function getActiveIdentity(providedUser) {
  return new Promise((resolve) => {
    chrome.storage.managed.get(
      ["saare_user_email", "saare_tenant_domain", "saare_bootstrap_token", "endpoint"],
      (managed) => {
        chrome.storage.local.get(
          ["saare_user_email", "saare_tenant_domain", "saare_bootstrap_token", "endpoint"],
          (local) => {
            const user = providedUser || managed?.saare_user_email || local?.saare_user_email || "auditor@tenant.local";
            const tenant = managed?.saare_tenant_domain || local?.saare_tenant_domain || "SAARE_CORP_ADMIN";
            const apiKey = managed?.saare_bootstrap_token || local?.saare_bootstrap_token || "sk_saare_live_master_kv_session";
            const endpoint = managed?.endpoint || local?.endpoint || "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

            resolve({ user, tenant, apiKey, endpoint });
          }
        );
      }
    );
  });
}

/**
 * Transmite los Proof Bundles y evidencias hacia la API/Worker de Cloudflare
 */
async function uploadEvidenceToCloud(payload, identity) {
  if (!identity?.endpoint) {
    console.warn("[SAARE Cloud KV] Endpoint no definido. Omitiendo envío.");
    return false;
  }

  const targetUrl = `${identity.endpoint}/runs?user=${encodeURIComponent(identity.user)}`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${identity.apiKey}`,
        "X-Saare-Client": "L7-Browser-Sensor-V10"
      },
      body: JSON.stringify(payload)
    });

    if (response?.ok) {
      const result = await response.json();
      console.log("[SAARE Cloud KV] Evidencia almacenada correctamente:", result);
      return true;
    } else {
      console.error("[SAARE Cloud KV] Error del servidor. Código HTTP:", response?.status);
      return false;
    }
  } catch (error) {
    console.error("[SAARE Cloud KV] Fallo de red al conectar con Cloudflare Worker:", error);
    return false;
  }
}

/**
 * Escuchador global de mensajes en tiempo real (Intercepción desde content.js e inject.js)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT" || message?.type === "SAARE_EVIDENCE_RECORD") {
    const rawPayload = message?.payload || {};

    getActiveIdentity(rawPayload?.user).then(async (identity) => {
      const enrichedPayload = {
        ...rawPayload,
        user: identity.user,
        tenant: identity.tenant,
        cloudSyncTimestamp: new Date().toISOString()
      };

      const isSuccess = await uploadEvidenceToCloud(enrichedPayload, identity);
      sendResponse({ 
        status: isSuccess ? "ACK_CLOUD_DISPATCHED" : "ACK_CLOUD_FAILED",
        timestamp: new Date().toISOString()
      });
    });

    return true; 
  }
});

self.addEventListener("error", (event) => {
  console.warn("[SAARE Protection Guard] Excepción no capturada neutralizada:", event?.message);
});