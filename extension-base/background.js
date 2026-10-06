// extension-base/background.js — Servidor de Fondo del Sensor L7 v10.5.3

const WORKER_URL = "https://api.saare.es"; // Cambiar a "http://localhost:8787" en pruebas locales

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
      const user = managedData?.saare_user_email?.Value || "ciso@saare.es";
      const tenant = managedData?.saare_tenant_domain?.Value || "ENTERPRISE";
      const token = managedData?.saare_token?.Value || "sk_saare_live_session";

      await chrome.storage.local.set({
        saare_user_email: user.toLowerCase().trim(),
        saare_tenant_domain: tenant.toUpperCase().trim(),
        saare_token: token
      });
    }
  } catch (e) {
    console.warn("[SAARE Background] Falling back to default identity initialization.", e);
  }
});

async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (local) => {
      if (local?.saare_user_email && local?.saare_token) {
        return resolve({
          user: local.saare_user_email.toLowerCase().trim(),
          tenant: (local.saare_tenant_domain || "ENTERPRISE").toUpperCase().trim(),
          token: local.saare_token
        });
      }

      if (chrome.storage?.managed) {
        chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (managed) => {
          const finalUser = managed?.saare_user_email || payloadUser || "ciso@saare.es";
          const finalTenant = managed?.saare_tenant_domain || "ENTERPRISE";
          const finalToken = managed?.saare_token || "sk_saare_live_session";
          resolve({
            user: finalUser.toLowerCase().trim(),
            tenant: finalTenant.toUpperCase().trim(),
            token: finalToken
          });
        });
      } else {
        const finalUser = payloadUser || "ciso@saare.es";
        resolve({
          user: finalUser.toLowerCase().trim(),
          tenant: "ENTERPRISE",
          token: "sk_saare_live_session"
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
        evidence_id: message.payload?.evidence_id || `EV-L7-${Math.floor(Math.random() * 900000) + 100000}`,
        prompt: rawPrompt,
        promptInput: rawPrompt,
        user: user,
        tenant: tenant,
        decision: message.payload?.decision || "ALLOW",
        verdict: message.payload?.verdict || (message.payload?.decision === "DENY" ? "RECHAZADO" : "PERMITIDO"),
        node: message.payload?.node || "L7-SENSOR-NODE",
        merkleRoot: message.payload?.merkleRoot || "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842",
        timestamp: message.payload?.timestamp || new Date().toISOString()
      };

      chrome.storage.local.get({ saare_logs: [] }, (result) => {
        const currentLogs = Array.isArray(result.saare_logs) ? result.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [enrichedPayload, ...currentLogs].slice(0, 100) });
      });

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
        const data = await res.json().catch(() => ({}));
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