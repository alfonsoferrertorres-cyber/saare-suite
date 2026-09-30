// extension-base/background.js — Servidor de Fondo del Sensor L7 v10.5.2
const WORKER_URL = "https://api.saare.es";

function isNoisePayload(text) {
  if (!text || typeof text !== "string") return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("f.req=") ||
    lower.includes("bard_activity") ||
    lower.includes("generic") ||
    lower.includes("at=aovx") ||
    lower.startsWith("[[[\"")
  );
}

// Keep-Alive System anti-suspensión de Chrome Service Worker
chrome.alarms.create("saare_keep_alive", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "saare_keep_alive") {
    chrome.storage.local.get(["saare_user_email"], () => {});
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const res = await fetch(chrome.runtime.getURL("storage_managed.json"));
    if (res.ok) {
      const managedData = await res.json();
      const user = managedData?.saare_user_email?.Value || "";
      const tenant = managedData?.saare_tenant_domain?.Value || "ENTERPRISE";
      const token = managedData?.saare_token?.Value || "";

      if (user && token) {
        await chrome.storage.local.set({
          saare_user_email: user.toLowerCase().trim(),
          saare_tenant_domain: tenant,
          saare_token: token
        });
      }
    }
  } catch (e) {}
});

async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (local) => {
      if (local?.saare_user_email && local?.saare_token) {
        return resolve({
          user: local.saare_user_email.toLowerCase().trim(),
          tenant: local.saare_tenant_domain || "ENTERPRISE",
          token: local.saare_token
        });
      }

      if (chrome.storage?.managed) {
        chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (managed) => {
          const finalUser = managed?.saare_user_email || payloadUser || "ciso@saare.es";
          const finalTenant = managed?.saare_tenant_domain || "ENTERPRISE";
          const finalToken = managed?.saare_token || "sk_saare_guest_session";
          resolve({
            user: finalUser.toLowerCase().trim(),
            tenant: finalTenant,
            token: finalToken
          });
        });
      } else {
        const finalUser = payloadUser || "ciso@saare.es";
        resolve({
          user: finalUser.toLowerCase().trim(),
          tenant: "ENTERPRISE",
          token: "sk_saare_guest_session"
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    const rawPrompt = message.payload?.prompt || message.payload?.promptInput || message.payload?.rawPrompt || "";

    if (isNoisePayload(rawPrompt)) {
      sendResponse({ ok: true, status: "IGNORED_TELEMETRY_NOISE" });
      return false;
    }

    resolveIdentity(message.payload?.user).then(({ user, tenant, token }) => {
      const enrichedPayload = {
        ...message.payload,
        prompt: rawPrompt,
        user: user,
        tenant: tenant,
        node: message.payload?.node || "L7-SENSOR-NODE",
        merkleRoot: message.payload?.merkleRoot || "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842",
        timestamp: message.payload?.timestamp || new Date().toISOString()
      };

      // Guardar en caché local del navegador
      chrome.storage.local.get({ saare_logs: [] }, (result) => {
        const currentLogs = Array.isArray(result.saare_logs) ? result.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [enrichedPayload, ...currentLogs].slice(0, 100) });
      });

      // REGISTRO EN CONTROL PLANE: Apunta a /api/v1/intercept para persistir en D1
      fetch(`${WORKER_URL}/api/v1/intercept`, {
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

    return true;
  }

  if (message?.type === "SAARE_GET_RULES") {
    resolveIdentity().then(({ token, user, tenant }) => {
      fetch(`${WORKER_URL}/api/v1/custom-rules`, {
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