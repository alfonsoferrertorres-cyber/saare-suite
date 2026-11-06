document.addEventListener("DOMContentLoaded", () => {
  const tenantInput = document.getElementById("tenantId");
  const apiInput = document.getElementById("apiUrl");
  const tokenInput = document.getElementById("authToken");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Cargar configuración guardada
  chrome.storage.local.get(["saareConfig"], (res) => {
    const config = res.saareConfig || {};
    tenantInput.value = config.tenantId || "ORGANISMO_DEMO_01";
    apiInput.value = config.apiUrl || "https://api.saare.es";
    tokenInput.value = config.authToken || "";
  });

  // Guardar configuración
  saveBtn.addEventListener("click", () => {
    const updatedConfig = {
      tenantId: tenantInput.value.trim() || "ORGANISMO_DEMO_01",
      apiUrl: apiInput.value.trim() || "https://api.saare.es",
      authToken: tokenInput.value.trim(),
      enforceMode: true
    };

    chrome.storage.local.set({ saareConfig: updatedConfig }, () => {
      statusMsg.textContent = "Conexión Vinculada Correctamente";
      setTimeout(() => { statusMsg.textContent = ""; }, 2500);
    });
  });
});