// S.A.A.R.E. Service Worker (Background Script) — Production Build (SGP 1.0)

async function handleExAnteInspection(promptText) {
  const storageData = await chrome.storage.local.get("saareConfig");
  const saareConfig = storageData?.saareConfig || {};
  
  let rawUrl = saareConfig.apiUrl || "https://api.saare.es";
  let cleanUrl = rawUrl.trim().replace(/\/+$/, "");
  cleanUrl = cleanUrl.replace(/\/api\/v1$/, "").replace(/\/api$/, "");
  
  const endpointUrl = `${cleanUrl}/v1/chat/completions`;

  // Fallbacks genéricos y neutros para producción (Zero-Hardcoded PII)
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

  // Payload multinivel agnóstico para el backend
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