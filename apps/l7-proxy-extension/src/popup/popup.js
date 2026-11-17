document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const tenantInput = document.getElementById("tenant");
  const apiKeyInput = document.getElementById("apiKey");
  const userInput = document.getElementById("user");
  const failClosedInput = document.getElementById("failClosed");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // Elementos opcionales para mostrar el bloque de estado Detox en el popup (si existen en tu HTML)
  const detoxStatusBox = document.getElementById("detoxStatusBox");
  const detoxEngineLabel = document.getElementById("detoxEngine");
  const detoxStateLabel = document.getElementById("detoxState");
  const detoxRulesList = document.getElementById("detoxRules");

  try {
    const { saareConfig, lastDetoxStatus } = await chrome.storage.local.get(["saareConfig", "lastDetoxStatus"]);
    
    if (saareConfig) {
      if (saareConfig.apiUrl) apiUrlInput.value = saareConfig.apiUrl;
      if (saareConfig.tenantId) tenantInput.value = saareConfig.tenantId;
      if (saareConfig.apiKey) apiKeyInput.value = saareConfig.apiKey;
      if (saareConfig.userEmail) userInput.value = saareConfig.userEmail;
      if (saareConfig.failClosed !== undefined) failClosedInput.checked = Boolean(saareConfig.failClosed);
    }

    // Renderizar estado del último bloque Detox si la interfaz cuenta con el contenedor
    if (lastDetoxStatus && detoxStatusBox) {
      detoxStatusBox.style.display = "block";
      if (detoxEngineLabel) detoxEngineLabel.textContent = lastDetoxStatus.engine || "v1.1-DETOX-RAM-EDGE";
      if (detoxStateLabel) {
        detoxStateLabel.textContent = lastDetoxStatus.status || "CLEAN";
        detoxStateLabel.style.color = lastDetoxStatus.status === "SANITIZED" ? "#fbbf24" : "#34d399";
      }
      if (detoxRulesList && Array.isArray(lastDetoxStatus.rulesTriggered)) {
        detoxRulesList.textContent = lastDetoxStatus.rulesTriggered.length > 0 
          ? lastDetoxStatus.rulesTriggered.join(", ") 
          : "Ninguna (Tráfico limpio)";
      }
    }
  } catch (err) {
    console.error("[S.A.A.R.E. Popup Error]:", err);
  }

  saveBtn.addEventListener("click", async () => {
    let rawUrl = apiUrlInput.value.trim() || apiUrlInput.placeholder || "https://api.saare.es/v1/chat/completions";
    let cleanUrl = rawUrl.trim().replace(/\/+$/, "");

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }

    const tenantId = (tenantInput.value.trim() || tenantInput.placeholder || "DEMO_ENTERPRISE").trim();
    const apiKey = apiKeyInput.value.trim();
    const userEmail = (userInput.value.trim() || userInput.placeholder || "operador_l7@saare.local").trim().toLowerCase();
    const failClosed = Boolean(failClosedInput.checked);

    const saareConfig = {
      apiUrl: cleanUrl,
      tenantId,
      apiKey,
      userEmail,
      failClosed,
      updatedAt: new Date().toISOString()
    };

    try {
      await chrome.storage.local.set({ saareConfig });

      apiUrlInput.value = cleanUrl;
      tenantInput.value = tenantId;
      userInput.value = userEmail;

      statusDiv.style.color = "#34d399";
      statusDiv.textContent = `✅ Nodo L7 Vinculado (${tenantId})`;

      setTimeout(() => {
        statusDiv.textContent = "";
      }, 3500);
    } catch (err) {
      console.error("[S.A.A.R.E. Save Error]:", err);
      statusDiv.style.color = "#f87171";
      statusDiv.textContent = "❌ Error al guardar la configuración.";
    }
  });
});