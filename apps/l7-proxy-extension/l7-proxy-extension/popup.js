// S.A.A.R.E. Popup Controller — Alineado con background.js y DOM de popup.html

document.addEventListener("DOMContentLoaded", () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const tenantInput = document.getElementById("tenant");
  const userInput = document.getElementById("user");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // 1. Cargar la configuración usando la clave exacta que espera background.js ("saareConfig")
  chrome.storage.local.get(["saareConfig"], (result) => {
    const config = result.saareConfig || {};
    apiUrlInput.value = config.apiUrl || "https://api.saare.es";
    tenantInput.value = config.tenantId || "";
    userInput.value = config.userEmail || "";
  });

  // 2. Guardar con saneamiento de URL y propiedades alineadas
  saveBtn.addEventListener("click", () => {
    let rawUrl = apiUrlInput.value.trim() || "https://api.saare.es";

    // Elimina prefijos /api/v1, /api, /v1 y barras finales para evitar duplicar la ruta en el Worker
    let cleanUrl = rawUrl.replace(/\/+$/, "");
    cleanUrl = cleanUrl.replace(/\/api\/v1$/, "").replace(/\/api$/, "").replace(/\/v1$/, "");
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }

    const config = {
      apiUrl: cleanUrl,
      tenantId: tenantInput.value.trim() || "ORGANISMO_DEMO_01",
      userEmail: userInput.value.trim() || "operador@empresa.com",
      authToken: "",
      enforceMode: true
    };

    // Reflejar la URL saneada en el input de la interfaz
    apiUrlInput.value = cleanUrl;

    // Guardar en chrome.storage.local bajo "saareConfig"
    chrome.storage.local.set({ saareConfig: config }, () => {
      statusDiv.innerText = "✓ Configuración Sincronizada";
      setTimeout(() => {
        statusDiv.innerText = "";
      }, 2500);
    });
  });
});