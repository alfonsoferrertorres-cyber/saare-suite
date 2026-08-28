/**
 * S.A.A.R.E. L7 Governance Agent Background Service Worker v8.2.0
 */

const WORKER_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

// Resuelve la identidad corporativa: Managed Storage (GPO) -> Local Storage -> Fallback
async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    if (chrome.storage?.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
        if (managed?.saare_user_email) {
          return resolve({
            user: managed.saare_user_email.toLowerCase().trim(),
            tenant: managed.saare_tenant_domain || "EMPRESA"
          });
        }
        fallbackLocal();
      });
    } else {
      fallbackLocal();
    }

    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "usuario_anonimo@tenant.es";
        const finalTenant = local?.saare_tenant_domain || "ORGANIZACION";
        resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant });
      });
    }
  });
}

// Sincronización periódica de directivas activas desde Cloudflare KV cada 5 segundos
async function syncDynamicSettings() {
  const { user } = await resolveIdentity();
  if (user && user !== "usuario_anonimo@tenant.es") {
    try {
      const res = await fetch(`${WORKER_URL}/settings?user=${encodeURIComponent(user)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          chrome.storage.local.set({ saare_settings: data.settings });
        }
      }
    } catch (e) {
      // Sincronización tolerante a fallos de red
    }
  }
}

setInterval(syncDynamicSettings, 5000);
syncDynamicSettings();

// Recepción y enrutamiento de eventos forenses
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentity(message.payload?.user).then(({ user, tenant }) => {
      const enrichedPayload = {
        ...message.payload,
        user: user,
        tenant: tenant
      };

      // Guardar en almacenamiento local del navegador
      chrome.storage.local.get({ saare_logs: [] }, (result) => {
        const current = Array.isArray(result.saare_logs) ? result.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [enrichedPayload, ...current].slice(0, 100) });
      });

      // Transmisión directa hacia la Bóveda KV en Cloudflare
      fetch(`${WORKER_URL}/runs?user=${encodeURIComponent(user)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrichedPayload)
      })
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    });

    return true;
  }

  if (message?.type === "SAARE_GET_RULES") {
    fetch(`${WORKER_URL}/custom-rules`)
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, data: [] }));

    return true;
  }
});