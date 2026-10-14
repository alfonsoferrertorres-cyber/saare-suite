// background.js — SAARE L7 Background Attestation Service Worker v8.2.0

function getWorkerUrl() {
  return "https://api.saare.es/api/v1";
}

// Generador e inyector dinámico del icono del testigo para la barra del navegador
function updateExtensionIcon(colorHex, labelText) {
  try {
    chrome.action.setBadgeBackgroundColor({ color: colorHex });
    chrome.action.setBadgeText({ text: labelText });
  } catch (e) {}
}

chrome.runtime.onInstalled.addListener(() => {
  updateExtensionIcon("#0284c7", "L7");
});

// Resolver identidad corporativa y credenciales de sesión
async function resolveIdentityAndCredentials(payloadUser) {
  return new Promise((resolve) => {
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

    function fallbackLocal() {
      chrome.storage.local.get(["saare_user_email", "saare_tenant_domain", "saare_token", "saare_user_role"], (local) => {
        const finalUser = local?.saare_user_email || payloadUser || "ciso@saare.es";
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

// Interceptor y transmisor de eventos hacia api.saare.es
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

      // Cambiar el color del testigo en la barra según el veredicto
      if (enrichedPayload.verdict === "RECHAZADO") {
        updateExtensionIcon("#ef4444", "BLOCK");
      } else {
        updateExtensionIcon("#10b981", "OK");
      }

      // Enviar evidencia a Cloudflare D1
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
});