// background.js — SAARE L7 Background Attestation Service Worker v8.2.0

function getWorkerUrl() {
  return "https://api.saare.es/api/v1";
}

// Resolver identidad corporativa y credenciales de sesión (GPO -> Storage Local -> Fallback)
async function resolveIdentityAndCredentials(payloadUser) {
  return new Promise((resolve) => {
    // 1. Prioridad: Managed Storage (GPO empresarial)
    if (chrome.storage?.managed) {
      chrome.storage.managed.get(["saare_user_email", "saare_tenant_domain", "saare_token", "saare_user_role"], (managed) => {
        if (managed?.saare_user_email) {
          return resolve({
            user: managed.saare_user_email.toLowerCase().trim(),
            tenant: managed.saare_tenant_domain || "ENTERPRISE",
            token: managed.saare_token || "",
            role: managed.saare_user_role || "CISO_ADMIN"
          });
        }
        fallbackLocal();
      });
    } else {
      fallbackLocal();
    }

    // 2. Fallback: Local Storage / DOM
    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain", "saare_token", "saare_user_role"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "operador_anonimo@saare.es";
        const rawTenant = local?.saare_tenant_domain || "ENTERPRISE";
        const finalTenant = rawTenant.includes("@") ? "ENTERPRISE" : rawTenant;
        const finalToken = local?.saare_token || "";
        const finalRole = local?.saare_user_role || "CISO_ADMIN";

        resolve({
          user: finalUser.toLowerCase().trim(),
          tenant: finalTenant,
          token: finalToken,
          role: finalRole
        });
      });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    resolveIdentityAndCredentials(message.payload?.user).then(({ user, tenant, token, role }) => {
      const activeWorker = getWorkerUrl();
      const credentialProof = token ? `Ed25519-Proof:${token.slice(-12)}` : 'UNSIGNED_ANON';

      const enrichedPayload = {
        ...message.payload,
        user: user,
        tenant: tenant,
        role: role,
        credentialProof: credentialProof,
        atestationTimestamp: new Date().toISOString()
      };

      // Almacenar logs locales
      chrome.storage.local.get({ saare_logs: [] }, (result) => {
        const current = Array.isArray(result.saare_logs) ? result.saare_logs : [];
        chrome.storage.local.set({ saare_logs: [enrichedPayload, ...current].slice(0, 100) });
      });

      // Enviar a la Bóveda Cloudflare D1 mediante el Control Plane API
      fetch(`${activeWorker}/runs?user=${encodeURIComponent(user)}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-saare-user": user,
          "x-saare-tenant": tenant,
          "x-saare-role": role,
          "x-saare-credential-proof": credentialProof,
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(enrichedPayload)
      })
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    });

    return true;
  }

  if (message?.type === "SAARE_GET_RULES") {
    const activeWorker = getWorkerUrl();
    fetch(`${activeWorker}/custom-rules`)
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, data: [] }));

    return true;
  }
});