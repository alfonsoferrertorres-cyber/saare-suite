const WORKER_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

// Resuelve la identidad corporativa de forma dinámica (GPO -> Storage Local -> No asignado)
async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    // 1. Prioridad: GPO corporativa / Managed Storage
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

    // 2. Fallback: Local Storage o usuario detectado en el DOM
    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "usuario_anonimo@tenant.es";
        const finalTenant = local?.saare_tenant_domain || "ORGANIZACION";
        resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant });
      });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentity(message.payload?.user).then(({ user, tenant }) => {
      const enrichedPayload = {
        ...message.payload,
        user: user,
        tenant: tenant
      };

      // Almacenamiento local en el navegador del usuario
      chrome.storage.local.get({ saare_logs: [] }, (result) => {
        const current = Array.isArray(result.saare_logs) ? result.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [enrichedPayload, ...current].slice(0, 100) });
      });

      // Envío dinámico al Worker KV
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