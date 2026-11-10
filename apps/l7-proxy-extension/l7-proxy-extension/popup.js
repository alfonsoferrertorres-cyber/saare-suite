document.addEventListener("DOMContentLoaded", () => {
  const tenantInput = document.getElementById("tenantId");
  const emailInput = document.getElementById("userEmail");
  const apiInput = document.getElementById("apiUrl");
  const tokenInput = document.getElementById("authToken");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Cargar configuración guardada (sin hardcodeo de correos personales)
  chrome.storage.local.get(["saareConfig"], (res) => {
    const config = res.saareConfig || {};
    tenantInput.value = config.tenantId || "ORGANISMO_DEMO_01";
    emailInput.value = config.userEmail || "";
    apiInput.value = config.apiUrl || "https://api.saare.es/api/v1";
    tokenInput.value = config.authToken || "";
  });

  // Guardar configuración en storage local de la extensión
  saveBtn.addEventListener("click", () => {
    const updatedConfig = {
      tenantId: tenantInput.value.trim() || "ORGANISMO_DEMO_01",
      userEmail: emailInput.value.trim(),
      apiUrl: apiInput.value.trim() || "https://api.saare.es/api/v1",
      authToken: tokenInput.value.trim(),
      enforceMode: true
    };

    chrome.storage.local.set({ saareConfig: updatedConfig }, () => {
      statusMsg.textContent = "🛡️ Conexión Vinculada Correctamente";
      setTimeout(() => { statusMsg.textContent = ""; }, 2500);
    });
  });
});