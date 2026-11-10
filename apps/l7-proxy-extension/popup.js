// S.A.A.R.E. Popup Controller — Production Build

document.addEventListener("DOMContentLoaded", async () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const tenantInput = document.getElementById("tenant");
  const userInput = document.getElementById("user");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // Recuperación dinámica de credenciales almacenadas
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

  // Guardado seguro y sanitizado en storage local
  saveBtn.addEventListener("click", async () => {
    const apiUrl = apiUrlInput.value.trim();
    const tenantId = tenantInput.value.trim();
    const userEmail = userInput.value.trim().toLowerCase();

    if (!apiUrl || !tenantId || !userEmail) {
      statusDiv.style.color = "#f87171";
      statusDiv.textContent = "⚠️ Debe completar todos los campos.";
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
      statusDiv.style.color = "#34d399";
      statusDiv.textContent = "✅ Nodo L7 Vinculado con éxito.";
      
      setTimeout(() => {
        statusDiv.textContent = "";
      }, 3000);
    } catch (err) {
      console.error("[S.A.A.R.E. Save Error]:", err);
      statusDiv.style.color = "#f87171";
      statusDiv.textContent = "❌ Error al guardar la configuración.";
    }
  });
});