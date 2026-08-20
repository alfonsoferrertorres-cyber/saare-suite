const WORKER_URL = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SAARE_LOG_EVENT") {
    // 1. Almacenamiento local
    chrome.storage.local.get({ saare_logs: [] }, (result) => {
      const current = Array.isArray(result.saare_logs) ? result.saare_logs : [];
      chrome.storage.local.set({ saare_logs: [message.payload, ...current].slice(0, 100) });
    });

    // 2. Envío seguro al Worker KV
    fetch(`${WORKER_URL}/runs?user=alfonsosb1@gmail.com`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload)
    })
    .then(res => res.json())
    .then(data => sendResponse({ ok: true, data }))
    .catch(err => sendResponse({ ok: false, error: err.message }));

    return true;
  }

  if (message?.type === "SAARE_GET_RULES") {
    fetch(`${WORKER_URL}/custom-rules`)
      .then(res => res.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, data: [] }));

    return true;
  }
});