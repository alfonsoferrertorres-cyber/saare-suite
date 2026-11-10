async function handleExAnteInspection(promptText) {
  const { saareConfig } = await chrome.storage.local.get("saareConfig");
  let rawUrl = saareConfig?.apiUrl || DEFAULT_API_URL;
  
  // Normalización robusta: Elimina barras finales, '/api/v1' y cualquier '/api' al final
  let cleanUrl = rawUrl.trim().replace(/\/+$/, "");
  cleanUrl = cleanUrl.replace(/\/api\/v1$/, "").replace(/\/api$/, "");
  
  // El endpoint final correcto apuntará siempre a https://api.saare.es/v1/chat/completions
  const endpointUrl = `${cleanUrl}/v1/chat/completions`;

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