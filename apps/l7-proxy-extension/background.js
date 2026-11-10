// S.A.A.R.E. Service Worker (Background Script) — Production Build (SGP 1.0 Virginized)

// Carga automática de credenciales desde config/credentials.json al instalar o recargar
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const configUrl = chrome.runtime.getURL("config/credentials.json");
    const res = await fetch(configUrl);
    const credentials = await res.json();

    const saareConfig = {
      tenantId: credentials.tenantId || "DEMO_ENTERPRISE",
      userEmail: credentials.operatorEmail || "operador_anonimo@saare.local",
      apiUrl: credentials.gatewayEndpoint || "https://api.saare.es/v1/chat/completions",
      vaultAnchor: credentials.vaultAnchor || "https://vault.saare.es",
      version: credentials.version || "1.0.0",
      spec: credentials.spec || "SGP 1.0"
    };

    await chrome.storage.local.set({ saareConfig });
    console.log("[S.A.A.R.E. Background] Credenciales de plantilla vinculadas en storage:", saareConfig);
  } catch (err) {
    console.error("[S.A.A.R.E. Background] Error al cargar config/credentials.json:", err);
  }
});

async function handleExAnteInspection(promptText) {
  const storageData = await chrome.storage.local.get("saareConfig");
  const saareConfig = storageData?.saareConfig || {};
  
  let rawUrl = saareConfig.apiUrl || "https://api.saare.es/v1/chat/completions";
  let cleanUrl = rawUrl.trim().replace(/\/+$/, "");
  
  const endpointUrl = cleanUrl.endsWith("/v1/chat/completions")
    ? cleanUrl
    : `${cleanUrl.replace(/\/api\/v1$/, "").replace(/\/api$/, "")}/v1/chat/completions`;

  const tenantId = (saareConfig.tenantId || "DEMO_ENTERPRISE").trim();
  const userEmail = (saareConfig.userEmail || "operador_anonimo@saare.local").trim().toLowerCase();
  const token = saareConfig.authToken || "";

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
    input: promptText,
    messages: [{ role: "user", content: promptText }],
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INSPECT_PROMPT_EX_ANTE") {
    handleExAnteInspection(request.payload)
      .then(data => sendResponse({ success: true, verdict: data }))
      .catch(err => {
        console.error("[S.A.A.R.E. Background Error]:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
});