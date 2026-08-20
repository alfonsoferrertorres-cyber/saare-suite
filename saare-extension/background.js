const ENDPOINT = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=alfonsosb1@gmail.com";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "SAARE_LOG_EVENT") {
    // 1. Persistencia Local
    chrome.storage.local.get({ saare_logs: [] }, (result) => {
      const currentLogs = Array.isArray(result.saare_logs) ? result.saare_logs : [];
      const updatedLogs = [message.payload, ...currentLogs].slice(0, 100);
      chrome.storage.local.set({ saare_logs: updatedLogs });
    });

    // 2. Despacho Edge al Worker (sin CORS)
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload)
    })
      .then(res => sendResponse({ status: "SENT", ok: res.ok }))
      .catch(err => sendResponse({ status: "ERROR", error: err.message }));

    return true;
  }
});