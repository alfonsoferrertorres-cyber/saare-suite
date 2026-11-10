// S.A.A.R.E. Popup Controller — Alineado con background.js y DOM de popup.html

document.addEventListener("DOMContentLoaded", () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const tenantInput = document.getElementById("tenant");
  const userInput = document.getElementById("user");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  chrome.storage.local.get(["saareConfig"], (result) => {
    const config = result.saareConfig || {};
    apiUrlInput.value = config.apiUrl || "https://api.saare.es";
    tenantInput.value = config.tenantId || "ORGANISMO_DEMO_01";
    userInput.value = config.userEmail || "";
  });

  saveBtn.addEventListener("click", () => {
    let rawUrl = apiUrlInput.value.trim() || "https://api.saare.es";

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

    apiUrlInput.value = cleanUrl;

    chrome.storage.local.set({ saareConfig: config }, () => {
      statusDiv.innerText = "✓ Configuración Sincronizada";
      setTimeout(() => {
        statusDiv.innerText = "";
      }, 2500);
    });
  });
});