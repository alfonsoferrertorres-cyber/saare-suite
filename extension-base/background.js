const WORKER_URL = "https://api.saare.es/api/v1";

async function resolveIdentity(payloadUser) {
  return new Promise((resolve) => {
    if (chrome.storage?.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (managed) => {
        if (managed?.saare_user_email) {
          return resolve({
            user: managed.saare_user_email.toLowerCase().trim(),
            tenant: managed.saare_tenant_domain || "ENTERPRISE",
            token: managed.saare_token || "sk_saare_live_managed_identity"
          });
        }
        fallbackLocal();
      });
    } else {
      fallbackLocal();
    }

    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain", "saare_token"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "legal@saare.es";
        const finalTenant = local?.saare_tenant_domain || "ENTERPRISE";
        const finalToken = local?.saare_token || "sk_saare_live_managed_identity";
        resolve({ user: finalUser.toLowerCase().trim(), tenant: finalTenant, token: finalToken });
      });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentity(message.payload?.user).then(({ user, tenant, token }) => {
      const enrichedPayload = { 
        ...message.payload, 
        user: user, 
        tenant: tenant,
        node: "2607076315021",
        merkleRoot: message.payload?.merkleRoot || "6f1b3986a4221147814b7e9a8f420e7df61a5b823e4299b9e671b569c7f1a842"
      };

      chrome.storage.local.get({ saare_logs: [] }, (result) => {
        const current = Array.isArray(result.saare_logs) ? result.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [enrichedPayload, ...current].slice(0, 100) });
      });

      fetch(`${WORKER_URL}/runs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(enrichedPayload)
      })
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    });
    return true;
  }
});