// S.A.A.R.E. Background Service Worker — Enrutador Agnóstico y Punto PEP L7

const DEFAULT_API_URL = "https://api.saare.es";
const DEFAULT_TENANT = "ORGANISMO_DEMO_01";

// Cargar o inicializar la configuración dinámica por defecto
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["saareConfig"], (result) => {
    if (!result.saareConfig) {
      chrome.storage.local.set({
        saareConfig: {
          apiUrl: DEFAULT_API_URL,
          tenantId: DEFAULT_TENANT,
          userEmail: "operator@saare.es",
          authToken: "",
          enforceMode: true
        }
      });
    }
  });
});

// Manejador de comunicaciones en segundo plano
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INSPECT_PROMPT_EX_ANTE") {
    handleExAnteInspection(request.payload)
      .then((verdict) => sendResponse({ success: true, verdict }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Mantiene el canal abierto para respuesta asíncrona
  }
});

// Ejecutar la petición al Worker de Cloudflare
async function handleExAnteInspection(promptText) {
  const { saareConfig } = await chrome.storage.local.get("saareConfig");
  const apiUrl = saareConfig?.apiUrl || DEFAULT_API_URL;
  const tenantId = saareConfig?.tenantId || DEFAULT_TENANT;
  const token = saareConfig?.authToken || "";

  const headers = {
    "Content-Type": "application/json",
    "x-saare-tenant": tenantId
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body = JSON.stringify({
    prompt: promptText,
    tenant: tenantId,
    user: saareConfig?.userEmail || "anonymous_operator",
    provider: "AGNOSTIC_WEB_PROXY"
  });

  const response = await fetch(`${apiUrl}/v1/chat/completions`, {
    method: "POST",
    headers: headers,
    body: body
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error en Control Plane (${response.status}): ${errText}`);
  }

  return await response.json();
}