// S.A.A.R.E. Popup Controller - Production Build (UTF-8 / SGP 1.0)

document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const tenantInput = document.getElementById("tenant");
  const userInput = document.getElementById("user");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // 1. Cargar credenciales guardadas en chrome.storage.local
  try {
    const { saareConfig } = await chrome.storage.local.get("saareConfig");
    if (saareConfig) {
      if (saareConfig.apiUrl) apiUrlInput.value = saareConfig.apiUrl;
      if (saareConfig.tenantId) tenantInput.value = saareConfig.tenantId;
      if (saareConfig.userEmail) userInput.value = saareConfig.userEmail;
    }
  } catch (err) {
    console.error("[S.A.A.R.E. Popup Error]:", err);
  }

  // 2. Guardar y normalizar credenciales con fallback seguro
  saveBtn.addEventListener("click", async () => {
    let rawUrl = apiUrlInput.value.trim() || apiUrlInput.placeholder || "https://api.saare.es";
    let cleanUrl = rawUrl.trim().replace(/\/+$/, "");
    cleanUrl = cleanUrl.replace(/\/api\/v1$/, "").replace(/\/api$/, "");

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }

    const tenantId = (tenantInput.value.trim() || tenantInput.placeholder || "DEMO_ENTERPRISE").trim();
    const userEmail = (userInput.value.trim() || userInput.placeholder || "operador_anonimo@saare.local").trim().toLowerCase();

    const saareConfig = {
      apiUrl: cleanUrl,
      tenantId,
      userEmail,
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