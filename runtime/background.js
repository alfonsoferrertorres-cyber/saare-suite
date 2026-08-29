/**
 * S.A.A.R.E. L7 Governance Agent Background Service Worker v10.0
 * ISO/IEC 27037:2012 (DEFR / DES) · UNE-ISO/IEC 42001:2023 · Cloudflare KV Live Sync
 */

const WORKER_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

// 1. Resuelve la identidad corporativa: Managed Storage (GPO) -> Local Storage -> Payload -> Fallback
async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    if (chrome.storage?.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain"], (managed) => {
        if (managed?.saare_user_email) {
          return resolve({
            user: managed.saare_user_email.toLowerCase().trim(),
            tenant: managed.saare_tenant_domain || "Gabinete Jurídico y Pericial MS3V"
          });
        }
        fallbackLocal();
      });
    } else {
      fallbackLocal();
    }

    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "auditor@ms3v.es";
        const finalTenant = local?.saare_tenant_domain || "Gabinete Jurídico y Pericial MS3V";
        resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant });
      });
    }
  });
}

// 2. Sincronización periódica de directivas y sub-opciones desde Cloudflare KV
async function syncDynamicSettings() {
  const { user } = await resolveIdentity();
  if (user && user !== "usuario_anonimo@tenant.es") {
    try {
      const res = await fetch(`${WORKER_URL}/settings?user=${encodeURIComponent(user)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          await chrome.storage.local.set({
            saare_settings: {
              ...data.settings,
              subOptions: data.subOptions || {}
            }
          });
        }
      }
    } catch (e) {
      // Tolerante a micro-cortes de red
    }
  }
}

// 3. Ciclo de vida en Manifest V3 (Alarmas persistentes en lugar de setInterval)
chrome.runtime.onInstalled.addListener(() => {
  syncDynamicSettings();
  chrome.alarms.create("saare_sync_alarm", { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(() => {
  syncDynamicSettings();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "saare_sync_alarm") {
    syncDynamicSettings();
  }
});

// 4. Recepción y enrutamiento de telemetría forense
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentity(message.payload?.user).then(({ user, tenant }) => {
      const enrichedPayload = {
        ...message.payload,
        user: user,
        tenant: tenant,
        scenario_id: message.payload?.scenario_id || "cumplimiento_corporativo_integral",
        forensic_role: message.payload?.forensic_role || "DEFR (Digital Evidence First Responder)",
        timestamp: message.payload?.timestamp || new Date().toISOString()
      };

      // Buffer local en el navegador
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

    return true; // Mantiene abierto el canal para respuesta asíncrona
  }

  if (message?.type === "SAARE_GET_RULES") {
    resolveIdentity().then(({ user }) => {
      fetch(`${WORKER_URL}/custom-rules?user=${encodeURIComponent(user)}`)
        .then(res => res.json())
        .then(data => sendResponse({ ok: true, data }))
        .catch(() => sendResponse({ ok: false, data: [] }));
    });

    return true;
  }
});