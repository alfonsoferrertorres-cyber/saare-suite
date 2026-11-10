// S.A.A.R.E. Background Service Worker — Enrutador Agnóstico y Punto PEP L7

const DEFAULT_API_URL = "https://api.saare.es";
const DEFAULT_TENANT = "ORGANISMO_DEMO_01";

// Inicializar la configuración predeterminada de forma limpia
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["saareConfig"], (result) => {
    if (!result.saareConfig) {
      chrome.storage.local.set({
        saareConfig: {
          apiUrl: DEFAULT_API_URL,
          tenantId: DEFAULT_TENANT,
          userEmail: "",
          authToken: "",
          enforceMode: true
        }
      });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INSPECT_PROMPT_EX_ANTE") {
    handleExAnteInspection(request.payload)
      .then((verdict) => sendResponse({ success: true, verdict }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; 
  }
});

async function handleExAnteInspection(promptText) {
  const { saareConfig } = await chrome.storage.local.get("saareConfig");
  let rawUrl = saareConfig?.apiUrl || DEFAULT_API_URL;
  
  // Normalización estricta: Elimina barras finales y corrige '/api/v1' por '/v1'
  let cleanUrl = rawUrl.trim().replace(/\/+$/, "");
  cleanUrl = cleanUrl.replace(/\/api\/v1$/, "/v1").replace(/\/api$/, "");
  
  const endpointUrl = cleanUrl.endsWith("/v1/chat/completions")
    ? cleanUrl
    : (cleanUrl.endsWith("/v1") ? `${cleanUrl}/chat/completions` : `${cleanUrl}/v1/chat/completions`);

  const tenantId = saareConfig?.tenantId || DEFAULT_TENANT;
  const userEmail = saareConfig?.userEmail || "operador_anonimo";
  const token = saareConfig?.authToken || "";

  const headers = {
    "Content-Type": "application/json",
    "x-saare-tenant": tenantId,
    "x-saare-user": userEmail
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body = JSON.stringify({
    prompt: promptText,
    tenant: tenantId,
    user: userEmail,
    provider: "AGNOSTIC_WEB_PROXY"
  });

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: headers,
    body: body
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Error en Control Plane (${response.status}): ${errText}`);
  }

  return await response.json();
}