async function handleExAnteInspection(promptText) {
  const { saareConfig } = await chrome.storage.local.get("saareConfig");
  let rawUrl = saareConfig?.apiUrl || "https://api.saare.es";
  
  let cleanUrl = rawUrl.trim().replace(/\/+$/, "");
  cleanUrl = cleanUrl.replace(/\/api\/v1$/, "").replace(/\/api$/, "");
  
  const endpointUrl = `${cleanUrl}/v1/chat/completions`;

  const tenantId = saareConfig?.tenantId || "ORGANISMO_DEMO_01";
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INSPECT_PROMPT_EX_ANTE") {
    handleExAnteInspection(request.payload)
      .then(data => sendResponse({ success: true, verdict: data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; 
  }
});