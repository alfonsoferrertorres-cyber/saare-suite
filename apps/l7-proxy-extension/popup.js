// S.A.A.R.E. Popup Controller — Production Build (Fallback de Placeholders Activo)

document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const tenantInput = document.getElementById("tenant");
  const userInput = document.getElementById("user");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // 1. Recuperación dinámica de credenciales almacenadas
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

  // 2. Guardado seguro con fallback automático a placeholders si el campo está vacío
  saveBtn.addEventListener("click", async () => {
    const apiUrl = (apiUrlInput.value.trim() || apiUrlInput.placeholder || "https://api.saare.es").trim();
    const tenantId = (tenantInput.value.trim() || tenantInput.placeholder || "DEMO_ENTERPRISE").trim();
    const userEmail = (userInput.value.trim() || userInput.placeholder || "operador_anonimo@saare.local").trim().toLowerCase();

    if (!apiUrl || !tenantId || !userEmail) {
      statusDiv.style.color = "#f87171";
      statusDiv.textContent = "⚠️ Debe especificar un tenant y correo de operador.";
      return;
    }

    const saareConfig = {
      apiUrl,
      tenantId,
      userEmail,
      updatedAt: new Date().toISOString()
    };

    try {
      await chrome.storage.local.set({ saareConfig });
      
      // Refleja de inmediato los valores vinculados en la interfaz
      apiUrlInput.value = apiUrl;
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