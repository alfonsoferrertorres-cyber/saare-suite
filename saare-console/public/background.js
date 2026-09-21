// SAARE L7 Sovereign Sensor - Service Worker (Background Engine v10.2.2)
const WORKER_URL = "https://api.saare.es/api/v1";

/**
 * Filtro de Ruido L7 para excluir llamadas internas de telemetría de Gemini/Google
 */
function isNoisePayload(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("f.req=") ||
    lower.includes("bard_activity") ||
    lower.includes("generic") ||
    lower.includes("at=aovx") ||
    lower.startsWith("[[[\"")
  );
}

/**
 * Carga e inyección dinámica al instalar o recargar la extensión.
 * Parsea el storage_managed.json inyectado al descargar el ZIP.
 */
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const res = await fetch(chrome.runtime.getURL("storage_managed.json"));
    if (res.ok) {
      const managedData = await res.json();
      const user = managedData?.saare_user_email?.Value || "";
      const tenant = managedData?.saare_tenant_domain?.Value || "ENTERPRISE";
      const token = managedData?.saare_token?.Value || "sk_saare_live_managed_identity";

      if (user) {
        await chrome.storage.local.set({
          saare_user_email: user.toLowerCase().trim(),
          saare_tenant_domain: tenant,
          saare_token: token
        });
        console.log("[SAARE Sensor] Identity synchronized for:", user);
      }
    }
  } catch (e) {
    console.error("[SAARE Sensor] Error loading storage_managed.json:", e);
  }
});

/**
 * Resuelve dinámicamente la identidad priorizando chrome.storage.local
 */
async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (local) => {
      if (local?.saare_user_email) {
        return resolve({
          user: local.saare_user_email.toLowerCase().trim(),
          tenant: local.saare_tenant_domain || "ENTERPRISE",
          token: local.saare_token || "sk_saare_live_managed_identity"
        });
      }

      // Fallback a Enterprise Managed (MDM) si local está vacío
      if (chrome.storage?.managed) {
        chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (managed) => {
          const finalUser = managed?.saare_user_email || payloadUser || "";
          const finalTenant = managed?.saare_tenant_domain || "ENTERPRISE";
          const finalToken = managed?.saare_token || "sk_saare_live_managed_identity";
          resolve({
            user: finalUser.toLowerCase().trim(),
            tenant: finalTenant,
            token: finalToken
          });
        });
      } else {
        const finalUser = payloadUser || "";
        resolve({
          user: finalUser.toLowerCase().trim(),
          tenant: "ENTERPRISE",
          token: "sk_saare_live_managed_identity"
        });
      }
    });
  });
}

/**
 * Listener principal para ingesta de evidencias y telemetría
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    const rawPrompt = message.payload?.prompt || message.payload?.rawPrompt || "";

    // BLOQUEO EX-ANTE DE RUIDO: Ignora si es telemetría de red interna
    if (isNoisePayload(rawPrompt)) {
      sendResponse({ ok: true, status: "IGNORED_TELEMETRY_NOISE" });
      return false;
    }

    resolveIdentity(message.payload?.user).then(({ user, tenant, token }) => {
      const enrichedPayload = {
        ...message.payload,
        user: user,
        tenant: tenant,
        node: message.payload?.node || "2607076315021",
        merkleRoot: message.payload?.merkleRoot || "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842",
        timestamp: message.payload?.timestamp || new Date().toISOString()
      };

      // Guardado local (máx 100 trazas)
      chrome.storage.local.get({ saare_logs: [] }, (result) => {
        const currentLogs = Array.isArray(result.saare_logs) ? result.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [enrichedPayload, ...currentLogs].slice(0, 100) });
      });

      // Envío a la Bóveda con cabeceras Multi-Tenant explícitas
      fetch(`${WORKER_URL}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Bearer ${token}`,
          "x-saare-user": user,
          "x-saare-tenant": tenant
        },
        body: JSON.stringify(enrichedPayload)
      })
      .then(async (res) => {
        const data = await res.json();
        sendResponse({ ok: res.ok, data });
      })
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    });

    return true; // Mantiene abierto el canal IPC asíncrono
  }

  if (message?.type === "SAARE_GET_RULES") {
    resolveIdentity().then(({ token, user, tenant }) => {
      fetch(`${WORKER_URL}/custom-rules`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-saare-user": user,
          "x-saare-tenant": tenant
        }
      })
      .then((res) => res.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, data: [], error: err.message }));
    });

    return true;
  }
});