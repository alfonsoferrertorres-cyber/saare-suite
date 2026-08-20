// SAARE L7 Engine - Background Service Worker
const USER_CONFIG = {
  endpoint: "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=alfonsosb1@gmail.com"
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("%c[SAARE L7] Service Worker inicializado con éxito.", "color: #06b6d4; font-weight: bold;");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "SAARE_LOG_EVENT") {
    // 1. Guardar copia local en Storage
    chrome.storage.local.get({ saare_logs: [] }, (result) => {
      const currentLogs = Array.isArray(result.saare_logs) ? result.saare_logs : [];
      const updatedLogs = [message.payload, ...currentLogs].slice(0, 100);
      chrome.storage.local.set({ saare_logs: updatedLogs });
    });

    // 2. Transmisión al API Gateway Worker en segundo plano
    fetch(USER_CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload)
    })
      .then((res) => sendResponse({ status: "SENT", ok: res.ok }))
      .catch((err) => sendResponse({ status: "ERROR", error: err.message }));

    return true; // Mantiene el canal abierto para respuesta asíncrona
  }
  return false;
});
